import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useLocations, useStations } from '../../api/queries';
import type { ChargingSession } from '../../api/types';
import { formatCurrency, formatDateTime, formatDuration, formatNumber } from '../../utils/format';

interface Props {
  sessions: ChargingSession[];
  loading?: boolean;
  hideStation?: boolean;
  height?: number;
}

export function SessionsTable({ sessions, loading, hideStation, height = 640 }: Props) {
  const { t } = useTranslation();
  const { data: stations = [] } = useStations();
  const { data: locations = [] } = useLocations();

  const columns = useMemo<GridColDef<ChargingSession>[]>(() => {
    const stationById = new Map(stations.map((station) => [station.id, station]));
    const locationById = new Map(locations.map((location) => [location.id, location]));
    const all: GridColDef<ChargingSession>[] = [
      {
        field: 'startedAt', headerName: t('columns.startedAt'), type: 'dateTime', width: 170,
        valueGetter: (value: number) => new Date(value),
        valueFormatter: (value: Date) => formatDateTime(value.getTime()),
      },
      {
        field: 'station', headerName: t('columns.station'), width: 140,
        valueGetter: (_, row) => stationById.get(row.stationId)?.code ?? row.stationId,
        renderCell: ({ row, value }) => <Link to={`/stations/${row.stationId}`} style={{ color: 'inherit', fontWeight: 600 }}>{value}</Link>,
      },
      {
        field: 'location', headerName: t('columns.location'), flex: 1, minWidth: 160,
        valueGetter: (_, row) => {
          const location = locationById.get(stationById.get(row.stationId)?.locationId ?? '');
          return location ? `${location.name}, ${location.city}` : '';
        },
      },
      {
        field: 'duration', headerName: t('columns.duration'), type: 'number', width: 120,
        valueGetter: (_, row) => row.endedAt - row.startedAt,
        valueFormatter: (value: number) => formatDuration(value),
      },
      {
        field: 'energyKwh', headerName: t('columns.energy'), type: 'number', width: 120,
        valueFormatter: (value: number) => `${formatNumber(value, 2)} kWh`,
      },
      {
        field: 'cost', headerName: t('columns.cost'), type: 'number', width: 120,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      { field: 'idTag', headerName: t('columns.idTag'), width: 130 },
    ];
    return hideStation ? all.filter((column) => column.field !== 'station' && column.field !== 'location') : all;
  }, [stations, locations, hideStation, t]);

  return (
    <DataGrid
      rows={sessions}
      columns={columns}
      loading={loading}
      density="compact"
      showToolbar
      disableRowSelectionOnClick
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
        sorting: { sortModel: [{ field: 'startedAt', sort: 'desc' }] },
      }}
      pageSizeOptions={[25, 50, 100]}
      slotProps={{ toolbar: { csvOptions: { fileName: 'chargegrid-sessions' }, printOptions: { disableToolbarButton: true } } }}
      sx={{ border: 0, height }}
    />
  );
}
