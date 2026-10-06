import { Autocomplete, Box, Grid, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { apiFetch } from '../api/client';
import { useLocations, useStations } from '../api/queries';
import type { LiveSnapshot, Sample, Station, StationStatus } from '../api/types';
import { EChart, type ChartOption } from '../components/charts/EChart';
import { useChartTheme } from '../components/charts/useChartTheme';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusChip } from '../components/common/StatusChip';
import { useLiveFeed } from '../live/liveFeed';
import { useAppSelector } from '../store/store';
import { selectLocationId } from '../store/uiSlice';
import { seriesColors } from '../theme/theme';
import { formatDuration, formatNumber, formatTime } from '../utils/format';

type Metric = 'powerKw' | 'temperatureC' | 'voltageV';
const METRICS: Metric[] = ['powerKw', 'temperatureC', 'voltageV'];
const UNITS: Record<Metric, string> = { powerKw: 'kW', temperatureC: '°C', voltageV: 'V' };
const WINDOW_MS = 15 * 60_000;
const MAX_SELECTED = 4;

interface LiveRow {
  id: string;
  code: string;
  name: string;
  location: string;
  status?: StationStatus;
  powerKw?: number;
  voltageV?: number;
  temperatureC?: number;
  sessionKwh?: number;
  sessionMs?: number;
}

export default function LivePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chartTheme = useChartTheme();
  const locationId = useAppSelector(selectLocationId);
  const { data: stations = [] } = useStations();
  const { data: locations = [] } = useLocations();
  const snapshots = useLiveFeed((state) => state.snapshots);
  const history = useLiveFeed((state) => state.history);
  const [metric, setMetric] = useState<Metric>('powerKw');
  const [picked, setPicked] = useState<Station[] | null>(null);

  const scoped = stations.filter((station) => !locationId || station.locationId === locationId);
  // Until the user picks stations, show the first few that are charging right now.
  const selected = picked ?? (() => {
    const charging = scoped.filter((station) => snapshots[station.id]?.status === 'charging');
    return (charging.length ? charging : scoped).slice(0, 3);
  })();

  // History before the live stream started is loaded once over REST (1-minute samples).
  const [windowStart] = useState(() => Date.now() - WINDOW_MS);
  const backfill = useQueries({
    queries: selected.map((station) => ({
      queryKey: ['samples', station.id, 'backfill', windowStart],
      queryFn: () => apiFetch<Sample[]>(`/stations/${station.id}/samples`, { query: { from: windowStart, to: Date.now() } }),
      staleTime: Infinity,
    })),
  });

  const lastUpdate = useLiveFeed((state) => state.lastUpdate) ?? windowStart + WINDOW_MS;

  // Rebuilt on every live message (2 s) – memoization would not help here.
  const option: ChartOption = (() => {
    const series = selected.map((station, index) => {
      const live: (Sample | LiveSnapshot)[] = history[station.id] ?? [];
      const firstLive = live[0]?.ts ?? Infinity;
      const older = (backfill[index]?.data ?? []).filter((sample) => sample.ts < firstLive);
      const points = [...older, ...live].filter((point) => point.ts >= lastUpdate - WINDOW_MS);
      return {
        type: 'line' as const,
        name: station.code,
        showSymbol: false,
        smooth: 0.3,
        lineStyle: { width: 2 },
        areaStyle: selected.length === 1 ? { opacity: 0.12 } : undefined,
        color: seriesColors[index % seriesColors.length],
        data: points.map((point) => [point.ts, point[metric]]),
        markLine: metric === 'temperatureC' && index === 0
          ? {
            symbol: 'none',
            label: { formatter: t('live.threshold'), color: '#EF4444' },
            lineStyle: { color: '#EF4444', type: 'dashed' as const },
            data: [{ yAxis: station.maxTemperatureC }],
          }
          : undefined,
      };
    });

    return {
      ...chartTheme.base,
      animation: false,
      legend: { top: 0, textStyle: { color: chartTheme.textStrong } },
      tooltip: {
        ...chartTheme.base.tooltip,
        trigger: 'axis',
        valueFormatter: (value) => `${formatNumber(Number(value), 1)} ${UNITS[metric]}`,
      },
      grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
      xAxis: {
        type: 'time',
        min: lastUpdate - WINDOW_MS,
        max: lastUpdate,
        axisLabel: { color: chartTheme.text, formatter: (value: number) => formatTime(value).slice(0, 5) },
        axisLine: { lineStyle: { color: chartTheme.grid } },
      },
      yAxis: {
        type: 'value',
        name: UNITS[metric],
        scale: metric !== 'powerKw',
        nameTextStyle: { color: chartTheme.text },
        splitLine: { lineStyle: { color: chartTheme.grid } },
        axisLabel: chartTheme.valueAxisLabel,
      },
      series,
    };
  })();

  const locationById = useMemo(() => new Map(locations.map((location) => [location.id, location])), [locations]);
  const rows: LiveRow[] = scoped.map((station) => {
    const snapshot = snapshots[station.id];
    return {
      id: station.id,
      code: station.code,
      name: station.name,
      location: locationById.get(station.locationId)?.city ?? '',
      status: snapshot?.status,
      powerKw: snapshot?.powerKw,
      voltageV: snapshot?.voltageV,
      temperatureC: snapshot?.temperatureC,
      sessionKwh: snapshot?.sessionStartedAt ? snapshot.sessionKwh : undefined,
      sessionMs: snapshot?.sessionStartedAt ? snapshot.ts - snapshot.sessionStartedAt : undefined,
    };
  });

  const number = (digits: number, unit: string) => (value: number | undefined) =>
    value === undefined ? '—' : `${formatNumber(value, digits)} ${unit}`;

  const columns: GridColDef<LiveRow>[] = [
    { field: 'code', headerName: t('columns.code'), width: 130 },
    { field: 'name', headerName: t('columns.station'), flex: 1, minWidth: 150 },
    { field: 'location', headerName: t('columns.location'), width: 140 },
    {
      field: 'status', headerName: t('columns.status'), width: 140,
      renderCell: ({ value }) => value && <StatusChip status={value} />,
    },
    { field: 'powerKw', headerName: t('live.metrics.powerKw'), type: 'number', width: 120, valueFormatter: number(1, 'kW') },
    { field: 'voltageV', headerName: t('live.metrics.voltageV'), type: 'number', width: 110, valueFormatter: number(0, 'V') },
    { field: 'temperatureC', headerName: t('live.metrics.temperatureC'), type: 'number', width: 120, valueFormatter: number(1, '°C') },
    { field: 'sessionKwh', headerName: t('columns.energy'), type: 'number', width: 120, valueFormatter: number(2, 'kWh') },
    {
      field: 'sessionMs', headerName: t('columns.duration'), type: 'number', width: 120,
      valueFormatter: (value: number | undefined) => (value === undefined ? '—' : formatDuration(value)),
    },
  ];

  return (
    <>
      <PageHeader title={t('live.title')} subtitle={t('live.subtitle')} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionCard
            title={t('live.chartTitle')}
            subtitle={t('live.chartSubtitle')}
            loading={backfill.some((query) => query.isFetching)}
            action={
              <ToggleButtonGroup size="small" exclusive value={metric} onChange={(_, value: Metric | null) => value && setMetric(value)}>
                {METRICS.map((item) => <ToggleButton key={item} value={item}>{t(`live.metrics.${item}`)}</ToggleButton>)}
              </ToggleButtonGroup>
            }
          >
            <Stack spacing={2}>
              <Autocomplete
                multiple
                size="small"
                options={scoped}
                value={selected}
                getOptionLabel={(station) => `${station.code} – ${station.name}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                getOptionDisabled={(station) => selected.length >= MAX_SELECTED && !selected.some((item) => item.id === station.id)}
                onChange={(_, value) => setPicked(value)}
                renderInput={(params) => <TextField {...params} label={t('live.stations', { max: MAX_SELECTED })} />}
              />
              <Box data-testid="live-chart"><EChart option={option} height={340} ariaLabel={t('live.chartTitle')} /></Box>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={12}>
          <SectionCard title={t('live.tableTitle')} noPadding>
            <DataGrid
              rows={rows}
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
              hideFooter={rows.length <= 25}
              onRowClick={({ id }) => navigate(`/stations/${id}`)}
              sx={{ border: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
            />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
