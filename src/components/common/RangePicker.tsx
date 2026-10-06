import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { presetRange, type FixedPreset, type RangePreset, type RangeState } from './useTimeRange';

const HISTORY_DAYS = 90;

interface Props {
  value: RangeState;
  onChange: (value: RangeState) => void;
  presets?: FixedPreset[];
}

export function RangePicker({ value, onChange, presets = ['24h', '7d', '30d'] }: Props) {
  const { t } = useTranslation();
  const minDate = dayjs().subtract(HISTORY_DAYS, 'day');
  const today = dayjs();

  const changeDates = (from: Dayjs | null, to: Dayjs | null) => {
    if (!from?.isValid() || !to?.isValid()) return;
    const [start, end] = from.isAfter(to) ? [to, from] : [from, to];
    onChange({ preset: 'custom', range: { from: start.startOf('day').valueOf(), to: end.endOf('day').valueOf() } });
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={value.preset}
        onChange={(_, preset: RangePreset | null) => {
          if (preset && preset !== 'custom') onChange({ preset, range: presetRange(preset) });
        }}
      >
        {presets.map((preset) => (
          <ToggleButton key={preset} value={preset} sx={{ px: 1.5 }}>{t(`range.${preset}`)}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Stack direction="row" spacing={1}>
        <DatePicker
          label={t('common.from')}
          value={dayjs(value.range.from)}
          minDate={minDate}
          maxDate={today}
          onChange={(date) => changeDates(date, dayjs(value.range.to))}
          slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
        />
        <DatePicker
          label={t('common.to')}
          value={dayjs(value.range.to)}
          minDate={minDate}
          maxDate={today}
          onChange={(date) => changeDates(dayjs(value.range.from), date)}
          slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
        />
      </Stack>
    </Stack>
  );
}
