import type { Translation } from './cs';

type DeepPartialStrings<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartialStrings<T[K]> };

const en: DeepPartialStrings<Translation> & Record<string, unknown> = {
  role: { admin: 'Administrator', operator: 'Operator', viewer: 'Viewer' },
  topbar: {
    logout: 'Sign out',
    language: 'Language',
    theme: 'Toggle light/dark mode',
  },
  login: {
    heroTitle: 'Every kilowatt-hour under control.',
    heroText: 'Monitor your charging network in real time, analyse operating history and react to faults before drivers notice them.',
    stats: {
      stations: { value: '24', label: 'stations' },
      locations: { value: '6', label: 'locations' },
      interval: { value: '2 s', label: 'live data' },
    },
    title: 'Sign in',
    subtitle: 'Welcome back. Sign in to the ChargeGrid control room.',
    username: 'Username',
    password: 'Password',
    togglePassword: 'Show password',
    submit: 'Sign in',
    demoAccounts: 'Demo accounts',
    demoHint: 'The password equals the username. All data is fictional and generated in your browser.',
    errors: {
      invalidCredentials: 'Wrong username or password.',
      userInactive: 'This account is deactivated.',
      generic: 'Sign in failed. Please try again.',
    },
  },
};

export default en;
