import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  noPadding?: boolean;
}

export function SectionCard({ title, subtitle, action, loading, children, noPadding }: Props) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }} />}
      <Stack direction="row" sx={{ px: 2.5, pt: 2, pb: 1, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 650 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
        </div>
        {action}
      </Stack>
      <Box sx={{ flex: 1, px: noPadding ? 0 : 2.5, pb: noPadding ? 0 : 2 }}>{children}</Box>
    </Card>
  );
}
