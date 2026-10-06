import { Box, Stack, Typography } from '@mui/material';
import { brand } from '../../theme/theme';

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 32 32"
      sx={{ width: size, height: size, flexShrink: 0, display: 'block' }}
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill={brand.indigo} />
      <path d="M18.5 4 8 18h7l-1.5 10L24 14h-7z" fill={brand.lime} />
    </Box>
  );
}

export function Logo({ showText = true, color = 'inherit' }: { showText?: boolean; color?: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', color }}>
      <LogoMark />
      {showText && (
        <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
          Charge<Box component="span" sx={{ color: brand.lime }}>Grid</Box>
        </Typography>
      )}
    </Stack>
  );
}
