import type { D1Database } from '@cloudflare/workers-types';
import type { StorageAdapter } from 'grammy/web';

const defaultTableName = 'GrammySessions';

export class D1Adapter<T> implements StorageAdapter<T> {
  private readonly tableName: string;
  private readonly db: D1Database;

  constructor(db: D1Database, tableName?: string) {
    this.db = db;
    this.tableName = tableName ?? defaultTableName;
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
      .prepare(
        `INSERT INTO "${this.tableName}" (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?`,
      )
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
