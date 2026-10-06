import { describe, expect, it } from 'vitest';
import { db } from './db';
import { DAY, getSessions, getTimeline } from './generators';

const now = new Date(2026, 5, 15, 12, 0).getTime();
const station = db.stations[0];

describe('mock data generator', () => {
  it('produces a continuous timeline without gaps', () => {
    const from = now - 2 * DAY;
    const timeline = getTimeline(station, from, now, now);

    expect(timeline[0].from).toBe(from);
    expect(timeline[timeline.length - 1].to).toBe(now);
    timeline.slice(1).forEach((segment, index) => expect(segment.from).toBe(timeline[index].to));
  });

  it('is deterministic', () => {
    expect(getTimeline(station, now - DAY, now, now)).toEqual(getTimeline(station, now - DAY, now, now));
  });

  it('only returns finished sessions with positive energy', () => {
    const sessions = getSessions([station], now - DAY, now, now);

    expect(sessions.length).toBeGreaterThan(0);
    sessions.forEach((session) => {
      expect(session.endedAt).toBeLessThanOrEqual(now);
      expect(session.energyKwh).toBeGreaterThan(0);
    });
  });
});
