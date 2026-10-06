import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { csCZ as coreCs, enUS as coreEn } from '@mui/material/locale';
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
      '@keyframes cg-flow': { to: { strokeDashoffset: -40 } },
      '@media (prefers-reduced-motion: reduce)': { '*': { animation: 'none !important', transition: 'none !important' } },
    }}
  />
);

function ThemedApp() {
  const language = useAppSelector(selectLanguage);
  const theme = useMemo(() => (language === 'en' ? createAppTheme(coreEn) : createAppTheme(coreCs)), [language]);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  const [router] = useState(createRouter);

  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      {globalStyles}
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
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
