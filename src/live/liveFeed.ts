import { useSyncExternalStore } from 'react';
import { LIVE_URL } from '../api/config';
import type { LiveMessage, LiveSnapshot } from '../api/types';

export type ConnectionState = 'connecting' | 'open' | 'closed';

export interface LiveState {
  connection: ConnectionState;
  lastUpdate: number | null;
  /** Latest snapshot per station. */
  snapshots: Record<string, LiveSnapshot>;
  /** Rolling buffer of recent snapshots per station (for live charts and sparklines). */
  history: Record<string, LiveSnapshot[]>;
}

const HISTORY_LENGTH = 450; // 15 min at 2 s interval
const RECONNECT_MS = 3000;

let state: LiveState = { connection: 'closed', lastUpdate: null, snapshots: {}, history: {} };
const listeners = new Set<() => void>();
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

function setState(patch: Partial<LiveState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function handleMessage(event: MessageEvent<string>) {
  const message = JSON.parse(event.data) as LiveMessage;
  if (message.type !== 'snapshot') return;
  const snapshots: Record<string, LiveSnapshot> = {};
  const history: Record<string, LiveSnapshot[]> = {};
  for (const snapshot of message.data) {
    snapshots[snapshot.stationId] = snapshot;
    history[snapshot.stationId] = [...(state.history[snapshot.stationId] ?? []), snapshot].slice(-HISTORY_LENGTH);
  }
  setState({ snapshots, history, lastUpdate: Date.now() });
}

function connect() {
  clearTimeout(reconnectTimer);
  setState({ connection: 'connecting' });
  const current = new WebSocket(LIVE_URL);
  socket = current;
  current.addEventListener('open', () => setState({ connection: 'open' }));
  current.addEventListener('message', handleMessage);
  current.addEventListener('close', () => {
    if (socket !== current) return;
    socket = null;
    setState({ connection: 'closed' });
    if (listeners.size) reconnectTimer = setTimeout(connect, RECONNECT_MS);
  });
}

function disconnect() {
  clearTimeout(reconnectTimer);
  const current = socket;
  socket = null;
  current?.close();
  state = { connection: 'closed', lastUpdate: null, snapshots: {}, history: {} };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!socket) connect();
  return () => {
    listeners.delete(listener);
    // Keep the connection over short unmount/mount cycles (navigation, StrictMode).
    setTimeout(() => {
      if (!listeners.size) disconnect();
    }, 1000);
  };
}

export function useLiveFeed<T>(selector: (state: LiveState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}
