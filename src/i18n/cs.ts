const cs = {
  nav: {
    main: 'Hlavní navigace',
    overview: 'Přehled',
    live: 'Živá data',
    history: 'Historie',
    sessions: 'Relace',
    alarms: 'Alarmy',
    expand: 'Rozbalit menu',
    collapse: 'Sbalit menu',
  },
  status: { charging: 'Nabíjí', available: 'Volná', reserved: 'Rezervace', fault: 'Porucha', offline: 'Offline' },
  severity: { critical: 'Kritický', warning: 'Varování', info: 'Info' },
  role: { admin: 'Administrátor', operator: 'Operátor', viewer: 'Čtenář' },
  topbar: {
    lastUpdate: 'Poslední aktualizace {{time}}',
    waiting: 'Čekám na živá data…',
    connection: { open: 'LIVE', connecting: 'Připojuji', closed: 'Offline' },
    userMenu: 'Uživatelské menu',
    logout: 'Odhlásit se',
    location: 'Lokalita',
    allLocations: 'Všechny lokality',
    language: 'Jazyk',
    theme: 'Přepnout světlý/tmavý režim',
  },
  errors: {
    backHome: 'Zpět na přehled',
    notFoundTitle: 'Stránka nenalezena',
    notFoundText: 'Tahle adresa nikam nevede. Možná byla stanice odpojena.',
    forbiddenTitle: 'Přístup odepřen',
    forbiddenText: 'Pro tuto sekci nemáte dostatečná oprávnění.',
  },
  login: {
    heroTitle: 'Každá kilowatthodina pod kontrolou.',
    heroText: 'Sledujte síť nabíjecích stanic v reálném čase, analyzujte historii provozu a reagujte na poruchy dřív, než si jich všimnou řidiči.',
    stats: {
      stations: { value: '24', label: 'stanic' },
      locations: { value: '6', label: 'lokalit' },
      interval: { value: '2 s', label: 'živá data' },
    },
    title: 'Přihlášení',
    subtitle: 'Vítejte zpět. Přihlaste se do dispečinku ChargeGrid.',
    username: 'Uživatelské jméno',
    password: 'Heslo',
    togglePassword: 'Zobrazit heslo',
    submit: 'Přihlásit se',
    demoAccounts: 'Demo účty',
    demoHint: 'Heslo je stejné jako uživatelské jméno. Všechna data jsou smyšlená a generovaná v prohlížeči.',
    errors: {
      invalidCredentials: 'Nesprávné jméno nebo heslo.',
      userInactive: 'Účet je deaktivován.',
      generic: 'Přihlášení se nezdařilo. Zkuste to prosím znovu.',
    },
  },
};

export default cs;
export type Translation = typeof cs;
