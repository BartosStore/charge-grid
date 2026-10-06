import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import { Box, Card, CardContent, CssBaseline, IconButton, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from './theme/theme';

const theme = createAppTheme();

function ThemePreview() {
  const { t, i18n } = useTranslation();
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
  const language = i18n.language;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" color="primary">ChargeGrid</Typography>
            <Typography color="text.secondary">{t('login.heroTitle')}</Typography>
          </Box>
          <Tooltip title={t('topbar.language')}>
            <IconButton onClick={() => void i18n.changeLanguage(language === 'cs' ? 'en' : 'cs')} aria-label={t('topbar.language')}>
              <TranslateRounded fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>{language.toUpperCase()}</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title={t('topbar.theme')}>
            <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} aria-label={t('topbar.theme')}>
              {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      <ThemePreview />
    </ThemeProvider>
  );
}
