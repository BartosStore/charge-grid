import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import { Box, Card, CardContent, CssBaseline, IconButton, ThemeProvider, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { createAppTheme } from './theme/theme';

const theme = createAppTheme();

function ThemePreview() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" color="primary">ChargeGrid</Typography>
          <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} aria-label="Toggle theme">
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </IconButton>
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
