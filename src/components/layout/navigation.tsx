import BoltRounded from '@mui/icons-material/BoltRounded';
import EvStationRounded from '@mui/icons-material/EvStationRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import SpaceDashboardRounded from '@mui/icons-material/SpaceDashboardRounded';
import type { ReactNode } from 'react';

export interface NavItem {
  path: string;
  key: 'overview' | 'live' | 'history' | 'sessions' | 'alarms';
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', key: 'overview', icon: <SpaceDashboardRounded /> },
  { path: '/live', key: 'live', icon: <BoltRounded /> },
  { path: '/history', key: 'history', icon: <InsightsRounded /> },
  { path: '/sessions', key: 'sessions', icon: <EvStationRounded /> },
  { path: '/alarms', key: 'alarms', icon: <NotificationsActiveRounded /> },
];

export const RAIL_WIDTH = { collapsed: 76, expanded: 236 };
