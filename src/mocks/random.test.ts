import { describe, expect, it } from 'vitest';
import { createRandom, hashSeed } from './random';

describe('createRandom', () => {
  it('returns the same sequence for the same seed', () => {
    const first = createRandom(42);
    const second = createRandom(42);
    const take = (random: ReturnType<typeof createRandom>) => Array.from({ length: 5 }, () => random.next());

    expect(take(first)).toEqual(take(second));
  });

  it('keeps values within the requested range', () => {
    const random = createRandom(hashSeed('station', 1));
    for (let i = 0; i < 1000; i++) {
      const value = random.int(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
    }
  });
});
