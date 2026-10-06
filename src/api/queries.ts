import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Location } from './types';

export const queryKeys = {
  locations: ['locations'] as const,
};

/* ------------------------------------------------------------- master data */

export const useLocations = () =>
  useQuery({ queryKey: queryKeys.locations, queryFn: () => apiFetch<Location[]>('/locations'), staleTime: 60_000 });
