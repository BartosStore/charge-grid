import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Alert, Box, Button, Card, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { useLocations, useSessions, useStationSamples, useStationTimeline, useStations, useTariffs } from '../api/queries';
import { STATION_STATUSES, type StationStatus } from '../api/types';
import { EChart, type ChartOption } from '../components/charts/EChart';
import { StatusTimelineChart } from '../components/charts/StatusTimelineChart';
import { useChartTheme } from '../components/charts/useChartTheme';
import { PageHeader } from '../components/common/PageHeader';
import { RangePicker } from '../components/common/RangePicker';
import { useTimeRange } from '../components/common/useTimeRange';
import { SectionCard } from '../components/common/SectionCard';
import { StatusChip } from '../components/common/StatusChip';
import { useLiveFeed } from '../live/liveFeed';
import { brand, statusColors } from '../theme/theme';
import { formatDate, formatNumber, formatPercent } from '../utils/format';
import { SessionsTable } from './sessions/SessionsTable';

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Card>
  );
}

export default function StationDetailPage() {
  const { stationId = '' } = useParams();
  const { t } = useTranslation();
  const chartTheme = useChartTheme();
  const [rangeState, setRangeState] = useTimeRange('24h');
  const { range } = rangeState;

  const { data: stations, isLoading } = useStations();
  const { data: locations = [] } = useLocations();
  const { data: tariffs = [] } = useTariffs();
  const station = stations?.find((item) => item.id === stationId);
  const location = locations.find((item) => item.id === station?.locationId);
  const tariff = tariffs.find((item) => item.id === station?.tariffId);
  const snapshot = useLiveFeed((state) => state.snapshots[stationId]);

  const timeline = useStationTimeline(stationId, range);
  const samples = useStationSamples(stationId, range);
  const sessions = useSessions({ ...range, stationId });

  const shares = useMemo(() => {
    const durations = Object.fromEntries(STATION_STATUSES.map((status) => [status, 0])) as Record<StationStatus, number>;
    let total = 0;
    for (const segment of timeline.data ?? []) {
      durations[segment.status] += segment.to - segment.from;
      total += segment.to - segment.from;
    }
    return STATION_STATUSES.map((status) => ({ status, share: total ? durations[status] / total : 0 }));
  }, [timeline.data]);

  const historyOption = useMemo<ChartOption>(() => {
    const data = samples.data ?? [];
    return {
      ...chartTheme.base,
      legend: { top: 0, textStyle: { color: chartTheme.textStrong } },
      tooltip: { ...chartTheme.base.tooltip, trigger: 'axis' },
      grid: { left: 8, right: 8, top: 40, bottom: 56, containLabel: true },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 22, bottom: 8, borderColor: chartTheme.grid, textStyle: { color: chartTheme.text } },
      ],
      xAxis: { type: 'time', min: range.from, max: data.at(-1)?.ts ?? range.to, axisLabel: { color: chartTheme.text, hideOverlap: true } },
      yAxis: [
        { type: 'value', name: 'kW', nameTextStyle: { color: chartTheme.text }, axisLabel: chartTheme.valueAxisLabel, splitLine: { lineStyle: { color: chartTheme.grid } } },
        { type: 'value', name: '°C', nameTextStyle: { color: chartTheme.text }, axisLabel: chartTheme.valueAxisLabel, splitLine: { show: false } },
      ],
      series: [
        {
          type: 'line', name: t('live.metrics.powerKw'), showSymbol: false, sampling: 'lttb', color: brand.indigo,
          areaStyle: { opacity: 0.15 }, lineStyle: { width: 1.5 },
          data: data.map((sample) => [sample.ts, sample.powerKw]),
        },
        {
          type: 'line', name: t('live.metrics.temperatureC'), yAxisIndex: 1, showSymbol: false, sampling: 'lttb', color: '#F97316',
          lineStyle: { width: 1.5 },
          data: data.map((sample) => [sample.ts, sample.temperatureC]),
          markLine: station ? {
            symbol: 'none', label: { formatter: t('live.threshold'), color: '#EF4444' },
            lineStyle: { color: '#EF4444', type: 'dashed' }, data: [{ yAxis: station.maxTemperatureC }],
          } : undefined,
        },
      ],
    };
  }, [samples.data, chartTheme, range, station, t]);

  const pieOption = useMemo<ChartOption>(() => ({
    ...chartTheme.base,
    tooltip: { ...chartTheme.base.tooltip, valueFormatter: (value) => formatPercent(Number(value)) },
    series: [{
      type: 'pie',
      radius: ['58%', '82%'],
      itemStyle: { borderRadius: 6, borderColor: chartTheme.tooltipBg, borderWidth: 2 },
      label: { show: false },
      data: shares.filter((item) => item.share > 0).map((item) => ({
        name: t(`status.${item.status}`), value: item.share, itemStyle: { color: statusColors[item.status] },
      })),
    }],
  }), [shares, chartTheme, t]);

  if (!isLoading && !station) {
    return <Alert severity="warning" action={<Button component={Link} to="/">{t('errors.backHome')}</Button>}>{t('station.notFound')}</Alert>;
  }

  const availability = 1 - (shares.find((item) => item.status === 'fault')?.share ?? 0) - (shares.find((item) => item.status === 'offline')?.share ?? 0);

  return (
    <>
      <Button component={Link} to="/" startIcon={<ArrowBackRounded />} size="small" sx={{ mb: 1 }}>{t('station.back')}</Button>
      <PageHeader
        title={station ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{station.code} · {station.name}</span>
            {snapshot && <StatusChip status={snapshot.status} />}
          </Stack>
        ) : <Skeleton width={280} />}
        subtitle={location && `${location.name}, ${location.address}, ${location.city}`}
        actions={<RangePicker value={rangeState} onChange={setRangeState} />}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.livePower')} value={snapshot ? `${formatNumber(snapshot.powerKw, 1)} kW` : '—'} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.liveTemperature')} value={snapshot ? `${formatNumber(snapshot.temperatureC, 1)} °C` : '—'} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.maxPower')} value={station ? `${station.maxPowerKw} kW` : '—'} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.connector')} value={station?.connector ?? '—'} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.tariff')} value={tariff ? `${tariff.name} · ${formatNumber(tariff.pricePerKwh, 2)} Kč/kWh` : '—'} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><InfoTile label={t('station.commissioned')} value={station ? formatDate(station.commissionedAt) : '—'} /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionCard title={t('station.timeline')} loading={timeline.isFetching}>
            {station && (
              <StatusTimelineChart rows={[{ id: station.id, label: station.code }]} segments={timeline.data ?? []} range={range} />
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title={t('station.history')} subtitle={t('station.historyHint')} loading={samples.isFetching}>
            <EChart option={historyOption} height={340} ariaLabel={t('station.history')} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title={t('station.availability')} subtitle={t('station.availabilityHint')}>
            <Box sx={{ position: 'relative' }}>
              <EChart option={pieOption} height={240} ariaLabel={t('station.availability')} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">{formatPercent(availability)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('station.available')}</Typography>
                </Box>
              </Box>
            </Box>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {shares.map((item) => (
                <Stack key={item.status} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: statusColors[item.status] }} />
                    <Typography variant="body2">{t(`status.${item.status}`)}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPercent(item.share)}</Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={12}>
          <SectionCard title={t('station.sessions')} subtitle={t('station.sessionsCount', { count: sessions.data?.length ?? 0 })} noPadding>
            <SessionsTable sessions={sessions.data ?? []} loading={sessions.isFetching} hideStation height={420} />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
