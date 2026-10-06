import type { Location, Station, Tariff, User, ConnectorType } from '../api/types';
import { createRandom } from './random';

/**
 * In-memory "database" of the mock backend. All data is fictional.
 * Changes made in the administration live only until the page is reloaded.
 */

const locations: Location[] = [
  { id: 'loc-1', name: 'Parkovací dům Nádražní', city: 'Praha', address: 'Nádražní 12' },
  { id: 'loc-2', name: 'Obchodní centrum Jih', city: 'Brno', address: 'Jižní třída 48' },
  { id: 'loc-3', name: 'Odpočívka D1 – km 112', city: 'Velké Meziříčí', address: 'Dálnice D1, km 112' },
  { id: 'loc-4', name: 'Kampus Technická', city: 'Ostrava', address: 'Technická 3' },
  { id: 'loc-5', name: 'Hotel U Jezera', city: 'Plzeň', address: 'Jezerní 7' },
  { id: 'loc-6', name: 'Depo městské flotily', city: 'Olomouc', address: 'Skladová 21' },
];

const tariffs: Tariff[] = [
  { id: 'tar-1', name: 'AC Standard', pricePerKwh: 8.9, pricePerMinute: 0 },
  { id: 'tar-2', name: 'DC Fast', pricePerKwh: 12.5, pricePerMinute: 0.5 },
  { id: 'tar-3', name: 'Flotila', pricePerKwh: 6.4, pricePerMinute: 0 },
];

const cityCodes: Record<string, string> = {
  'loc-1': 'PRG', 'loc-2': 'BRN', 'loc-3': 'D1M', 'loc-4': 'OVA', 'loc-5': 'PLZ', 'loc-6': 'OLO',
};

const stationLayout: { locationId: string; count: number; connector: ConnectorType; maxPowerKw: number }[] = [
  { locationId: 'loc-1', count: 5, connector: 'Type2', maxPowerKw: 22 },
  { locationId: 'loc-2', count: 4, connector: 'CCS', maxPowerKw: 50 },
  { locationId: 'loc-3', count: 5, connector: 'CCS', maxPowerKw: 150 },
  { locationId: 'loc-4', count: 4, connector: 'Type2', maxPowerKw: 11 },
  { locationId: 'loc-5', count: 2, connector: 'CHAdeMO', maxPowerKw: 50 },
  { locationId: 'loc-6', count: 4, connector: 'Type2', maxPowerKw: 22 },
];

function createStations(): Station[] {
  const random = createRandom(42);
  const result: Station[] = [];
  let id = 1;
  for (const layout of stationLayout) {
    for (let index = 1; index <= layout.count; index++) {
      const isDc = layout.connector !== 'Type2';
      result.push({
        id: `st-${id++}`,
        code: `CG-${cityCodes[layout.locationId]}-${String(index).padStart(2, '0')}`,
        name: `${isDc ? 'Rychlonabíječka' : 'Wallbox'} ${index}`,
        locationId: layout.locationId,
        tariffId: layout.locationId === 'loc-6' ? 'tar-3' : isDc ? 'tar-2' : 'tar-1',
        connector: layout.connector,
        maxPowerKw: layout.maxPowerKw,
        maxTemperatureC: isDc ? 55 : 50,
        commissionedAt: new Date(2023, random.int(0, 11), random.int(1, 28)).toISOString(),
        enabled: true,
      });
    }
  }
  return result;
}

const users: User[] = [
  { id: 'usr-1', username: 'admin', name: 'Alex Správce', email: 'admin@chargegrid.example', role: 'admin', active: true },
  { id: 'usr-2', username: 'operator', name: 'Olga Dispečerka', email: 'operator@chargegrid.example', role: 'operator', active: true },
  { id: 'usr-3', username: 'viewer', name: 'Vítek Pozorovatel', email: 'viewer@chargegrid.example', role: 'viewer', active: true },
  { id: 'usr-4', username: 'servis', name: 'Servisní technik', email: 'servis@chargegrid.example', role: 'operator', active: false },
];

export const db = {
  locations,
  tariffs,
  stations: createStations(),
  users,
  /** alarmId -> username of the user who acknowledged it */
  acknowledgements: new Map<string, string>(),
};

/** Number of days of generated history available before today. */
export const HISTORY_DAYS = 90;

let sequence = 100;
export const nextId = (prefix: string) => `${prefix}-${++sequence}`;
