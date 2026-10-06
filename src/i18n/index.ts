import dayjs from 'dayjs';
import 'dayjs/locale/cs';
import 'dayjs/locale/en-gb';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './cs';
import en from './en';

const syncDayjs = (language: string) => dayjs.locale(language === 'en' ? 'en-gb' : 'cs');

export function initI18n(language: string) {
  syncDayjs(language);
  i18n.on('languageChanged', syncDayjs);
  return i18n.use(initReactI18next).init({
    resources: { cs: { translation: cs }, en: { translation: en } },
    lng: language,
    fallbackLng: 'cs',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
