import { Box, Stack, Typography } from '@mui/material';
import type { CustomSeriesOption } from 'echarts/charts';
import { graphic, type ECElementEvent } from 'echarts/core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TimeRange } from '../../api/queries';
import { STATION_STATUSES, type StationStatus, type TimelineSegment } from '../../api/types';
import { statusColors } from '../../theme/theme';
import { formatDateTime, formatDuration } from '../../utils/format';
import { EChart, type ChartOption } from './EChart';
import { useChartTheme } from './useChartTheme';

interface Row {
  id: string;
  label: string;
}

interface Props {
  rows: Row[];
  segments: TimelineSegment[];
  range: TimeRange;
  onRowClick?: (rowId: string) => void;
}

type RenderItem = NonNullable<CustomSeriesOption['renderItem']>;
type Rect = { x: number; y: number; width: number; height: number };

const renderSegment: RenderItem = (params, api) => {
  const row = api.value(0) as number;
  const start = api.coord([api.value(1), row]);
  const end = api.coord([api.value(2), row]);
  const rowSize = api.size ? (api.size([0, 1]) as number[]) : [0, 24];
  const height = rowSize[1] * 0.62;
  const coordSys = params.coordSys as unknown as Rect;
  const shape = graphic.clipRectByRect(
    { x: start[0], y: start[1] - height / 2, width: Math.max(end[0] - start[0], 1), height },
    { x: coordSys.x, y: coordSys.y, width: coordSys.width, height: coordSys.height },
  );
  return shape ? { type: 'rect', transition: ['shape'], shape, style: { fill: api.visual('color') } } : null;
};

/**
 * Gantt-like timeline of station states – one row per station.
 * Rendered on canvas so it stays fast with thousands of segments.
 */
export function StatusTimelineChart({ rows, segments, range, onRowClick }: Props) {
  const { t } = useTranslation();
  const chartTheme = useChartTheme();

  const option = useMemo<ChartOption>(() => {
    const rowIndex = new Map(rows.map((row, index) => [row.id, index]));
    const data = segments
      .filter((segment) => rowIndex.has(segment.stationId))
      .map((segment) => ({
        value: [rowIndex.get(segment.stationId)!, segment.from, segment.to, segment.status],
        itemStyle: { color: statusColors[segment.status] },
      }));

    return {
      ...chartTheme.base,
      grid: { left: 8, right: 16, top: 8, bottom: 28, containLabel: true },
      tooltip: {
        ...chartTheme.base.tooltip,
        formatter: (params) => {
          const [index, from, to, status] = (params as unknown as { value: [number, number, number, StationStatus] }).value;
          return `<b>${rows[index].label}</b><br/>${t(`status.${status}`)}<br/>${formatDateTime(from)} – ${formatDateTime(to)}<br/>${formatDuration(to - from)}`;
        },
      },
      dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'weakFilter' }],
      xAxis: {
        type: 'time',
        min: range.from,
        max: range.to,
        axisLine: { lineStyle: { color: chartTheme.grid } },
        splitLine: { show: true, lineStyle: { color: chartTheme.grid } },
        axisLabel: { color: chartTheme.text, hideOverlap: true },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.label),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: chartTheme.textStrong, fontWeight: 500 },
        triggerEvent: true,
      },
      series: [{ type: 'custom', renderItem: renderSegment, encode: { x: [1, 2], y: 0 }, data, progressive: 0 }],
    };
  }, [rows, segments, range, chartTheme, t]);

  const handleClick = useCallback(
    (event: ECElementEvent) => {
      if (!onRowClick) return;
      const index = event.componentType === 'yAxis'
        ? rows.findIndex((row) => row.label === (event as unknown as { value: string }).value)
        : (event.value as number[])[0];
      if (rows[index]) onRowClick(rows[index].id);
    },
    [onRowClick, rows],
  );

  return (
    <Box>
      <EChart option={option} height={Math.max(120, rows.length * 30 + 44)} onClick={onRowClick ? handleClick : undefined} ariaLabel={t('history.availabilityTimeline')} />
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5, px: 1, pt: 1 }}>
        {STATION_STATUSES.map((status) => (
          <Stack key={status} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: statusColors[status] }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t(`status.${status}`)}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
