import { Client, StorageAdapter, buildQueryRunner } from './deps.deno.ts';

interface AdapterConstructor {
  client: Client;
  tableName: string;
  query: (query: string, params?: string[] | undefined) => Promise<any>;
}

interface DbOject {
  key: string;
  value: string;
}

export class PsqlAdapter<T> implements StorageAdapter<T> {
  private tableName: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private query = (_query: string, _params?: string[] | undefined): Promise<unknown> | unknown => null;

  /**
   * @private
   */
  private constructor(opts: AdapterConstructor) {
    this.tableName = opts.tableName;
    this.query = opts.query;
  }

  static async create(opts = { tableName: 'sessions' } as Omit<AdapterConstructor, 'query'>) {
    const queryString = `
      CREATE TABLE IF NOT EXISTS "${opts.tableName}" (
        "key" VARCHAR NOT NULL,
        "value" TEXT
      )`;
    const query = buildQueryRunner(opts.client);
    await query(queryString);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS IDX_${opts.tableName} ON "${opts.tableName}" ("key")`);

    return new PsqlAdapter({
      ...opts,
      query,
    });
  }

  private async findSession(key: string) {
    const results = (await this.query(`select * from "${this.tableName}" where key = $1`, [key])) as DbOject[];
    const session = results[0];

    return session;
  }

  async read(key: string) {
    const session = await this.findSession(key);

    if (!session) {
      return undefined;
    }

    return JSON.parse(session.value as string) as T;
  }

  async write(key: string, value: T) {
    await this.query(
      `
      INSERT INTO "${this.tableName}" (key, value)
      values ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = $2`,
      [key, JSON.stringify(value)]
    );
  }

  async delete(key: string) {
    await this.query(`delete from ${this.tableName} where key = $1`, [key]);
  }
}
