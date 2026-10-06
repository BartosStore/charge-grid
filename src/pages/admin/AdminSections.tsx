import { Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { queryKeys, useLocations, useStations, useTariffs } from '../../api/queries';
import type { ConnectorType, Location, Station } from '../../api/types';
import { formatDate } from '../../utils/format';
import { CrudPage, type FieldDef } from './CrudPage';

const CONNECTORS: ConnectorType[] = ['Type2', 'CCS', 'CHAdeMO'];

const ActiveChip = ({ active, label }: { active: boolean; label: string }) => (
  <Chip size="small" label={label} color={active ? 'success' : 'default'} variant={active ? 'filled' : 'outlined'} />
);

export function StationsAdmin() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useStations();
  const { data: locations = [] } = useLocations();
  const { data: tariffs = [] } = useTariffs();
  const [today] = useState(() => new Date().toISOString());

  const columns = useMemo<GridColDef<Station>[]>(() => [
    { field: 'code', headerName: t('columns.code'), width: 130 },
    { field: 'name', headerName: t('columns.name'), flex: 1, minWidth: 160 },
    { field: 'locationId', headerName: t('columns.location'), width: 220, valueGetter: (value: string) => locations.find((item) => item.id === value)?.name ?? '' },
    { field: 'connector', headerName: t('columns.connector'), width: 110 },
    { field: 'maxPowerKw', headerName: t('columns.maxPower'), type: 'number', width: 110, valueFormatter: (value: number) => `${value} kW` },
    { field: 'tariffId', headerName: t('columns.tariff'), width: 130, valueGetter: (value: string) => tariffs.find((item) => item.id === value)?.name ?? '' },
    { field: 'commissionedAt', headerName: t('columns.commissioned'), width: 130, valueFormatter: (value: string) => formatDate(value) },
    {
      field: 'enabled', headerName: t('columns.state'), width: 120, type: 'boolean',
      renderCell: ({ value }) => <ActiveChip active={value} label={value ? t('admin.enabled') : t('admin.disabled')} />,
    },
  ], [locations, tariffs, t]);

  const fields: FieldDef<Station>[] = [
    { name: 'code', label: t('columns.code'), required: true },
    { name: 'name', label: t('columns.name'), required: true },
    { name: 'locationId', label: t('columns.location'), type: 'select', required: true, options: locations.map((item) => ({ value: item.id, label: `${item.name}, ${item.city}` })) },
    { name: 'connector', label: t('columns.connector'), type: 'select', required: true, options: CONNECTORS.map((value) => ({ value, label: value })) },
    { name: 'maxPowerKw', label: t('columns.maxPower'), type: 'number', required: true, min: 1 },
    { name: 'maxTemperatureC', label: t('columns.maxTemperature'), type: 'number', required: true, min: 20 },
    { name: 'tariffId', label: t('columns.tariff'), type: 'select', required: true, options: tariffs.map((item) => ({ value: item.id, label: item.name })) },
    { name: 'commissionedAt', label: t('columns.commissioned'), type: 'date' },
    { name: 'enabled', label: t('admin.enabled'), type: 'switch' },
  ];

  return (
    <CrudPage<Station>
      resource="stations"
      queryKey={queryKeys.stations}
      items={data}
      loading={isLoading}
      columns={columns}
      fields={fields}
      addLabel={t('admin.sections.stations.add')}
      describe={(item) => `${item.code} – ${item.name}`}
      emptyItem={{
        code: '', name: '', locationId: locations[0]?.id ?? '', tariffId: tariffs[0]?.id ?? '', connector: 'Type2',
        maxPowerKw: 22, maxTemperatureC: 50, commissionedAt: today, enabled: true,
      }}
    />
  );
}

export function LocationsAdmin() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useLocations();
  const { data: stations = [] } = useStations();

  const columns = useMemo<GridColDef<Location>[]>(() => [
    { field: 'name', headerName: t('columns.name'), flex: 1, minWidth: 200 },
    { field: 'city', headerName: t('columns.city'), width: 160 },
    { field: 'address', headerName: t('columns.address'), flex: 1, minWidth: 180 },
    {
      field: 'stations', headerName: t('admin.sections.stations.title'), type: 'number', width: 110,
      valueGetter: (_, row) => stations.filter((station) => station.locationId === row.id).length,
    },
  ], [stations, t]);

  return (
    <CrudPage<Location>
      resource="locations"
      queryKey={queryKeys.locations}
      items={data}
      loading={isLoading}
      columns={columns}
      fields={[
        { name: 'name', label: t('columns.name'), required: true },
        { name: 'city', label: t('columns.city'), required: true },
        { name: 'address', label: t('columns.address') },
      ]}
      addLabel={t('admin.sections.locations.add')}
      describe={(item) => item.name}
      emptyItem={{ name: '', city: '', address: '' }}
    />
  );
}
