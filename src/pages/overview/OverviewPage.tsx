import BoltRounded from '@mui/icons-material/BoltRounded';
import ElectricCarRounded from '@mui/icons-material/ElectricCarRounded';
import EnergySavingsLeafRounded from '@mui/icons-material/EnergySavingsLeafRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import WifiTetheringRounded from '@mui/icons-material/WifiTetheringRounded';
import { Alert, Grid, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocations, useStations, useStatistics } from '../../api/queries';
import { STATION_STATUSES, type StationStatus } from '../../api/types';
import { KpiTile } from '../../components/common/KpiTile';
import { PageHeader } from '../../components/common/PageHeader';
import { useOpenAlarmCount } from '../../components/layout/navigation';
import { useLiveFeed } from '../../live/liveFeed';
import { useAppSelector } from '../../store/store';
import { selectLocationId } from '../../store/uiSlice';
import { brand, statusColors } from '../../theme/theme';
import { formatNumber } from '../../utils/format';
import { todayRange } from '../../utils/time';
import { StationCard } from './StationCard';

const SPARKLINE_POINTS = 60;

export default function OverviewPage() {
  const { t } = useTranslation();
  const locationId = useAppSelector(selectLocationId);
  const { data: stations = [], isLoading } = useStations();
  const { data: locations = [] } = useLocations();
  const snapshots = useLiveFeed((state) => state.snapshots);
  const history = useLiveFeed((state) => state.history);
  const openAlarms = useOpenAlarmCount();
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const [today] = useState(todayRange);
  const { data: todayStats, isLoading: statsLoading } = useStatistics({ ...today, locationId });

  const locationById = useMemo(() => new Map(locations.map((location) => [location.id, location])), [locations]);
  const scoped = stations.filter((station) => !locationId || station.locationId === locationId);
  const scopedSnapshots = scoped.map((station) => snapshots[station.id]).filter(Boolean);

  const counts = Object.fromEntries(
    STATION_STATUSES.map((status) => [status, scopedSnapshots.filter((snapshot) => snapshot.status === status).length]),
  ) as Record<StationStatus, number>;
  const online = scopedSnapshots.length - counts.offline - counts.fault;
  const totalPower = scopedSnapshots.reduce((sum, snapshot) => sum + snapshot.powerKw, 0);
  const runningEnergy = scopedSnapshots.reduce((sum, snapshot) => sum + snapshot.sessionKwh, 0);
  const live = scopedSnapshots.length > 0;

  const query = search.trim().toLowerCase();
  const visible = scoped.filter((station) => {
    const status = snapshots[station.id]?.status;
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (!query) return true;
    const location = locationById.get(station.locationId);
    return [station.code, station.name, location?.name, location?.city].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <>
      <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <KpiTile
            label={t('overview.kpi.online')} icon={<WifiTetheringRounded fontSize="small" />} color={statusColors.available}
            value={`${online}/${scoped.length}`} loading={!live}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <KpiTile
            label={t('overview.kpi.charging')} icon={<ElectricCarRounded fontSize="small" />} color={statusColors.charging}
            value={counts.charging} loading={!live}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <KpiTile
            label={t('overview.kpi.power')} icon={<BoltRounded fontSize="small" />} color={brand.indigo}
            value={formatNumber(totalPower, 0)} unit="kW" loading={!live}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 6, lg: 2.4 }}>
          <KpiTile
            label={t('overview.kpi.energyToday')} icon={<EnergySavingsLeafRounded fontSize="small" />} color="#7CB518"
            value={formatNumber((todayStats?.totalEnergyKwh ?? 0) + runningEnergy, 0)} unit="kWh"
            caption={t('overview.kpi.sessionsToday', { count: todayStats?.totalSessions ?? 0 })}
            loading={statsLoading || !live}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <KpiTile
            label={t('overview.kpi.alarms')} icon={<ReportProblemRounded fontSize="small" />} color={statusColors.fault}
            value={openAlarms} caption={t('overview.kpi.faulted', { count: counts.fault })}
          />
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, value: StationStatus | 'all' | null) => value && setStatusFilter(value)}
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all">{t('common.all')} · {scoped.length}</ToggleButton>
          {STATION_STATUSES.map((status) => (
            <ToggleButton key={status} value={status} sx={{ gap: 0.75 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] }} />
              {t(`status.${status}`)} · {counts[status]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder={t('overview.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }}
          sx={{ width: { md: 280 } }}
        />
      </Stack>

      {!isLoading && visible.length === 0 && <Alert severity="info">{t('overview.noStations')}</Alert>}

      <Grid container spacing={2}>
        {visible.map((station) => (
          <Grid key={station.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
            <StationCard
              station={station}
              location={locationById.get(station.locationId)}
              snapshot={snapshots[station.id]}
              powerHistory={(history[station.id] ?? []).slice(-SPARKLINE_POINTS).map((item) => item.powerKw)}
            />
          </Grid>
        ))}
      </Grid>
      {!live && !isLoading && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>{t('topbar.waiting')}</Typography>
      )}
    </>
  );
}
