import ElectricCarRounded from '@mui/icons-material/ElectricCarRounded';
import EnergySavingsLeafRounded from '@mui/icons-material/EnergySavingsLeafRounded';
import PaymentsRounded from '@mui/icons-material/PaymentsRounded';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import { Grid } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocations, useStations, useStatistics, useTimeline } from '../api/queries';
import { EChart, type ChartOption } from '../components/charts/EChart';
import { StatusTimelineChart } from '../components/charts/StatusTimelineChart';
import { useChartTheme } from '../components/charts/useChartTheme';
import { KpiTile } from '../components/common/KpiTile';
import { PageHeader } from '../components/common/PageHeader';
import { RangePicker } from '../components/common/RangePicker';
import { useTimeRange } from '../components/common/useTimeRange';
import { SectionCard } from '../components/common/SectionCard';
import { useAppSelector } from '../store/store';
import { selectLocationId } from '../store/uiSlice';
import { brand, seriesColors, statusColors } from '../theme/theme';
import { formatCurrency, formatDate, formatNumber, formatPercent } from '../utils/format';

const RANKING_SIZE = 10;

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chartTheme = useChartTheme();
  const locationId = useAppSelector(selectLocationId);
  const [rangeState, setRangeState] = useTimeRange('7d');
  const filter = { ...rangeState.range, locationId };

  const { data: stations = [] } = useStations();
  const { data: locations = [] } = useLocations();
  const statistics = useStatistics(filter);
  const timeline = useTimeline(filter);

  const scoped = useMemo(
    () => stations.filter((station) => !locationId || station.locationId === locationId),
    [stations, locationId],
  );
  const stationById = useMemo(() => new Map(stations.map((station) => [station.id, station])), [stations]);
  const rows = useMemo(() => scoped.map((station) => ({ id: station.id, label: station.code })), [scoped]);

  const utilization = useMemo(() => statistics.data?.utilization ?? [], [statistics.data]);
  const averageAvailability = utilization.length
    ? utilization.reduce((sum, item) => sum + 1 - item.shares.fault - item.shares.offline, 0) / utilization.length
    : 0;

  const energyOption = useMemo<ChartOption>(() => {
    const energy = statistics.data?.energyByDay ?? [];
    const dates = [...new Set(energy.map((item) => item.date))];
    const visibleLocations = locations.filter((location) => energy.some((item) => item.locationId === location.id));
    return {
      ...chartTheme.base,
      legend: { top: 0, type: 'scroll', textStyle: { color: chartTheme.textStrong } },
      tooltip: {
        ...chartTheme.base.tooltip,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => `${formatNumber(Number(value), 0)} kWh`,
      },
      grid: { left: 8, right: 8, top: 44, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: dates.map((date) => formatDate(date)),
        axisLabel: { color: chartTheme.text, hideOverlap: true },
        axisLine: { lineStyle: { color: chartTheme.grid } },
      },
      yAxis: {
        type: 'value', name: 'kWh', nameTextStyle: { color: chartTheme.text },
        axisLabel: chartTheme.valueAxisLabel, splitLine: { lineStyle: { color: chartTheme.grid } },
      },
      series: visibleLocations.map((location) => ({
        type: 'bar',
        name: location.city,
        stack: 'energy',
        barMaxWidth: 36,
        color: seriesColors[locations.indexOf(location) % seriesColors.length],
        emphasis: { focus: 'series' },
        data: dates.map((date) => energy.find((item) => item.date === date && item.locationId === location.id)?.energyKwh ?? 0),
      })),
    };
  }, [statistics.data, locations, chartTheme]);

  const rankingOption = useMemo<ChartOption>(() => {
    const top = [...utilization].sort((a, b) => b.shares.charging - a.shares.charging).slice(0, RANKING_SIZE).reverse();
    return {
      ...chartTheme.base,
      tooltip: {
        ...chartTheme.base.tooltip,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => formatPercent(Number(value)),
      },
      grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', max: 1, axisLabel: { color: chartTheme.text, formatter: (value: number) => formatPercent(value, 0) }, splitLine: { lineStyle: { color: chartTheme.grid } } },
      yAxis: {
        type: 'category',
        data: top.map((item) => stationById.get(item.stationId)?.code ?? item.stationId),
        axisLabel: { color: chartTheme.textStrong },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [{
        type: 'bar',
        name: t('status.charging'),
        data: top.map((item) => item.shares.charging),
        color: statusColors.charging,
        barMaxWidth: 18,
        itemStyle: { borderRadius: [0, 6, 6, 0] },
        label: { show: true, position: 'right', color: chartTheme.text, formatter: ({ value }) => formatPercent(Number(value), 0) },
      }],
    };
  }, [utilization, stationById, chartTheme, t]);

  const openStation = useCallback((stationId: string) => navigate(`/stations/${stationId}`), [navigate]);
  const loading = statistics.isLoading;

  return (
    <>
      <PageHeader
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        actions={<RangePicker value={rangeState} onChange={setRangeState} />}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('history.totalEnergy')} value={formatNumber(statistics.data?.totalEnergyKwh ?? 0, 0)} unit="kWh" icon={<EnergySavingsLeafRounded fontSize="small" />} color="#7CB518" loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('history.totalSessions')} value={formatNumber(statistics.data?.totalSessions ?? 0, 0)} icon={<ElectricCarRounded fontSize="small" />} color={statusColors.charging} loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('history.revenue')} value={formatCurrency(statistics.data?.totalRevenue ?? 0)} icon={<PaymentsRounded fontSize="small" />} color={brand.indigo} loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('history.availability')} value={formatPercent(averageAvailability)} icon={<VerifiedRounded fontSize="small" />} color={statusColors.available} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title={t('history.energyByDay')} subtitle={t('history.energyByDayHint')} loading={statistics.isFetching}>
            <EChart option={energyOption} height={340} ariaLabel={t('history.energyByDay')} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title={t('history.ranking')} subtitle={t('history.rankingHint', { count: RANKING_SIZE })} loading={statistics.isFetching}>
            <EChart option={rankingOption} height={340} ariaLabel={t('history.ranking')} />
          </SectionCard>
        </Grid>
        <Grid size={12}>
          <SectionCard title={t('history.availabilityTimeline')} subtitle={t('history.availabilityTimelineHint')} loading={timeline.isFetching}>
            <StatusTimelineChart rows={rows} segments={timeline.data ?? []} range={rangeState.range} onRowClick={openStation} />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
