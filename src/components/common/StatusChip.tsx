import { Box, Chip, type ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { AlarmSeverity, StationStatus } from '../../api/types';
import { severityColors, statusColors } from '../../theme/theme';

function ColorChip({ color, label, pulse, ...props }: { color: string; label: string; pulse?: boolean } & Omit<ChipProps, 'color' | 'label'>) {
  return (
    <Chip
      size="small"
      label={label}
      icon={
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: color,
            ml: '8px !important',
            animation: pulse ? 'cg-pulse 1.6s ease-in-out infinite' : undefined,
          }}
        />
      }
      sx={{ bgcolor: alpha(color, 0.14), color, border: `1px solid ${alpha(color, 0.3)}` }}
      {...props}
    />
  );
}

export function StatusChip({ status, ...props }: { status: StationStatus } & Omit<ChipProps, 'color' | 'label'>) {
  const { t } = useTranslation();
  return <ColorChip color={statusColors[status]} label={t(`status.${status}`)} pulse={status === 'charging'} {...props} />;
}

export function SeverityChip({ severity }: { severity: AlarmSeverity }) {
  const { t } = useTranslation();
  return <ColorChip color={severityColors[severity]} label={t(`severity.${severity}`)} />;
}
