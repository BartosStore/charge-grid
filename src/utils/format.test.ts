import { describe, expect, it } from 'vitest';
import { formatDuration } from './format';

describe('formatDuration', () => {
  it.each([
    [0, '0 min'],
    [12 * 60_000, '12 min'],
    [125 * 60_000, '2 h 05 min'],
    [26 * 3_600_000, '1 d 2 h'],
  ])('formats %i ms as "%s"', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
