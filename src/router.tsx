import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell, PageFallback } from './components/layout/AppShell';
import { RequireAuth, RequireRole } from './components/layout/RequireAuth';
import { NotFoundPage } from './pages/ErrorPages';

// Every page is its own chunk, loaded on first visit.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OverviewPage = lazy(() => import('./pages/overview/OverviewPage'));
const LivePage = lazy(() => import('./pages/LivePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SessionsPage = lazy(() => import('./pages/sessions/SessionsPage'));
const AlarmsPage = lazy(() => import('./pages/AlarmsPage'));
const StationDetailPage = lazy(() => import('./pages/StationDetailPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));

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
      { path: 'alarms', element: <AlarmsPage /> },
      { path: 'stations/:stationId', element: <StationDetailPage /> },
      {
        path: 'admin',
        element: <RequireRole role="admin"><AdminLayout /></RequireRole>,
        children: [
          { index: true, element: <AdminHomePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
