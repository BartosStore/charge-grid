import ThermostatRounded from '@mui/icons-material/ThermostatRounded';
import { Box, Card, CardActionArea, LinearProgress, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { LiveSnapshot, Location, Station } from '../../api/types';
import { StatusChip } from '../../components/common/StatusChip';
import { statusColors } from '../../theme/theme';
import { formatDuration, formatNumber } from '../../utils/format';

interface Props {
  station: Station;
  location?: Location;
  snapshot?: LiveSnapshot;
  powerHistory: number[];
}

function Metric({ label, value, warn, icon }: { label: string; value: string; warn?: boolean; icon?: ReactNode }) {
  return (
    <div>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 650, fontVariantNumeric: 'tabular-nums', color: warn ? 'error.main' : undefined }}>
        {icon}{value}
      </Typography>
    </div>
  );
}

function StationCardComponent({ station, location, snapshot, powerHistory }: Props) {
  const { t } = useTranslation();
  const color = snapshot ? statusColors[snapshot.status] : statusColors.offline;
  const load = snapshot ? Math.min(100, (snapshot.powerKw / station.maxPowerKw) * 100) : 0;
  const hot = !!snapshot && snapshot.temperatureC > station.maxTemperatureC - 5;

  return (
    <Card sx={{ height: '100%', borderTop: `3px solid ${color}`, transition: 'box-shadow .2s, transform .2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
      <CardActionArea component={Link} to={`/stations/${station.id}`} sx={{ p: 2, height: '100%' }} data-testid="station-card">
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <div>
            <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>{station.code}</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{station.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {location ? `${location.name}, ${location.city}` : '—'}
            </Typography>
          </div>
          {snapshot ? <StatusChip status={snapshot.status} /> : <Skeleton width={70} height={24} />}
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mt: 2 }}>
          <div>
            <Typography variant="h4" component="p" sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {snapshot ? formatNumber(snapshot.powerKw, 1, 1) : '–'}
              <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                / {station.maxPowerKw} kW
              </Typography>
            </Typography>
          </div>
          <Box sx={{ width: 110, height: 40, flexShrink: 0 }}>
            {powerHistory.length > 1 && (
              <SparkLineChart data={powerHistory} height={40} color={color} curve="natural" yAxis={{ min: 0, max: station.maxPowerKw * 1.05 }} />
            )}
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={load}
          aria-label={t('overview.card.load')}
          sx={{ my: 1.5, height: 6, borderRadius: 3, bgcolor: alpha(color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
        />

        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
          <Metric
            label={t('overview.card.session')}
            value={snapshot?.sessionStartedAt ? `${formatNumber(snapshot.sessionKwh, 1)} kWh` : '—'}
          />
          <Metric
            label={t('overview.card.duration')}
            value={snapshot?.sessionStartedAt ? formatDuration(snapshot.ts - snapshot.sessionStartedAt) : '—'}
          />
          <Tooltip title={hot ? t('overview.card.hot', { max: station.maxTemperatureC }) : ''}>
            <div>
              <Metric
                label={t('overview.card.temperature')}
                value={snapshot ? `${formatNumber(snapshot.temperatureC, 0)} °C` : '—'}
                warn={hot}
                icon={hot ? <ThermostatRounded sx={{ fontSize: 16, verticalAlign: '-3px' }} /> : undefined}
              />
            </div>
          </Tooltip>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export const StationCard = memo(StationCardComponent);
