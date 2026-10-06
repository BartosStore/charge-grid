import { Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter } from 'react-router';
import { AppShell, PageFallback } from './components/layout/AppShell';
import type { NavItem } from './components/layout/navigation';
import { RequireAuth } from './components/layout/RequireAuth';
import { NotFoundPage } from './pages/ErrorPages';

// Every page is its own chunk, loaded on first visit.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OverviewPage = lazy(() => import('./pages/overview/OverviewPage'));
const LivePage = lazy(() => import('./pages/LivePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SessionsPage = lazy(() => import('./pages/sessions/SessionsPage'));

/** Temporary content of a navigation section until its page is implemented. */
function PagePlaceholder({ section }: { section: NavItem['key'] }) {
  const { t } = useTranslation();
  return <Typography variant="h4" component="h1">{t(`nav.${section}`)}</Typography>;
}

export const routes = [
  {
    path: '/login',
    element: <Suspense fallback={<PageFallback />}><LoginPage /></Suspense>,
  },
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'live', element: <LivePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'alarms', element: <PagePlaceholder section="alarms" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
