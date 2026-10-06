import GridViewRounded from '@mui/icons-material/GridViewRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import { Box, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router';
import { PageFallback } from '../../components/layout/AppShell';
import { brand } from '../../theme/theme';
import { ADMIN_SECTIONS } from './adminNavigation';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const current = ADMIN_SECTIONS.find((section) => pathname.startsWith(section.path))?.path ?? '/admin';

  return (
    <>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.5 },
          pb: 0,
          mb: 3,
          color: '#fff',
          bgcolor: brand.ink,
          backgroundImage: `linear-gradient(120deg, ${alpha(brand.indigo, 0.9)}, ${alpha(brand.ink, 0.95)} 70%)`,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: alpha('#fff', 0.12), color: brand.lime }}>
            <TuneRounded />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h1">{t('admin.title')}</Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>{t('admin.subtitle')}</Typography>
          </Box>
          <Chip
            label={t('admin.inMemory')}
            size="small"
            sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: alpha(brand.lime, 0.15), color: brand.lime }}
          />
        </Stack>
        <Tabs
          value={current}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          slotProps={{ indicator: { sx: { bgcolor: brand.lime, height: 3, borderRadius: '3px 3px 0 0' } } }}
          sx={{ '& .MuiTab-root': { color: alpha('#fff', 0.65) }, '& .Mui-selected': { color: '#fff' } }}
        >
          <Tab value="/admin" label={t('admin.home')} icon={<GridViewRounded fontSize="small" />} iconPosition="start" component={Link} to="/admin" />
          {ADMIN_SECTIONS.map((section) => (
            <Tab
              key={section.key}
              value={section.path}
              label={t(`admin.sections.${section.key}.title`)}
              component={Link}
              to={section.path}
            />
          ))}
        </Tabs>
      </Box>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </>
  );
}
