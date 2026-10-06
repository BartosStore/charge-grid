import dayjs from 'dayjs';
import i18n from '../i18n';

const locale = () => (i18n.language === 'en' ? 'en-GB' : 'cs-CZ');

export function formatNumber(value: number, maximumFractionDigits = 1, minimumFractionDigits = 0) {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits, minimumFractionDigits }).format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(share: number, digits = 1) {
  return new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: digits }).format(share);
}

/** Formats a duration in milliseconds as e.g. "2 h 05 min" or "12 min". */
export function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days) return `${days} d ${hours} h`;
  if (hours) return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  return `${minutes} min`;
}

export const formatDateTime = (ts: number) => dayjs(ts).format('D. M. YYYY HH:mm');
export const formatTime = (ts: number) => dayjs(ts).format('HH:mm:ss');
export const formatDate = (ts: number | string) => dayjs(ts).format('D. M. YYYY');
