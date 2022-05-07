import { Database } from '../src/deps.ts';
export { SQLite3Connector } from 'https://deno.land/x/denodb@v1.0.40/mod.ts';

export function sqLiteConnection() {
  const connector = new SQLite3Connector({ filepath: ':memory:' });
  const db = new Database(connector);

  return db;
}
