import type {
  Alarm, AlarmSeverity, ChargingSession, DailyEnergy, LiveSnapshot, Sample, Station, StationStatus,
  StationUtilization, Statistics, TimelineSegment,
} from '../api/types';
import { createRandom, hashSeed } from './random';
import { db } from './db';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Relative demand for charging during the day (0–1). */
const DEMAND_BY_HOUR = [
  0.12, 0.08, 0.06, 0.06, 0.08, 0.15, 0.35, 0.6, 0.65, 0.5, 0.45, 0.5,
  0.55, 0.5, 0.45, 0.55, 0.7, 0.8, 0.75, 0.6, 0.45, 0.35, 0.25, 0.18,
];

const FAULT_CODES = ['E_OVERTEMP', 'E_COMM_LOST', 'E_RCD_TRIP', 'E_GROUND_FAULT'] as const;

export const startOfDay = (ts: number) => {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const isDc = (station: Station) => station.connector !== 'Type2';

/* ---------------------------------------------------------------- timeline */

const dayCache = new Map<string, TimelineSegment[]>();

/** Generates the full (unclipped) status timeline of one station for one day. */
function generateDay(station: Station, dayStart: number): TimelineSegment[] {
  const key = `${station.id}|${station.maxPowerKw}|${station.connector}|${station.enabled}|${dayStart}`;
  const cached = dayCache.get(key);
  if (cached) return cached;

  const dayEnd = dayStart + DAY;
  const segments: TimelineSegment[] = [];
  if (!station.enabled) {
    segments.push({ stationId: station.id, status: 'offline', from: dayStart, to: dayEnd });
    dayCache.set(key, segments);
    return segments;
  }

  const random = createRandom(hashSeed(station.id, new Date(dayStart).toDateString()));
  const popularity = 0.6 + (hashSeed(station.id) % 60) / 100;
  const push = (status: StationStatus, minutes: number) => {
    const from = segments.length ? segments[segments.length - 1].to : dayStart;
    const to = Math.min(from + Math.round(minutes) * MINUTE, dayEnd);
    if (to > from) segments.push({ stationId: station.id, status, from, to });
  };

  let cursor = dayStart;
  while (cursor < dayEnd) {
    const hour = new Date(cursor).getHours();
    const demand = Math.min(0.95, DEMAND_BY_HOUR[hour] * popularity);

    if (random.chance(0.006)) {
      push('fault', random.between(20, 240));
    } else if (random.chance(0.004)) {
      push('offline', random.between(30, 300));
    } else if (random.chance(demand)) {
      if (random.chance(0.12)) push('reserved', random.between(5, 15));
      push('charging', isDc(station) ? random.between(15, 50) : random.between(60, 240));
    } else {
      push('available', random.between(10, 90) * (1.2 - demand));
    }
    cursor = segments[segments.length - 1].to;
  }

  dayCache.set(key, segments);
  return segments;
}

/** Status timeline of a station clipped to [from, min(to, now)]. */
export function getTimeline(station: Station, from: number, to: number, now = Date.now()): TimelineSegment[] {
  const end = Math.min(to, now);
  const result: TimelineSegment[] = [];
  for (let day = startOfDay(from); day < end; day += DAY) {
    for (const segment of generateDay(station, day)) {
      if (segment.to <= from || segment.from >= end) continue;
      const clipped = { ...segment, from: Math.max(segment.from, from), to: Math.min(segment.to, end) };
      const last = result[result.length - 1];
      if (last && last.status === clipped.status && last.to === clipped.from) last.to = clipped.to;
      else result.push(clipped);
    }
  }
  return result;
}

function segmentAt(station: Station, ts: number): TimelineSegment {
  const segments = generateDay(station, startOfDay(ts));
  return segments.find((segment) => ts >= segment.from && ts < segment.to) ?? segments[segments.length - 1];
}

/* ------------------------------------------------------------ physical model */

/** Small deterministic noise in range <-1, 1> derived from time. */
const noise = (ts: number, salt: number) =>
  Math.sin(ts / 41_000 + salt) * 0.6 + Math.sin(ts / 9_000 + salt * 3) * 0.4;

const vehicleLimitCache = new Map<string, number>();

function vehicleLimitKw(station: Station, segment: TimelineSegment) {
  const key = `${station.id}|${station.maxPowerKw}|${segment.from}`;
  let limit = vehicleLimitCache.get(key);
  if (limit === undefined) {
    const random = createRandom(hashSeed(station.id, segment.from));
    const options = isDc(station) ? [50, 100, 150, 250] : [7.4, 11, 22];
    limit = Math.min(station.maxPowerKw, random.pick(options));
    vehicleLimitCache.set(key, limit);
  }
  return limit;
}

function powerAt(station: Station, segment: TimelineSegment, ts: number): number {
  if (segment.status !== 'charging') return 0;
  const progress = (ts - segment.from) / (segment.to - segment.from);
  const limit = vehicleLimitKw(station, segment);
  const taper = isDc(station)
    ? progress < 0.5 ? 1 : Math.max(0.2, 1 - (progress - 0.5) * 1.6)
    : progress < 0.9 ? 1 : 0.6;
  const rampUp = Math.min(1, (ts - segment.from) / (2 * MINUTE));
  return Math.max(0, limit * taper * rampUp * (1 + noise(ts, segment.from % 97) * 0.03));
}

function ambientAt(ts: number) {
  const hour = new Date(ts).getHours() + new Date(ts).getMinutes() / 60;
  return 14 + 6 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
}

function temperatureAt(station: Station, segment: TimelineSegment, ts: number): number {
  const ambient = ambientAt(ts) + noise(ts, 7) * 0.6;
  if (segment.status === 'fault' && faultCode(segment) === 'E_OVERTEMP') return station.maxTemperatureC + 4 + noise(ts, 3);
  if (segment.status === 'offline') return ambient;
  const load = powerAt(station, segment, ts) / station.maxPowerKw;
  return ambient + 8 + load * (isDc(station) ? 26 : 18);
}

function voltageAt(station: Station, segment: TimelineSegment, ts: number): number {
  if (segment.status === 'offline' || segment.status === 'fault') return 0;
  if (segment.status === 'charging' && isDc(station)) {
    const progress = (ts - segment.from) / (segment.to - segment.from);
    return 360 + progress * 60 + noise(ts, 11) * 2;
  }
  return 400 + noise(ts, 13) * 4;
}

function energyBetween(station: Station, segment: TimelineSegment, from: number, to: number) {
  let energy = 0;
  for (let ts = from; ts < to; ts += MINUTE) {
    energy += powerAt(station, segment, ts) * (Math.min(MINUTE, to - ts) / 3_600_000);
  }
  return energy;
}

/* ------------------------------------------------------------- public API */

export function getSamples(station: Station, from: number, to: number, now = Date.now()): Sample[] {
  const end = Math.min(to, now);
  const range = end - from;
  const step = range <= DAY ? MINUTE : range <= 7 * DAY ? 5 * MINUTE : 15 * MINUTE;
  const samples: Sample[] = [];
  for (let ts = from; ts < end; ts += step) {
    const segment = segmentAt(station, ts);
    samples.push({
      ts,
      powerKw: round(powerAt(station, segment, ts), 1),
      voltageV: round(voltageAt(station, segment, ts), 0),
      temperatureC: round(temperatureAt(station, segment, ts), 1),
    });
  }
  return samples;
}

export function getLiveSnapshot(station: Station, now = Date.now()): LiveSnapshot {
  const segment = segmentAt(station, now);
  const charging = segment.status === 'charging';
  return {
    stationId: station.id,
    ts: now,
    status: segment.status,
    powerKw: round(powerAt(station, segment, now), 1),
    voltageV: round(voltageAt(station, segment, now), 0),
    temperatureC: round(temperatureAt(station, segment, now), 1),
    sessionKwh: charging ? round(energyBetween(station, segment, segment.from, now), 2) : 0,
    sessionStartedAt: charging ? segment.from : null,
  };
}

export function getSessions(stations: Station[], from: number, to: number, now = Date.now()): ChargingSession[] {
  const sessions: ChargingSession[] = [];
  for (const station of stations) {
    const tariff = db.tariffs.find((item) => item.id === station.tariffId);
    // Sessions are taken from the whole timeline so that clipping does not cut them.
    for (const day of daysBetween(from, to)) {
      for (const segment of generateDay(station, day)) {
        if (segment.status !== 'charging' || segment.to > now || segment.from < from || segment.from >= to) continue;
        const energyKwh = sessionEnergy(station, segment);
        const minutes = (segment.to - segment.from) / MINUTE;
        sessions.push({
          id: `ses-${station.id}-${segment.from}`,
          stationId: station.id,
          startedAt: segment.from,
          endedAt: segment.to,
          energyKwh,
          cost: tariff ? round(energyKwh * tariff.pricePerKwh + minutes * tariff.pricePerMinute, 2) : 0,
          idTag: `RFID-${(hashSeed(station.id, segment.from) % 0xffff).toString(16).toUpperCase().padStart(4, '0')}`,
        });
      }
    }
  }
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

const sessionEnergyCache = new Map<string, number>();

function sessionEnergy(station: Station, segment: TimelineSegment) {
  const key = `${station.id}|${station.maxPowerKw}|${segment.from}|${segment.to}`;
  let energy = sessionEnergyCache.get(key);
  if (energy === undefined) {
    energy = round(energyBetween(station, segment, segment.from, segment.to), 2);
    sessionEnergyCache.set(key, energy);
  }
  return energy;
}

const toIsoDate = (ts: number) => {
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function getStatistics(stations: Station[], from: number, to: number, now = Date.now()): Statistics {
  const sessions = getSessions(stations, from, to, now);
  const stationById = new Map(stations.map((station) => [station.id, station]));

  const energyByKey = new Map<string, DailyEnergy>();
  const perStation = new Map<string, { energyKwh: number; sessions: number }>();
  for (const session of sessions) {
    const station = stationById.get(session.stationId)!;
    const date = toIsoDate(session.startedAt);
    const key = `${date}|${station.locationId}`;
    const entry = energyByKey.get(key) ?? { date, locationId: station.locationId, energyKwh: 0 };
    entry.energyKwh = round(entry.energyKwh + session.energyKwh, 2);
    energyByKey.set(key, entry);

    const totals = perStation.get(station.id) ?? { energyKwh: 0, sessions: 0 };
    totals.energyKwh += session.energyKwh;
    totals.sessions += 1;
    perStation.set(station.id, totals);
  }

  const utilization: StationUtilization[] = stations.map((station) => {
    const durations: Record<StationStatus, number> = { charging: 0, available: 0, reserved: 0, fault: 0, offline: 0 };
    let total = 0;
    for (const segment of getTimeline(station, from, to, now)) {
      durations[segment.status] += segment.to - segment.from;
      total += segment.to - segment.from;
    }
    const shares = Object.fromEntries(
      Object.entries(durations).map(([status, duration]) => [status, total ? round(duration / total, 4) : 0]),
    ) as Record<StationStatus, number>;
    const totals = perStation.get(station.id);
    return { stationId: station.id, shares, energyKwh: round(totals?.energyKwh ?? 0, 1), sessions: totals?.sessions ?? 0 };
  });

  return {
    energyByDay: [...energyByKey.values()].sort((a, b) => a.date.localeCompare(b.date)),
    utilization,
    totalEnergyKwh: round(sessions.reduce((sum, session) => sum + session.energyKwh, 0), 1),
    totalSessions: sessions.length,
    totalRevenue: round(sessions.reduce((sum, session) => sum + session.cost, 0), 0),
  };
}

function faultCode(segment: TimelineSegment) {
  return FAULT_CODES[hashSeed(segment.stationId, segment.from) % FAULT_CODES.length];
}

export function getAlarms(stations: Station[], from: number, to: number, now = Date.now()): Alarm[] {
  const alarms: Alarm[] = [];
  for (const station of stations) {
    if (!station.enabled) continue;
    for (const segment of getTimeline(station, from, to, now)) {
      if (segment.status !== 'fault' && segment.status !== 'offline') continue;
      const id = `alm-${station.id}-${segment.from}`;
      const cleared = segment.to < now - MINUTE;
      const severity: AlarmSeverity = segment.status === 'fault' ? 'critical' : 'warning';
      const autoAcknowledged = cleared && now - segment.to > DAY ? 'operator' : null;
      alarms.push({
        id,
        stationId: station.id,
        severity,
        code: segment.status === 'fault' ? faultCode(segment) : 'W_OFFLINE',
        raisedAt: segment.from,
        clearedAt: cleared ? segment.to : null,
        acknowledgedBy: db.acknowledgements.get(id) ?? autoAcknowledged,
      });
    }
  }
  return alarms.sort((a, b) => b.raisedAt - a.raisedAt);
}

function daysBetween(from: number, to: number) {
  const days: number[] = [];
  for (let day = startOfDay(from); day < to; day += DAY) days.push(day);
  return days;
}

export { daysBetween, DAY, MINUTE };

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;
