import type { TimeRange } from '../api/queries';

const DAY = 86_400_000;

/** From midnight today until now. */
export function todayRange(): TimeRange {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { from: start.getTime(), to: Date.now() };
}

/** Alarms raised in the last week; the open end lets the server clip it to "now". */
export function openAlarmRange(): TimeRange {
  const now = Date.now();
  return { from: now - 7 * DAY, to: now + 365 * DAY };
}
