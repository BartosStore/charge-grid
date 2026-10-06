import BoltRounded from '@mui/icons-material/BoltRounded';
import EvStationRounded from '@mui/icons-material/EvStationRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import SpaceDashboardRounded from '@mui/icons-material/SpaceDashboardRounded';
import { useState, type ReactNode } from 'react';
import { useAlarms } from '../../api/queries';
import { openAlarmRange } from '../../utils/time';

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

/** Number of alarms that are still active and not acknowledged (badge in navigation). */
export function useOpenAlarmCount() {
  const [range] = useState(openAlarmRange);
  const { data } = useAlarms({ ...range, active: true });
  return data?.filter((alarm) => !alarm.acknowledgedBy).length ?? 0;
}
