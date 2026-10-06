import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import {
  Avatar, Box, ButtonBase, Divider, IconButton, ListItemIcon, Menu, MenuItem, Select, Stack, Tooltip, Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocations } from '../../api/queries';
import { loggedOut, selectUser } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { languageChanged, locationChanged, selectLanguage, selectLocationId } from '../../store/uiSlice';
import { brand } from '../../theme/theme';
import { LogoMark } from './Logo';

function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!user) return null;

  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  const close = () => setAnchor(null);

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={t('topbar.userMenu')}
        sx={{ borderRadius: 6, p: 0.5, pr: { xs: 0.5, md: 1.5 }, gap: 1.25 }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: brand.indigo, color: '#fff', fontSize: 14, fontWeight: 700 }}>{initials}</Avatar>
        <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 650, lineHeight: 1.2 }}>{user.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t(`role.${user.role}`)}</Typography>
        </Box>
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{user.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            dispatch(loggedOut());
            queryClient.clear();
            navigate('/login');
          }}
        >
          <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
          {t('topbar.logout')}
        </MenuItem>
      </Menu>
    </>
  );
}

export function TopBar() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: locations = [] } = useLocations();
  const locationId = useAppSelector(selectLocationId);
  const language = useAppSelector(selectLanguage);
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';

  const toggleLanguage = () => {
    const next = language === 'cs' ? 'en' : 'cs';
    dispatch(languageChanged(next));
    void i18n.changeLanguage(next);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar,
        px: { xs: 2, md: 4 }, py: 1.5,
        backdropFilter: 'blur(12px)',
        bgcolor: 'color-mix(in srgb, var(--mui-palette-background-default) 80%, transparent)',
        borderBottom: 1, borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}><LogoMark size={32} /></Box>
        <Select
          size="small"
          value={locationId ?? ''}
          displayEmpty
          onChange={(event) => dispatch(locationChanged(event.target.value || null))}
          inputProps={{ 'aria-label': t('topbar.location') }}
          startAdornment={<PlaceRounded fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />}
          sx={{ minWidth: { xs: 0, sm: 240 }, flexShrink: 1, bgcolor: 'background.paper', borderRadius: 6, '& fieldset': { borderRadius: 6 } }}
        >
          <MenuItem value="">{t('topbar.allLocations')}</MenuItem>
          {locations.map((location) => (
            <MenuItem key={location.id} value={location.id}>{location.name}, {location.city}</MenuItem>
          ))}
        </Select>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={t('topbar.language')}>
          <IconButton onClick={toggleLanguage} aria-label={t('topbar.language')}>
            <TranslateRounded fontSize="small" />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>{language.toUpperCase()}</Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title={t('topbar.theme')}>
          <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} aria-label={t('topbar.theme')}>
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </IconButton>
        </Tooltip>
        <UserMenu />
      </Stack>
    </Box>
  );
}
