import ElectricCarRounded from '@mui/icons-material/ElectricCarRounded';
import EnergySavingsLeafRounded from '@mui/icons-material/EnergySavingsLeafRounded';
import PaymentsRounded from '@mui/icons-material/PaymentsRounded';
import TimerRounded from '@mui/icons-material/TimerRounded';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSessions } from '../../api/queries';
import { KpiTile } from '../../components/common/KpiTile';
import { PageHeader } from '../../components/common/PageHeader';
import { RangePicker } from '../../components/common/RangePicker';
import { useTimeRange } from '../../components/common/useTimeRange';
import { SectionCard } from '../../components/common/SectionCard';
import { useAppSelector } from '../../store/store';
import { selectLocationId } from '../../store/uiSlice';
import { brand, statusColors } from '../../theme/theme';
import { formatCurrency, formatDuration, formatNumber } from '../../utils/format';
import { SessionsTable } from './SessionsTable';

export default function SessionsPage() {
  const { t } = useTranslation();
  const locationId = useAppSelector(selectLocationId);
  const [rangeState, setRangeState] = useTimeRange('7d');
  const { data = [], isLoading, isFetching } = useSessions({ ...rangeState.range, locationId });

  const energy = data.reduce((sum, session) => sum + session.energyKwh, 0);
  const revenue = data.reduce((sum, session) => sum + session.cost, 0);
  const averageDuration = data.length ? data.reduce((sum, session) => sum + session.endedAt - session.startedAt, 0) / data.length : 0;

  return (
    <>
      <PageHeader
        title={t('sessions.title')}
        subtitle={t('sessions.subtitle')}
        actions={<RangePicker value={rangeState} onChange={setRangeState} />}
      />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('sessions.count')} value={formatNumber(data.length, 0)} icon={<ElectricCarRounded fontSize="small" />} color={statusColors.charging} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('sessions.energy')} value={formatNumber(energy, 0)} unit="kWh" icon={<EnergySavingsLeafRounded fontSize="small" />} color="#7CB518" loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('sessions.revenue')} value={formatCurrency(revenue)} icon={<PaymentsRounded fontSize="small" />} color={brand.indigo} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <KpiTile label={t('sessions.averageDuration')} value={formatDuration(averageDuration)} icon={<TimerRounded fontSize="small" />} color="#F97316" loading={isLoading} />
        </Grid>
      </Grid>
      <SectionCard title={t('sessions.tableTitle')} noPadding>
        <SessionsTable sessions={data} loading={isFetching} />
      </SectionCard>
    </>
  );
}
