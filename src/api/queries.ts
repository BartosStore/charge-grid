import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Alarm, Location, Station, Statistics } from './types';

export interface TimeRange {
  from: number;
  to: number;
}

interface Filter extends TimeRange {
  locationId?: string | null;
  stationId?: string | null;
}

export const queryKeys = {
  locations: ['locations'] as const,
  stations: ['stations'] as const,
  alarms: ['alarms'] as const,
};

/* ------------------------------------------------------------- master data */

export const useLocations = () =>
  useQuery({ queryKey: queryKeys.locations, queryFn: () => apiFetch<Location[]>('/locations'), staleTime: 60_000 });

export const useStations = () =>
  useQuery({ queryKey: queryKeys.stations, queryFn: () => apiFetch<Station[]>('/stations'), staleTime: 60_000 });

/* ------------------------------------------------------------ time series */

export const useStatistics = (filter: Filter) =>
  useQuery({
    queryKey: ['statistics', filter],
    queryFn: () => apiFetch<Statistics>('/statistics', { query: { ...filter } }),
    placeholderData: keepPreviousData,
  });

export const useAlarms = (filter: Filter & { active?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.alarms, filter],
    queryFn: () => apiFetch<Alarm[]>('/alarms', { query: { ...filter } }),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
