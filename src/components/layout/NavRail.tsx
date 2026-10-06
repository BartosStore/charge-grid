import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import { Badge, Box, ButtonBase, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { hasRole, selectUser } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { railToggled, selectRailExpanded } from '../../store/uiSlice';
import { brand } from '../../theme/theme';
import { Logo } from './Logo';
import { NAV_ITEMS, RAIL_WIDTH, useOpenAlarmCount } from './navigation';

interface RailItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  expanded: boolean;
  end?: boolean;
}

function RailItem({ to, icon, label, expanded, end }: RailItemProps) {
  return (
    <Tooltip title={expanded ? '' : label} placement="right">
      <ButtonBase
        component={NavLink}
        to={to}
        end={end}
        sx={{
          position: 'relative',
          justifyContent: 'flex-start',
          gap: 1.75,
          height: 46,
          px: '14px',
          mx: 1.5,
          borderRadius: 3,
          color: alpha('#fff', 0.62),
          transition: 'background-color .2s, color .2s',
          '&:hover': { bgcolor: brand.railHover, color: '#fff' },
          '&.active': {
            color: brand.lime,
            bgcolor: alpha(brand.lime, 0.1),
            '&::before': {
              content: '""', position: 'absolute', left: -12, top: 10, bottom: 10, width: 4,
              borderRadius: '0 4px 4px 0', bgcolor: brand.lime,
            },
          },
        }}
      >
        {icon}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity .2s' }}
        >
          {label}
        </Typography>
      </ButtonBase>
    </Tooltip>
  );
}

export function NavRail() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const expanded = useAppSelector(selectRailExpanded);
  const user = useAppSelector(selectUser);
  const openAlarms = useOpenAlarmCount();

  return (
    <Box
      component="nav"
      aria-label={t('nav.main')}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        inset: '0 auto 0 0',
        zIndex: (theme) => theme.zIndex.drawer,
        width: expanded ? RAIL_WIDTH.expanded : RAIL_WIDTH.collapsed,
        transition: 'width .25s ease',
        overflowX: 'hidden',
        bgcolor: brand.rail,
        backgroundImage: `radial-gradient(circle at 0% 0%, ${alpha(brand.indigo, 0.35)}, transparent 45%)`,
        color: '#fff',
        py: 2,
      }}
    >
      <Box sx={{ px: '20px', mb: 3 }}>
        <Logo showText={expanded} />
      </Box>

      <Stack spacing={0.75} sx={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <RailItem
            key={item.key}
            to={item.path}
            end={item.path === '/'}
            label={t(`nav.${item.key}`)}
            expanded={expanded}
            icon={item.key === 'alarms' ? (
              <Badge badgeContent={openAlarms} color="error" max={99}>{item.icon}</Badge>
            ) : item.icon}
          />
        ))}
      </Stack>

      <Stack spacing={0.75}>
        {hasRole(user, 'admin') && (
          <RailItem to="/admin" icon={<TuneRounded />} label={t('nav.admin')} expanded={expanded} />
        )}
        <Divider sx={{ borderColor: alpha('#fff', 0.08), mx: 2, my: 1 }} />
        <Tooltip title={expanded ? '' : t('nav.expand')} placement="right">
          <ButtonBase
            onClick={() => dispatch(railToggled())}
            aria-label={expanded ? t('nav.collapse') : t('nav.expand')}
            sx={{
              justifyContent: 'flex-start', gap: 1.75, height: 42, px: '14px', mx: 1.5, borderRadius: 3,
              color: alpha('#fff', 0.5), '&:hover': { color: '#fff', bgcolor: brand.railHover },
            }}
          >
            {expanded ? <KeyboardDoubleArrowLeftRounded /> : <KeyboardDoubleArrowRightRounded />}
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', opacity: expanded ? 1 : 0 }}>{t('nav.collapse')}</Typography>
          </ButtonBase>
        </Tooltip>
      </Stack>
    </Box>
  );
}
