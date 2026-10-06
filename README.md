# ⚡ ChargeGrid

Ukázkový dashboard pro dispečink fiktivní sítě nabíjecích stanic pro elektromobily: živá telemetrie, historie provozu, alarmy a administrace.

Projekt nemá backend. Všechna data generuje přímo v prohlížeči deterministický simulátor nad [MSW](https://mswjs.io/), včetně REST API a WebSocket streamu. Žádná data nejsou skutečná.

## Funkce

| Obrazovka | Co ukazuje |
|---|---|
| **Přihlášení** | Demo účty s různými rolemi (admin / operátor / čtenář) |
| **Přehled** | KPI sítě a živé karty stanic (výkon, relace, teplota, sparkline), filtr podle stavu a hledání |
| **Živá data** | Graf posledních 15 minut. Historie z REST API plynule navazuje na WebSocket stream. Živá tabulka všech stanic. |
| **Historie** | Energie po dnech podle lokalit, žebříček vytížení, časová osa stavů všech stanic se zoomem |
| **Detail stanice** | Časová osa stavů, výkon a teplota s teplotním limitem, rozložení stavů, seznam relací |
| **Relace** | Tabulka nabíjecích relací s filtrováním, řazením a exportem do CSV |
| **Alarmy** | Aktivní a historické poruchy, potvrzování podle role |
| **Administrace** | CRUD stanic, lokalit, tarifů a uživatelů (jen pro admina) |

Dále: světlý a tmavý režim, čeština a angličtina, globální filtr lokality, responzivní layout se spodní navigací na mobilu.

## Technologie

- **React 19 + TypeScript + Vite**
- **MUI** (Material UI, X Data Grid, X Date Pickers, X Charts pro sparklines)
- **Apache ECharts**: grafy kreslené do canvasu (časové řady, stavová časová osa, zoom), modulární import
- **TanStack Query** pro serverová data, **Redux Toolkit** pro stav aplikace (přihlášení, UI)
- **React Router** s lazy loadingem stránek
- **i18next** (cs/en)
- **MSW** pro mock REST API a WebSocket
- **Vitest + Testing Library** pro unit testy, **Playwright** pro E2E
- **oxlint** a **GitHub Actions** pro CI

## Spuštění

```bash
npm install
npm run dev
```

Aplikace poběží na http://localhost:5173. Demo účty: `admin`, `operator`, `viewer`. Heslo je vždy stejné jako jméno.

## Skripty

| Příkaz | Popis |
|---|---|
| `npm run dev` | Vývojový server |
| `npm run build` | Typová kontrola a produkční build do `dist/` |
| `npm run preview` | Náhled produkčního buildu |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit testy (Vitest) |
| `npm run test:e2e` | E2E testy (Playwright; poprvé je potřeba `npx playwright install chromium`) |

## Struktura

```
src/
  api/           typy, fetch klient, React Query hooky
  live/          sdílené WebSocket připojení (useSyncExternalStore, reconnect)
  mocks/         MSW handlery a deterministický generátor dat
  components/    layout (navigační lišta, horní lišta), grafy, společné komponenty
  pages/         stránky (lazy loaded), administrace
  store/         Redux Toolkit (auth, UI)
  theme/         MUI téma, barvy stavů
  i18n/          překlady
e2e/             Playwright testy
```

## Jak funguje mock backend

- Stanice, lokality, tarify a uživatelé jsou v paměti (`src/mocks/db.ts`). Změny z administrace platí do obnovení stránky.
- Časová osa stavů každé stanice se generuje pro každý den ze seedu `(stanice, den)`. Stejný dotaz tak vrací vždy stejná data a historie, živá data i statistiky jsou navzájem konzistentní.
- Výkon, napětí a teplota se počítají z jednoduchého fyzikálního modelu: nabíjecí křivka DC s poklesem výkonu, teplota podle zatížení a denní doby.
- WebSocket `wss://live.chargegrid.local/stream` posílá každé 2 sekundy snapshot všech stanic.

## Nasazení na GitHub Pages

Build pro podadresář repozitáře:

```bash
VITE_BASE=/chargegrid/ npm run build
```

Pro SPA routing je potřeba zkopírovat `dist/index.html` do `dist/404.html`.
