import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import {
  Alert, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Snackbar, Stack,
  Switch, TextField,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrudMutations } from '../../api/queries';

export interface FieldDef<T> {
  name: keyof T & string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'select' | 'switch' | 'date';
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  step?: number;
}

interface Props<T extends { id: string }> {
  resource: string;
  queryKey: readonly unknown[];
  items: T[];
  loading: boolean;
  columns: GridColDef<T>[];
  fields: FieldDef<T>[];
  emptyItem: Omit<T, 'id'>;
  addLabel: string;
  /** Short label of an item used in the delete confirmation. */
  describe: (item: T) => string;
}

type Draft<T> = Partial<T> & Record<string, unknown>;

export function CrudPage<T extends { id: string }>({
  resource, queryKey, items, loading, columns, fields, emptyItem, addLabel, describe,
}: Props<T>) {
  const { t } = useTranslation();
  const { save, remove } = useCrudMutations<T>(resource, queryKey);
  const [draft, setDraft] = useState<Draft<T> | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const allColumns = useMemo<GridColDef<T>[]>(() => [
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      width: 96,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<EditRounded />} label={t('common.edit')} onClick={() => setDraft({ ...row })} />,
        <GridActionsCellItem key="delete" icon={<DeleteOutlineRounded />} label={t('common.delete')} onClick={() => setToDelete(row)} />,
      ],
    },
  ], [columns, t]);

  const missingRequired = !!draft && fields.some((field) => field.required && (draft[field.name] === '' || draft[field.name] === undefined));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || missingRequired) return;
    save.mutate(draft as T, {
      onSuccess: () => {
        setDraft(null);
        setMessage(t('admin.saved'));
      },
    });
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);
        setMessage(t('admin.deleted'));
      },
    });
  };

  const setField = (name: string, value: unknown) => setDraft((current) => (current ? { ...current, [name]: value } : current));

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDraft({ ...emptyItem } as Draft<T>)}>
          {addLabel}
        </Button>
      </Stack>
      <Card>
        <DataGrid
          rows={items}
          columns={allColumns}
          loading={loading}
          disableRowSelectionOnClick
          showToolbar
          hideFooter={items.length <= 25}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          slotProps={{ toolbar: { csvOptions: { disableToolbarButton: true }, printOptions: { disableToolbarButton: true } } }}
          sx={{ border: 0, minHeight: 320 }}
        />
      </Card>

      <Dialog open={!!draft} onClose={() => setDraft(null)} fullWidth maxWidth="sm">
        <form onSubmit={submit} noValidate>
          <DialogTitle>{draft?.id ? t('common.edit') : addLabel}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {save.isError && <Alert severity="error">{t('admin.saveError')}</Alert>}
              {draft && fields.map((field) => {
                const value = draft[field.name];
                if (field.type === 'switch') {
                  return (
                    <FormControlLabel
                      key={field.name}
                      label={field.label}
                      control={<Switch checked={!!value} onChange={(event) => setField(field.name, event.target.checked)} />}
                    />
                  );
                }
                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    required={field.required}
                    select={field.type === 'select'}
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                    value={field.type === 'date' ? String(value ?? '').slice(0, 10) : (value ?? '')}
                    error={field.required && value === ''}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setField(field.name, field.type === 'number' ? (raw === '' ? '' : Number(raw)) : field.type === 'date' ? new Date(raw).toISOString() : raw);
                    }}
                    slotProps={{
                      htmlInput: { min: field.min, step: field.step },
                      inputLabel: field.type === 'date' ? { shrink: true } : undefined,
                    }}
                    fullWidth
                  >
                    {field.options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </TextField>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDraft(null)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" loading={save.isPending} disabled={missingRequired}>{t('common.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>{t('admin.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>{toDelete && t('admin.confirmDelete', { name: describe(toDelete) })}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setToDelete(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" loading={remove.isPending} onClick={confirmDelete}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMessage(null)}>{message}</Alert>
      </Snackbar>
    </>
  );
}
