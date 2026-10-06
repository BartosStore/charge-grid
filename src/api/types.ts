export type StationStatus = 'charging' | 'available' | 'reserved' | 'fault' | 'offline';
export const STATION_STATUSES: StationStatus[] = ['charging', 'available', 'reserved', 'fault', 'offline'];

export type ConnectorType = 'Type2' | 'CCS' | 'CHAdeMO';
export type Role = 'admin' | 'operator' | 'viewer';
export type AlarmSeverity = 'critical' | 'warning' | 'info';

export interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface Tariff {
  id: string;
  name: string;
  pricePerKwh: number;
  pricePerMinute: number;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  locationId: string;
  tariffId: string;
  connector: ConnectorType;
  maxPowerKw: number;
  maxTemperatureC: number;
  commissionedAt: string;
  enabled: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface LiveSnapshot {
  stationId: string;
  ts: number;
  status: StationStatus;
  powerKw: number;
  voltageV: number;
  temperatureC: number;
  sessionKwh: number;
  sessionStartedAt: number | null;
}

export interface TimelineSegment {
  stationId: string;
  status: StationStatus;
  from: number;
  to: number;
}

export interface Sample {
  ts: number;
  powerKw: number;
  voltageV: number;
  temperatureC: number;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  startedAt: number;
  endedAt: number;
  energyKwh: number;
  cost: number;
  idTag: string;
}

export interface Alarm {
  id: string;
  stationId: string;
  severity: AlarmSeverity;
  code: string;
  raisedAt: number;
  clearedAt: number | null;
  acknowledgedBy: string | null;
}

export interface DailyEnergy {
  date: string;
  locationId: string;
  energyKwh: number;
}

export interface StationUtilization {
  stationId: string;
  shares: Record<StationStatus, number>;
  energyKwh: number;
  sessions: number;
}

export interface Statistics {
  energyByDay: DailyEnergy[];
  utilization: StationUtilization[];
  totalEnergyKwh: number;
  totalSessions: number;
  totalRevenue: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type LiveMessage = { type: 'snapshot'; data: LiveSnapshot[] };
