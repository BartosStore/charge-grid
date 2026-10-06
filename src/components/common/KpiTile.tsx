import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  unit?: string;
  caption?: ReactNode;
  icon: ReactNode;
  color: string;
  loading?: boolean;
}

export function KpiTile({ label, value, unit, caption, icon, color, loading }: Props) {
  return (
    <Card sx={{ p: 2.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute', right: -24, top: -24, width: 96, height: 96, borderRadius: '50%',
          bgcolor: alpha(color, 0.08),
        }}
      />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box
          sx={{
            display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 2.5,
            bgcolor: alpha(color, 0.14), color,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
      </Stack>
      {loading ? (
        <Skeleton width="60%" height={40} />
      ) : (
        <Typography variant="h4" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
          {unit && <Typography component="span" variant="h6" sx={{ color: 'text.secondary', ml: 0.75 }}>{unit}</Typography>}
        </Typography>
      )}
      {caption && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{caption}</Typography>}
    </Card>
  );
}
