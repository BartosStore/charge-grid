import { delay, http, HttpResponse, ws, type DefaultBodyType, type PathParams } from 'msw';
import { API_URL, LIVE_INTERVAL_MS, LIVE_URL } from '../api/config';
import type { LiveMessage, Role, Station, User } from '../api/types';
import { getAlarms, getLiveSnapshot, getSamples, getSessions, getStatistics, getTimeline, DAY } from './generators';
import { db, HISTORY_DAYS, nextId } from './db';

const api = (path: string) => `${API_URL}${path}`;
const latency = () => delay(120 + Math.random() * 250);

/* ------------------------------------------------------------------ helpers */

const tokenFor = (user: User) => `demo.${btoa(user.id)}`;

function currentUser(request: Request): User | undefined {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token?.startsWith('demo.')) return undefined;
  try {
    const id = atob(token.slice(5));
    return db.users.find((user) => user.id === id && user.active);
  } catch {
    return undefined;
  }
}

const ROLE_RANK: Record<Role, number> = { viewer: 0, operator: 1, admin: 2 };

/** Returns an error response when the request is not allowed, otherwise undefined. */
function authorize(request: Request, minimalRole: Role = 'viewer') {
  const user = currentUser(request);
  if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (ROLE_RANK[user.role] < ROLE_RANK[minimalRole]) return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
  return undefined;
}

function parseRange(request: Request) {
  const params = new URL(request.url).searchParams;
  const now = Date.now();
  const earliest = now - HISTORY_DAYS * DAY;
  const from = Math.max(Number(params.get('from')) || now - DAY, earliest);
  const to = Math.min(Number(params.get('to')) || now, now);
  return { from, to: Math.max(from, to), params };
}

function filterStations(params: URLSearchParams): Station[] {
  const locationId = params.get('locationId');
  const stationId = params.get('stationId');
  return db.stations.filter(
    (station) => (!locationId || station.locationId === locationId) && (!stationId || station.id === stationId),
  );
}

/** Generic REST CRUD over one in-memory collection. */
function crud<T extends { id: string }>(path: string, collection: () => T[], prefix: string, writeRole: Role = 'admin') {
  return [
    http.get(api(path), async ({ request }) => {
      await latency();
      return authorize(request) ?? HttpResponse.json(collection());
    }),
    http.post<PathParams, Omit<T, 'id'>>(api(path), async ({ request }) => {
      await latency();
      const denied = authorize(request, writeRole);
      if (denied) return denied;
      const item = { ...(await request.json()), id: nextId(prefix) } as T;
      collection().push(item);
      return HttpResponse.json(item, { status: 201 });
    }),
    http.put<{ id: string }, T>(api(`${path}/:id`), async ({ request, params }) => {
      await latency();
      const denied = authorize(request, writeRole);
      if (denied) return denied;
      const items = collection();
      const index = items.findIndex((item) => item.id === params.id);
      if (index < 0) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      items[index] = { ...items[index], ...(await request.json()), id: params.id };
      return HttpResponse.json(items[index]);
    }),
    http.delete<{ id: string }, DefaultBodyType>(api(`${path}/:id`), async ({ request, params }) => {
      await latency();
      const denied = authorize(request, writeRole);
      if (denied) return denied;
      const items = collection();
      const index = items.findIndex((item) => item.id === params.id);
      if (index >= 0) items.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

/* ----------------------------------------------------------------- handlers */

const live = ws.link(LIVE_URL);

export const handlers = [
  http.post<PathParams, { username: string; password: string }>(api('/auth/login'), async ({ request }) => {
    await delay(500);
    const { username, password } = await request.json();
    const user = db.users.find((item) => item.username === username.trim().toLowerCase());
    if (!user || password !== user.username) {
      return HttpResponse.json({ message: 'invalidCredentials' }, { status: 401 });
    }
    if (!user.active) return HttpResponse.json({ message: 'userInactive' }, { status: 403 });
    return HttpResponse.json({ token: tokenFor(user), user });
  }),

  http.get(api('/auth/me'), async ({ request }) => {
    await latency();
    const user = currentUser(request);
    return user ? HttpResponse.json(user) : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  ...crud('/locations', () => db.locations, 'loc'),
  ...crud('/tariffs', () => db.tariffs, 'tar'),
  ...crud('/users', () => db.users, 'usr'),
  ...crud('/stations', () => db.stations, 'st'),

  http.get<{ id: string }>(api('/stations/:id/timeline'), async ({ request, params }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const station = db.stations.find((item) => item.id === params.id);
    if (!station) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const { from, to } = parseRange(request);
    return HttpResponse.json(getTimeline(station, from, to));
  }),

  http.get<{ id: string }>(api('/stations/:id/samples'), async ({ request, params }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const station = db.stations.find((item) => item.id === params.id);
    if (!station) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const { from, to } = parseRange(request);
    return HttpResponse.json(getSamples(station, from, to));
  }),

  http.get(api('/timeline'), async ({ request }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const { from, to, params } = parseRange(request);
    return HttpResponse.json(filterStations(params).flatMap((station) => getTimeline(station, from, to)));
  }),

  http.get(api('/sessions'), async ({ request }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const { from, to, params } = parseRange(request);
    return HttpResponse.json(getSessions(filterStations(params), from, to));
  }),

  http.get(api('/statistics'), async ({ request }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const { from, to, params } = parseRange(request);
    return HttpResponse.json(getStatistics(filterStations(params), from, to));
  }),

  http.get(api('/alarms'), async ({ request }) => {
    await latency();
    const denied = authorize(request);
    if (denied) return denied;
    const { from, to, params } = parseRange(request);
    const alarms = getAlarms(filterStations(params), from, to);
    const activeOnly = params.get('active') === 'true';
    return HttpResponse.json(activeOnly ? alarms.filter((alarm) => !alarm.clearedAt || !alarm.acknowledgedBy) : alarms);
  }),

  http.post<{ id: string }>(api('/alarms/:id/ack'), async ({ request, params }) => {
    await latency();
    const denied = authorize(request, 'operator');
    if (denied) return denied;
    db.acknowledgements.set(params.id, currentUser(request)!.username);
    return new HttpResponse(null, { status: 204 });
  }),

  live.addEventListener('connection', ({ client }) => {
    const send = () => {
      const now = Date.now();
      const message: LiveMessage = { type: 'snapshot', data: db.stations.map((station) => getLiveSnapshot(station, now)) };
      client.send(JSON.stringify(message));
    };
    send();
    const timer = setInterval(send, LIVE_INTERVAL_MS);
    client.addEventListener('close', () => clearInterval(timer));
  }),
];
