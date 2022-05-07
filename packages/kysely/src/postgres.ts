import * as PG from 'https://deno.land/x/postgres@v0.15.0/mod.ts';

import {
  Kysely,
  DatabaseConnection,
  QueryResult,
  Driver,
  Dialect,
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/index-nodeless.js';

import { TransactionSettings } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/driver/driver.js';
import { extendStackTrace } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/util/stack-trace-utils.js';

const PRIVATE_RELEASE_METHOD = Symbol();

class PostgresDriver implements Driver {
  readonly #connections = new WeakMap<PG.PoolClient, DatabaseConnection>();
  #pool?: PG.Pool;

  constructor(configOrPool: PG.Pool) {
    this.#pool = configOrPool;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  async acquireConnection() {
    const client = await this.#pool!.connect();
    let connection = this.#connections.get(client);

    if (!connection) {
      connection = new PostgresConnection(client);
      this.#connections.set(client, connection);
    }

    return connection;
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings
  ): Promise<void> {
    if (settings.isolationLevel) {
      await connection.executeQuery(
        CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`
        )
      );
    } else {
      await connection.executeQuery(CompiledQuery.raw('begin'));
    }
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('rollback'));
  }

  async releaseConnection(connection: PostgresConnection): Promise<void> {
    connection[PRIVATE_RELEASE_METHOD]();
  }

  async destroy(): Promise<void> {
    if (this.#pool) {
      const pool = this.#pool;
      this.#pool = undefined;
      await pool.end();
    }
  }
}

class PostgresConnection implements DatabaseConnection {
  #client: PG.PoolClient;

  constructor(client: PG.PoolClient) {
    this.#client = client;
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    try {
      console.log(compiledQuery.sql);
      const result = await this.#client.queryObject<O>(compiledQuery.sql, [...compiledQuery.parameters]);

      if (result.command === 'UPDATE' || result.command === 'DELETE') {
        return {
          numUpdatedOrDeletedRows: result.rowCount ? BigInt(result.rowCount) : undefined,
          rows: result.rows ?? [],
        };
      }

      return {
        rows: result.rows ?? [],
      };
    } catch (err) {
      throw extendStackTrace(err, new Error());
    }
  }

  [PRIVATE_RELEASE_METHOD](): void {
    this.#client.release();
  }
}


export class PostgresDialect implements Dialect {
  private pool: PG.Pool;

  constructor(pool: PG.Pool) {
    this.pool = pool;
  }

  createAdapter() {
    return new PostgresAdapter();
  }

  createDriver() {
    return new PostgresDriver(this.pool);
  }

  createIntrospector(db: Kysely<unknown>) {
    return new PostgresIntrospector(db);
  }

  createQueryCompiler() {
    return new PostgresQueryCompiler();
  }
}
