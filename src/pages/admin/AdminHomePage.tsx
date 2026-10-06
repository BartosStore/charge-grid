import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Card, CardActionArea, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useLocations, useStations, useTariffs, useUsers } from '../../api/queries';
import { seriesColors } from '../../theme/theme';
import { ADMIN_SECTIONS } from './adminNavigation';

export default function AdminHomePage() {
  const { t } = useTranslation();
  const counts = {
    stations: useStations().data?.length,
    locations: useLocations().data?.length,
    tariffs: useTariffs().data?.length,
    users: useUsers().data?.length,
  };

  return (
    <Grid container spacing={2}>
      {ADMIN_SECTIONS.map((section, index) => {
        const color = seriesColors[index];
        const count = counts[section.key];
        return (
          <Grid key={section.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={section.path} sx={{ p: 3, height: '100%', alignItems: 'flex-start' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: alpha(color, 0.14), color }}>
                      {section.icon}
                    </Box>
                    <Typography variant="h4" component="p">{count ?? <Skeleton width={40} />}</Typography>
                  </Stack>
                  <div>
                    <Typography variant="h6">{t(`admin.sections.${section.key}.title`)}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {t(`admin.sections.${section.key}.description`)}
                    </Typography>
                  </div>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'primary.main', mt: 'auto' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('admin.manage')}</Typography>
                    <ArrowForwardRounded fontSize="small" />
                  </Stack>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
