import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { csCZ as coreCs, enUS as coreEn } from '@mui/material/locale';
import { csCZ as gridCs, enUS as gridEn } from '@mui/x-data-grid/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { csCZ as pickersCs, enUS as pickersEn } from '@mui/x-date-pickers/locales';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { createRouter } from './router';
import { store, useAppSelector } from './store/store';
import { selectLanguage } from './store/uiSlice';
import { createAppTheme } from './theme/theme';

const globalStyles = (
  <GlobalStyles
    styles={{
      '@keyframes cg-pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
      '@keyframes cg-ring': {
        '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.6)' },
        '70%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
      },
      '@keyframes cg-flow': { to: { strokeDashoffset: -40 } },
      '@media (prefers-reduced-motion: reduce)': { '*': { animation: 'none !important', transition: 'none !important' } },
    }}
  />
);

function ThemedApp() {
  const language = useAppSelector(selectLanguage);
  const theme = useMemo(
    () => (language === 'en' ? createAppTheme(coreEn, gridEn, pickersEn) : createAppTheme(coreCs, gridCs, pickersCs)),
    [language],
  );
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  const [router] = useState(createRouter);

  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      {globalStyles}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language === 'en' ? 'en-gb' : 'cs'}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}
