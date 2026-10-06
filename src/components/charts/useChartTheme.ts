import { useColorScheme, useTheme, type Theme } from '@mui/material/styles';
import { useMemo } from 'react';
import { formatNumber } from '../../utils/format';

/**
 * ECharts draws on a canvas and cannot read CSS variables,
 * so we resolve concrete colors for the active color scheme.
 */
export function useChartTheme() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolved = (mode === 'system' ? systemMode : mode) ?? 'light';

  return useMemo(() => {
    const schemes = (theme as Theme & { colorSchemes?: Partial<Record<string, { palette: Theme['palette'] }>> }).colorSchemes;
    const palette = schemes?.[resolved]?.palette ?? theme.palette;
    return {
      mode: resolved,
      text: palette.text.secondary,
      textStrong: palette.text.primary,
      grid: palette.divider,
      tooltipBg: palette.background.paper,
      primary: palette.primary.main,
      fontFamily: theme.typography.fontFamily,
      /** Value axis labels formatted with the app locale (e.g. "6 000" instead of "6,000"). */
      valueAxisLabel: { color: palette.text.secondary, formatter: (value: number) => formatNumber(value, 1) },
      /** Common pieces of every chart option. */
      base: {
        backgroundColor: 'transparent',
        textStyle: { color: palette.text.secondary, fontFamily: theme.typography.fontFamily },
        tooltip: {
          backgroundColor: palette.background.paper,
          borderColor: palette.divider,
          textStyle: { color: palette.text.primary },
        },
        animationDuration: 400,
      },
    };
  }, [theme, resolved]);
}
