import {
  Kysely,
  Generated,
  SqliteDialect,
  PostgresDialect,
  PG,
  Dialect,
  SqliteDialectConfig,
  StorageAdapter,
  MySQLClient,
  MysqlDialect,
} from './deps.deno.ts';

interface SessionsTable {
  id: Generated<number>

  key: string
  value: string
}

interface Database {
  sessions: SessionsTable
}

type Driver = 'postgres' | 'sqlite' | 'mysql'
type Options = { createTable: boolean }

export class SqlAdapter<T> implements StorageAdapter<T> {
  private db: Kysely<Database>;

  static async create<T>(driver: 'sqlite', driverConfig: SqliteDialectConfig, config?: Options): Promise<SqlAdapter<T>>
  static async create<T>(driver: 'postgres', driverConfig: PG.Pool, config?: Options): Promise<SqlAdapter<T>>
  static async create<T>(driver: 'mysql', driverConfig: MySQLClient, config?: Options): Promise<SqlAdapter<T>>
  static async create<T>(...args: [Driver, PG.Pool | SqliteDialectConfig | MySQLClient, Options?]) {
    const driver = args[0];
    const driverConfig = args[1];
    const config = args[2] || { createTable: true };

    let dialect: Dialect;

    if (driver === 'sqlite') {
      dialect = new SqliteDialect(driverConfig as SqliteDialectConfig);
    } else if (driver === 'postgres') {
      dialect = new PostgresDialect(driverConfig as PG.Pool);
    } else if (driver === 'mysql') {
      dialect = new MysqlDialect(driverConfig as MySQLClient);
    } else {
      throw new Error('Unknown dialect.');
    }

    const db = new Kysely<Database>({ dialect });

    if (config.createTable) {
      const isExists = (await db.introspection.getTables()).find(t => t.name === 'sessions');
      if (!isExists) {
        await db.schema.createTable('sessions')
          .addColumn('id', driver === 'postgres' ? 'serial' : 'integer', (col) => {
            let newCol = col.primaryKey();
            if (driver !== 'postgres') newCol = newCol.autoIncrement();
            return newCol;
          })
          .addColumn('key', 'text')
          .addColumn('value', 'text')
          .execute();
      }
    }

    return new SqlAdapter<T>(db);
  }

  /**
 * @private
 */
  private constructor(db: Kysely<Database>) {
    this.db = db;
  }

  async read(key: string) {
    const session = await this.db.selectFrom('sessions').select('value').where('key', '=', key).executeTakeFirst();

    if (!session) return undefined;

    return JSON.parse(session.value) as T;
  }

  async write(key: string, value: T) {
    await this.db.insertInto('sessions').values({ key, value: JSON.stringify(value) }).execute();
  }

  async delete(key: string) {
    await this.db.deleteFrom('sessions').where('key', '=', key).execute();
  }
}

const test = await SqlAdapter.create<{ qwe: string}>(
  'mysql', 
  await new MySQLClient().connect({
    hostname: 'localhost',
    username: 'root',
    password: 'satont',
    db: 'grammy',
  }), 
  { createTable: true }
);

test.write('testKey', { qwe: 'hi from test' });