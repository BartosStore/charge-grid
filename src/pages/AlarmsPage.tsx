import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import { Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAcknowledgeAlarm, useAlarms, useStations } from '../api/queries';
import type { Alarm } from '../api/types';
import { PageHeader } from '../components/common/PageHeader';
import { RangePicker } from '../components/common/RangePicker';
import { useTimeRange } from '../components/common/useTimeRange';
import { SectionCard } from '../components/common/SectionCard';
import { SeverityChip } from '../components/common/StatusChip';
import { hasRole, selectUser } from '../store/authSlice';
import { useAppSelector } from '../store/store';
import { selectLocationId } from '../store/uiSlice';
import { formatDateTime, formatDuration } from '../utils/format';
import { openAlarmRange } from '../utils/time';

type View = 'active' | 'history';

function NoActiveAlarms() {
  const { t } = useTranslation();
  return <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'text.secondary' }}>{t('alarms.noActive')}</Box>;
}

export default function AlarmsPage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const locationId = useAppSelector(selectLocationId);
  const canAcknowledge = hasRole(user, 'operator');
  const [view, setView] = useState<View>('active');
  const [rangeState, setRangeState] = useTimeRange('7d');
  const { data: stations = [] } = useStations();
  const acknowledge = useAcknowledgeAlarm();

  const [activeRange] = useState(openAlarmRange);
  const { data = [], isFetching } = useAlarms(
    view === 'active' ? { ...activeRange, locationId, active: true } : { ...rangeState.range, locationId },
  );

  const columns = useMemo<GridColDef<Alarm>[]>(() => {
    const stationById = new Map(stations.map((station) => [station.id, station]));
    return [
      {
        field: 'severity', headerName: t('columns.severity'), width: 130,
        renderCell: ({ row }) => <SeverityChip severity={row.severity} />,
      },
      {
        field: 'code', headerName: t('columns.alarm'), flex: 1, minWidth: 240,
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.75, lineHeight: 1.3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t(`alarmCode.${row.code}`)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{row.code}</Typography>
          </Box>
        ),
      },
      {
        field: 'station', headerName: t('columns.station'), width: 140,
        valueGetter: (_, row) => stationById.get(row.stationId)?.code ?? row.stationId,
        renderCell: ({ row, value }) => <Link to={`/stations/${row.stationId}`} style={{ color: 'inherit', fontWeight: 600 }}>{value}</Link>,
      },
      { field: 'raisedAt', headerName: t('columns.raisedAt'), width: 160, valueFormatter: (value: number) => formatDateTime(value) },
      {
        field: 'clearedAt', headerName: t('columns.clearedAt'), width: 160,
        renderCell: ({ row }) => row.clearedAt
          ? formatDateTime(row.clearedAt)
          : <Chip size="small" color="error" variant="outlined" label={t('alarms.ongoing')} />,
      },
      {
        field: 'duration', headerName: t('columns.duration'), width: 120, type: 'number',
        valueGetter: (_, row) => (row.clearedAt ?? Date.now()) - row.raisedAt,
        valueFormatter: (value: number) => formatDuration(value),
      },
      {
        field: 'acknowledgedBy', headerName: t('columns.acknowledged'), width: 190, sortable: false,
        renderCell: ({ row }) => row.acknowledgedBy ? (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', height: '100%', color: 'success.main' }}>
            <CheckCircleRounded fontSize="small" />
            <Typography variant="body2">{row.acknowledgedBy}</Typography>
          </Stack>
        ) : canAcknowledge ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<DoneAllRounded />}
            loading={acknowledge.isPending && acknowledge.variables === row.id}
            onClick={() => acknowledge.mutate(row.id)}
          >
            {t('alarms.acknowledge')}
          </Button>
        ) : <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: '52px' }}>—</Typography>,
      },
    ];
  }, [stations, t, canAcknowledge, acknowledge]);

  return (
    <>
      <PageHeader
        title={t('alarms.title')}
        subtitle={t('alarms.subtitle')}
        actions={view === 'history' && <RangePicker value={rangeState} onChange={setRangeState} />}
      />
      <SectionCard
        title={
          <Tabs value={view} onChange={(_, value: View) => setView(value)} sx={{ minHeight: 44 }}>
            <Tab value="active" label={t('alarms.tabs.active')} />
            <Tab value="history" label={t('alarms.tabs.history')} />
          </Tabs>
        }
        noPadding
      >
        <DataGrid
          rows={data}
          columns={columns}
          loading={isFetching}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[25, 50, 100]}
          slots={view === 'active' ? { noRowsOverlay: NoActiveAlarms } : undefined}
          sx={{ border: 0, minHeight: 360, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
        />
      </SectionCard>
      {!canAcknowledge && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1.5 }}>{t('alarms.readOnly')}</Typography>
      )}
    </>
  );
}
