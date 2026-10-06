import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type {
  Alarm, ChargingSession, Location, Sample, Station, Statistics, Tariff, TimelineSegment,
} from './types';

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
  tariffs: ['tariffs'] as const,
  stations: ['stations'] as const,
  alarms: ['alarms'] as const,
};

/* ------------------------------------------------------------- master data */

export const useLocations = () =>
  useQuery({ queryKey: queryKeys.locations, queryFn: () => apiFetch<Location[]>('/locations'), staleTime: 60_000 });

export const useTariffs = () =>
  useQuery({ queryKey: queryKeys.tariffs, queryFn: () => apiFetch<Tariff[]>('/tariffs'), staleTime: 60_000 });

export const useStations = () =>
  useQuery({ queryKey: queryKeys.stations, queryFn: () => apiFetch<Station[]>('/stations'), staleTime: 60_000 });

/* ------------------------------------------------------------ time series */

export const useStationTimeline = (stationId: string, range: TimeRange) =>
  useQuery({
    queryKey: ['timeline', stationId, range],
    queryFn: () => apiFetch<TimelineSegment[]>(`/stations/${stationId}/timeline`, { query: { ...range } }),
    placeholderData: keepPreviousData,
  });

export const useStationSamples = (stationId: string, range: TimeRange) =>
  useQuery({
    queryKey: ['samples', stationId, range],
    queryFn: () => apiFetch<Sample[]>(`/stations/${stationId}/samples`, { query: { ...range } }),
    placeholderData: keepPreviousData,
  });

export const useTimeline = (filter: Filter) =>
  useQuery({
    queryKey: ['timeline', 'all', filter],
    queryFn: () => apiFetch<TimelineSegment[]>('/timeline', { query: { ...filter } }),
    placeholderData: keepPreviousData,
  });

export const useSessions = (filter: Filter) =>
  useQuery({
    queryKey: ['sessions', filter],
    queryFn: () => apiFetch<ChargingSession[]>('/sessions', { query: { ...filter } }),
    placeholderData: keepPreviousData,
  });

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

export function useAcknowledgeAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alarmId: string) => apiFetch<void>(`/alarms/${alarmId}/ack`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alarms }),
  });
}
