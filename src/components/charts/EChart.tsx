import { Box } from '@mui/material';
import { BarChart, CustomChart, LineChart, PieChart } from 'echarts/charts';
import type { BarSeriesOption, CustomSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import {
  DataZoomComponent, GridComponent, LegendComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent,
} from 'echarts/components';
import type {
  DataZoomComponentOption, GridComponentOption, LegendComponentOption, MarkLineComponentOption, TooltipComponentOption,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import type { ComposeOption, ECElementEvent } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import langCS from 'echarts/i18n/langCS-obj.js';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Only the parts we use are registered – keeps the bundle small.
echarts.use([
  BarChart, CustomChart, LineChart, PieChart,
  DataZoomComponent, GridComponent, LegendComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent,
  CanvasRenderer,
]);
echarts.registerLocale('CS', langCS);

export type ChartOption = ComposeOption<
  | BarSeriesOption | CustomSeriesOption | LineSeriesOption | PieSeriesOption
  | DataZoomComponentOption | GridComponentOption | LegendComponentOption | MarkLineComponentOption | TooltipComponentOption
>;

interface Props {
  option: ChartOption;
  height?: number | string;
  onClick?: (event: ECElementEvent) => void;
  /** Merge new options into the existing chart (keeps zoom state while data streams in). */
  merge?: boolean;
  ariaLabel?: string;
}

export function EChart({ option, height = 320, onClick, merge = false, ariaLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'EN' : 'CS';

  // The chart is re-created when the language changes (ECharts locale is fixed per instance).
  useEffect(() => {
    const chart = echarts.init(containerRef.current!, undefined, { renderer: 'canvas', locale });
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(containerRef.current!);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [locale]);

  useEffect(() => {
    chartRef.current?.setOption(option, merge ? { lazyUpdate: true } : { notMerge: true });
  }, [option, merge, locale]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !onClick) return;
    chart.on('click', onClick);
    return () => {
      if (!chart.isDisposed()) chart.off('click', onClick);
    };
  }, [onClick, locale]);

  return <Box ref={containerRef} role="img" aria-label={ariaLabel} sx={{ width: '100%', height }} />;
}
