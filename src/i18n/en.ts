import type { Translation } from './cs';

type DeepPartialStrings<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartialStrings<T[K]> };

const en: DeepPartialStrings<Translation> & Record<string, unknown> = {
  topbar: {
    language: 'Language',
    theme: 'Toggle light/dark mode',
  },
  login: {
    heroTitle: 'Every kilowatt-hour under control.',
  },
};

export default en;
