import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import {
  Alert, Box, Button, Chip, IconButton, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ApiError, apiFetch } from '../api/client';
import type { LoginResponse, Role } from '../api/types';
import { Logo } from '../components/layout/Logo';
import { loggedIn, selectToken } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { languageChanged, selectLanguage } from '../store/uiSlice';
import { brand } from '../theme/theme';

const DEMO_ACCOUNTS: Role[] = ['admin', 'operator', 'viewer'];

/** Decorative network of charging points. */
function GridIllustration() {
  const nodes = [
    [60, 80], [180, 40], [300, 110], [420, 60], [120, 200], [250, 240], [380, 210], [470, 170], [60, 320], [200, 350], [340, 330], [450, 300],
  ];
  const links = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [5, 6], [6, 7], [3, 7], [4, 8], [8, 9], [9, 5], [9, 10], [10, 6], [10, 11], [11, 7]];
  return (
    <Box component="svg" viewBox="0 0 520 400" sx={{ width: '100%', maxWidth: 520, opacity: 0.9 }} aria-hidden>
      {links.map(([a, b], index) => (
        <line key={index} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={alpha('#fff', 0.14)} strokeWidth="1.5" />
      ))}
      {links.slice(0, 6).map(([a, b], index) => (
        <line
          key={`flow-${index}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={brand.lime} strokeWidth="2" strokeDasharray="6 14"
          style={{ animation: `cg-flow ${2 + index * 0.4}s linear infinite` }}
        />
      ))}
      {nodes.map(([x, y], index) => (
        <g key={index}>
          <circle cx={x} cy={y} r="14" fill={alpha(index % 3 ? brand.indigoLight : brand.lime, 0.15)} />
          <circle cx={x} cy={y} r="5" fill={index % 3 ? brand.indigoLight : brand.lime} />
        </g>
      ))}
    </Box>
  );
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector(selectToken);
  const language = useAppSelector(selectLanguage);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = useMutation({
    mutationFn: () => apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: { username, password } }),
    onSuccess: (response) => {
      dispatch(loggedIn(response));
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
    },
  });

  if (token) return <Navigate to="/" replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate();
  };

  const errorKey = login.error instanceof ApiError && login.error.status !== 500 ? login.error.message : 'generic';

  const switchLanguage = (next: 'cs' | 'en') => {
    dispatch(languageChanged(next));
    void i18n.changeLanguage(next);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          bgcolor: brand.ink,
          backgroundImage: `radial-gradient(circle at 10% 10%, ${alpha(brand.indigo, 0.55)}, transparent 50%), radial-gradient(circle at 90% 90%, ${alpha(brand.lime, 0.18)}, transparent 45%)`,
        }}
      >
        <Logo />
        <Box>
          <GridIllustration />
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mt: 4, maxWidth: 520 }}>
            {t('login.heroTitle')}
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.7), mt: 2, maxWidth: 480 }}>{t('login.heroText')}</Typography>
        </Box>
        <Stack direction="row" spacing={5}>
          {(['stations', 'locations', 'interval'] as const).map((key) => (
            <div key={key}>
              <Typography variant="h5" sx={{ color: brand.lime, fontWeight: 800 }}>{t(`login.stats.${key}.value`)}</Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>{t(`login.stats.${key}.label`)}</Typography>
            </div>
          ))}
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: 3, sm: 6 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: { md: 'none' } }}><Logo /></Box>
          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
            {(['cs', 'en'] as const).map((lang) => (
              <Button key={lang} size="small" variant={language === lang ? 'contained' : 'text'} onClick={() => switchLanguage(lang)}>
                {lang.toUpperCase()}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Box component="form" onSubmit={submit} noValidate sx={{ m: 'auto', width: '100%', maxWidth: 400, py: 6 }}>
          <Typography variant="h4" component="h1">{t('login.title')}</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>{t('login.subtitle')}</Typography>

          {login.isError && <Alert severity="error" sx={{ mb: 3 }}>{t(`login.errors.${errorKey}`, t('login.errors.generic'))}</Alert>}

          <Stack spacing={2.5}>
            <TextField
              label={t('login.username')}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              fullWidth
            />
            <TextField
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((value) => !value)} edge="end" aria-label={t('login.togglePassword')}>
                        {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              size="large"
              variant="contained"
              loading={login.isPending}
              disabled={!username || !password}
              endIcon={<ArrowForwardRounded />}
              sx={{ py: 1.5 }}
            >
              {t('login.submit')}
            </Button>
          </Stack>

          <Box sx={{ mt: 4, p: 2, borderRadius: 3, border: 1, borderColor: 'divider', borderStyle: 'dashed' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>{t('login.demoAccounts')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              {DEMO_ACCOUNTS.map((role) => (
                <Chip
                  key={role}
                  label={t(`role.${role}`)}
                  onClick={() => {
                    setUsername(role);
                    setPassword(role);
                  }}
                  color={username === role ? 'primary' : 'default'}
                  variant={username === role ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1.5 }}>{t('login.demoHint')}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
