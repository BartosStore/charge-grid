import { Badge, BottomNavigation, BottomNavigationAction, Box, CircularProgress, Paper } from '@mui/material';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '../../store/store';
import { selectRailExpanded } from '../../store/uiSlice';
import { NAV_ITEMS, RAIL_WIDTH, useOpenAlarmCount } from './navigation';
import { NavRail } from './NavRail';
import { TopBar } from './TopBar';

function MobileNavigation() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const openAlarms = useOpenAlarmCount();
  const active = NAV_ITEMS.find((item) => item.path !== '/' && pathname.startsWith(item.path))?.path ?? (pathname === '/' ? '/' : false);

  return (
    <Paper
      elevation={8}
      sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (theme) => theme.zIndex.appBar }}
    >
      <BottomNavigation value={active} showLabels>
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.key}
            value={item.path}
            component={Link}
            to={item.path}
            label={t(`nav.${item.key}`)}
            icon={item.key === 'alarms' ? <Badge badgeContent={openAlarms} color="error">{item.icon}</Badge> : item.icon}
            sx={{ minWidth: 0, px: 0.5 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export function PageFallback() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
      <CircularProgress />
    </Box>
  );
}

export function AppShell() {
  const expanded = useAppSelector(selectRailExpanded);
  const railWidth = expanded ? RAIL_WIDTH.expanded : RAIL_WIDTH.collapsed;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavRail />
      <Box sx={{ ml: { xs: 0, sm: `${railWidth}px` }, transition: 'margin-left .25s ease', pb: { xs: 9, sm: 0 } }}>
        <TopBar />
        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1680, mx: 'auto' }}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
      <MobileNavigation />
    </Box>
  );
}
