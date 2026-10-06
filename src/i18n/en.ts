import type { Translation } from './cs';

type DeepPartialStrings<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartialStrings<T[K]> };

const en: DeepPartialStrings<Translation> & Record<string, unknown> = {
  nav: {
    main: 'Main navigation',
    overview: 'Overview',
    live: 'Live data',
    history: 'History',
    sessions: 'Sessions',
    alarms: 'Alarms',
    expand: 'Expand menu',
    collapse: 'Collapse menu',
  },
  role: { admin: 'Administrator', operator: 'Operator', viewer: 'Viewer' },
  topbar: {
    userMenu: 'User menu',
    logout: 'Sign out',
    location: 'Location',
    allLocations: 'All locations',
    language: 'Language',
    theme: 'Toggle light/dark mode',
  },
  errors: {
    backHome: 'Back to overview',
    notFoundTitle: 'Page not found',
    notFoundText: 'This address leads nowhere. Maybe the station was unplugged.',
    forbiddenTitle: 'Access denied',
    forbiddenText: 'You do not have permission to view this section.',
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
