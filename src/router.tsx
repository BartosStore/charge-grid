import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter } from 'react-router';
import { Logo } from './components/layout/Logo';
import { RequireAuth } from './components/layout/RequireAuth';
import LoginPage from './pages/LoginPage';
import { loggedOut, selectUser } from './store/authSlice';
import { useAppDispatch, useAppSelector } from './store/store';

/** Temporary landing page until the application shell exists. */
function HomePlaceholder() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Logo />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography>{user?.name}</Typography>
              {user && <Chip size="small" label={t(`role.${user.role}`)} />}
            </Stack>
            <Button variant="outlined" startIcon={<LogoutRounded />} onClick={() => dispatch(loggedOut())}>
              {t('topbar.logout')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <RequireAuth><HomePlaceholder /></RequireAuth> },
];

export const createRouter = () => createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
