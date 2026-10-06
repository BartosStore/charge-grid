import BadgeRounded from '@mui/icons-material/BadgeRounded';
import EvStationRounded from '@mui/icons-material/EvStationRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import PriceChangeRounded from '@mui/icons-material/PriceChangeRounded';
import type { ReactNode } from 'react';

export interface AdminSection {
  path: string;
  key: 'stations' | 'locations' | 'tariffs' | 'users';
  icon: ReactNode;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { path: '/admin/stations', key: 'stations', icon: <EvStationRounded /> },
  { path: '/admin/locations', key: 'locations', icon: <PlaceRounded /> },
  { path: '/admin/tariffs', key: 'tariffs', icon: <PriceChangeRounded /> },
  { path: '/admin/users', key: 'users', icon: <BadgeRounded /> },
];
