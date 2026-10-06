import dayjs from 'dayjs';
import { useState } from 'react';
import type { TimeRange } from '../../api/queries';

export type RangePreset = '24h' | '7d' | '30d' | 'custom';
export type FixedPreset = Exclude<RangePreset, 'custom'>;

export interface RangeState {
  preset: RangePreset;
  range: TimeRange;
}

export function presetRange(preset: FixedPreset): TimeRange {
  const to = dayjs().second(0).millisecond(0);
  const from = preset === '24h' ? to.subtract(24, 'hour') : to.subtract(preset === '7d' ? 7 : 30, 'day').startOf('day');
  return { from: from.valueOf(), to: to.valueOf() };
}

/** Keeps a time range that only changes when the user picks a new one (stable React Query keys). */
export function useTimeRange(initial: FixedPreset = '24h') {
  return useState<RangeState>(() => ({ preset: initial, range: presetRange(initial) }));
}
