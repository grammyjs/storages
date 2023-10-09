import type { D1Database } from '@cloudflare/workers-types';
import type { StorageAdapter } from 'grammy/web';

const defaultTableName = 'GrammySessions';

export class D1Adapter<T> implements StorageAdapter<T> {
  private readonly tableName: string;
  private readonly db: D1Database;

  /**
	 * @private
 	*/
  private constructor(db: D1Database, tableName?: string) {
    this.db = db;
    this.tableName = tableName ?? defaultTableName;
  }

  static async create<T>(db: D1Database, tableName?: string): Promise<D1Adapter<T>> {
    const adapter = new D1Adapter<T>(db, tableName);
    await adapter.#init();
    return adapter;
  }

  async #init() {
    await this.db
      .exec(`CREATE TABLE IF NOT EXISTS "${this.tableName}" (key TEXT PRIMARY KEY, value TEXT)`);

    await this.db
      .exec(`CREATE INDEX IF NOT EXISTS "IDX_${this.tableName}" ON ${this.tableName} (key)`);
  }

  async read(key: string): Promise<T | undefined> {
    const row = await this.db
      .prepare(`SELECT value FROM "${this.tableName}" WHERE key = ?`)
      .bind(key)
      .first();

    if (!row || typeof row !== 'object') return undefined;

    if (!('value' in row)) {
      throw new Error(`Unexpected row: ${JSON.stringify(row)}`);
    }

    return JSON.parse(row.value as string) as unknown as T;
  }

  async write(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);

    await this.db
      .prepare(`INSERT INTO "${this.tableName}" (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?`)
      .bind(key, stringified, stringified)
      .run();
  }

  async delete(key: string): Promise<void> {
    await this.db
      .prepare(`DELETE FROM "${this.tableName}" WHERE key = ?`)
      .bind(key)
      .run();
  }
}