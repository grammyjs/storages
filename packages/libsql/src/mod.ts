import type { StorageAdapter } from './deps.deno.ts';
import type { Client } from './deps.deno.ts';

/**
 * Storage adapter for Turso's libSQL.
 */
export class LibSQLAdapter<T> implements StorageAdapter<T> {
  protected client: Client;
  protected table: string;

  private constructor(opts: { client: Client, table: string }) {
    this.client = opts.client;
    this.table = opts.table;
  }

  /**
   * @param opts options
   * @param opts.table - Name of table where data should be stored
   * @param opts.client - Turos' libSQL client
   * @returns A libSQL storage adapter
   *
   */
  static async create<T>(opts: { client: Client, table: string }) {
    const createTableStatement = `
      CREATE TABLE IF NOT EXISTS "${opts.table}" (
        key TEXT NOT NULL,
        value TEXT
      );`;
    await opts.client.execute(createTableStatement);

    const createIndexStatement = `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_${opts.table}" ON "${opts.table}" (key);`;
    await opts.client.execute(createIndexStatement);

    return new LibSQLAdapter<T>(opts);
  }

  /**
   * @param key The unique index
   * @returns The value for the given key, or undefined if not found
   */
  async read(key: string) {
    const readStatement = `SELECT value from "${this.table}" WHERE key = ? LIMIT 1;`;
    const readResult = await this.client.execute({ sql: readStatement, args: [key] });
    
    const value = readResult.rows[0]?.value as string;
    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as T;
  }

  /**
   * @param key The unique index
   * @param value The JSON-stringifiable value for the given key
   */
  async write(key: string, value: T) {
    const jsonValue = JSON.stringify(value);
    const writeStatement = `INSERT OR REPLACE INTO "${this.table}" (key, value) values (?, ?);`;
    await this.client.execute({ sql: writeStatement, args: [key, jsonValue] });
  }

  /**
   * @param key The unique index
   */
  async delete(key: string) {
    const deleteStatement = `DELETE FROM "${this.table}" WHERE key = ?;`;
    await this.client.execute({ sql: deleteStatement, args: [key] });
  }
}
