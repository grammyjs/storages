import { Database, DatabaseOpenOptions } from 'https://deno.land/x/sqlite3@0.4.2/mod.ts';

import {
  Kysely,
  DatabaseConnection,
  QueryResult,
  Driver,
  Dialect,
  CompiledQuery,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/index-nodeless.js';

import {
  freeze,
  isBoolean,
} from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/util/object-utils.js';
import { SqliteDialectConfig } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/dialect/sqlite/sqlite-dialect-config.d.ts';

export class SqliteDriver implements Driver {
  readonly #config: SqliteDialectConfig;
  readonly #connectionMutex = new ConnectionMutex();

  #db?: Database;
  #connection?: DatabaseConnection;

  constructor(config: SqliteDialectConfig) {
    this.#config = freeze({ ...config });
  }

  async init(): Promise<void> {
    const options: DatabaseOpenOptions = {};

    if (isBoolean(this.#config.readonly)) {
      options.readonly = this.#config.readonly;
    }
    
    if (isBoolean(this.#config.fileMustExist)) {
      options.create = this.#config.fileMustExist;
    }


    this.#db = new Database(this.#config.databasePath, options);
    this.#connection = new SqliteConnection(this.#db);

    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection);
    }
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    // SQLite only has one single connection. We use a mutex here to wait
    // until the single connection has been released.
    await this.#connectionMutex.lock();
    return this.#connection!;
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('begin'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('rollback'));
  }

  async releaseConnection(): Promise<void> {
    this.#connectionMutex.unlock();
  }

  async destroy(): Promise<void> {
    this.#db?.close();
  }
}


class SqliteConnection implements DatabaseConnection {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery;

    const stmt = this.#db.queryObject(sql, ...parameters as string[]);

    return Promise.resolve({
      numUpdatedOrDeletedRows: undefined,
      insertId: undefined,
      rows: stmt as any,
    });
  }
}

class ConnectionMutex {
  #promise?: Promise<void>;
  #resolve?: () => void;

  async lock(): Promise<void> {
    while (this.#promise) {
      await this.#promise;
    }

    this.#promise = new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }

  unlock(): void {
    const resolve = this.#resolve;

    this.#promise = undefined;
    this.#resolve = undefined;

    resolve?.();
  }
}


export class SqliteDialect implements Dialect {
  private config: SqliteDialectConfig;


  constructor(config: SqliteDialectConfig) {
    this.config = config;
  }

  createAdapter() {
    return new SqliteAdapter();
  }

  createDriver() {
    return new SqliteDriver(this.config);
  }

  createIntrospector(db: Kysely<unknown>) {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler() {
    return new SqliteQueryCompiler();
  }

}
