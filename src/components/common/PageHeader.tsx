import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-end' }, mb: 3 }}
    >
      <div>
        <Typography variant="h5" component="h1">{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>}
      </div>
      {actions && <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center', rowGap: 1.5 }}>{actions}</Stack>}
    </Stack>
  );
}
