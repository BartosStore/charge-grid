import { alpha, createTheme, type ThemeOptions } from '@mui/material/styles';
import type { AlarmSeverity, StationStatus } from '../api/types';

export const brand = {
  indigo: '#5B4CF0',
  indigoLight: '#8B80FF',
  lime: '#B8F23A',
  ink: '#0E1124',
  rail: '#12152B',
  railHover: '#1E2242',
};

export const statusColors: Record<StationStatus, string> = {
  charging: '#3B82F6',
  available: '#22C55E',
  reserved: '#F59E0B',
  fault: '#EF4444',
  offline: '#94A3B8',
};

export const severityColors: Record<AlarmSeverity, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const themeOptions: ThemeOptions = {
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand.indigo },
        secondary: { main: '#7CB518', contrastText: '#fff' },
        background: { default: '#F3F4FA', paper: '#FFFFFF' },
        divider: alpha(brand.ink, 0.09),
        text: { primary: '#14172B', secondary: '#5E6382' },
      },
    },
    dark: {
      palette: {
        primary: { main: brand.indigoLight },
        secondary: { main: brand.lime, contrastText: brand.ink },
        background: { default: '#0A0C18', paper: '#121528' },
        divider: alpha('#FFFFFF', 0.08),
        text: { primary: '#ECEEFA', secondary: '#9AA0C3' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 650 },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: '0.08em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
};

/** Theme with component translations (Data Grid, pickers, core) for the active language. */
export const createAppTheme = (...locales: object[]) => createTheme(themeOptions, ...locales);
