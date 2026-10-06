import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

function ErrorPage({ code, title, text }: { code: string; title: string; text: string }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography
        sx={{
          fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #5B4CF0, #B8F23A)', backgroundClip: 'text', color: 'transparent',
        }}
      >
        {code}
      </Typography>
      <Typography variant="h5" sx={{ mt: 2 }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>{text}</Typography>
      <Button variant="contained" component={Link} to="/">{t('errors.backHome')}</Button>
    </Box>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return <ErrorPage code="404" title={t('errors.notFoundTitle')} text={t('errors.notFoundText')} />;
}

export function ForbiddenPage() {
  const { t } = useTranslation();
  return <ErrorPage code="403" title={t('errors.forbiddenTitle')} text={t('errors.forbiddenText')} />;
}
