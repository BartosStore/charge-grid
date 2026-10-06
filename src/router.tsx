import { Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter } from 'react-router';
import { AppShell, PageFallback } from './components/layout/AppShell';
import { NAV_ITEMS, type NavItem } from './components/layout/navigation';
import { RequireAuth } from './components/layout/RequireAuth';
import { NotFoundPage } from './pages/ErrorPages';

// Every page is its own chunk, loaded on first visit.
const LoginPage = lazy(() => import('./pages/LoginPage'));

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
      ...NAV_ITEMS.map((item) => (item.path === '/'
        ? { index: true, element: <PagePlaceholder section={item.key} /> }
        : { path: item.path.slice(1), element: <PagePlaceholder section={item.key} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
