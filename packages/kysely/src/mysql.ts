import { Client, ClientConfig } from 'https://deno.land/x/mysql@v2.10.2/mod.ts';

import {
  Kysely,
  DatabaseConnection,
  QueryResult,
  Driver,
  Dialect,
  CompiledQuery,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
} from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/index-nodeless.js';

import { TransactionSettings } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/driver/driver.js';
import { extendStackTrace } from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/util/stack-trace-utils.js';
import {
  isObject,
} from 'https://cdn.jsdelivr.net/npm/kysely/dist/esm/util/object-utils.js';


export class MysqlDriver implements Driver {
  readonly #connections = new WeakMap<Client, DatabaseConnection>();
  #pool: Client;

  constructor(client: Client) {
    this.#pool = client;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  async acquireConnection() {
    let connection = this.#connections.get(this.#pool);

    if (!connection) {
      connection = new MysqlConnection(this.#pool);
      this.#connections.set(this.#pool, connection);
    }

    return connection;
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings
  ): Promise<void> {
    if (settings.isolationLevel) {
      // On MySQL this sets the isolation level of the next transaction.
      await connection.executeQuery(
        CompiledQuery.raw(
          `set transaction isolation level ${settings.isolationLevel}`
        )
      );
    }

    await connection.executeQuery(CompiledQuery.raw('begin'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('rollback'));
  }

  async destroy(): Promise<void> {
    await this.#pool.close();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async releaseConnection() {}
}

function isOkPacket(obj: unknown): obj is { affectedRows: number, lastInsertId: number} {
  return isObject(obj) && 'lastInsertId' in obj && 'affectedRows' in obj;
}

class MysqlConnection implements DatabaseConnection {
  readonly #rawConnection: Client;

  constructor(rawConnection: Client) {
    this.#rawConnection = rawConnection;
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    try {
      const result = await this.#executeQuery(compiledQuery);

      if (isOkPacket(result)) {
        const { lastInsertId, affectedRows } = result;

        return {
          insertId:
          lastInsertId !== undefined &&
          lastInsertId !== null &&
          lastInsertId.toString() !== '0'
            ? BigInt(lastInsertId)
            : undefined,
          numUpdatedOrDeletedRows:
            affectedRows !== undefined && lastInsertId !== null
              ? BigInt(affectedRows)
              : undefined,
          rows: [],
        };
      } else if (Array.isArray(result)) {
        return {
          rows: result as O[],
        };
      }

      return {
        rows: [],
      };
    } catch (err) {
      throw extendStackTrace(err, new Error());
    }
  }

  async #executeQuery(compiledQuery: CompiledQuery) {
    return await this.#rawConnection.execute(compiledQuery.sql, [...compiledQuery.parameters]);
  }
}

export class MysqlDialect implements Dialect {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  createAdapter() {
    return new MysqlAdapter();
  }

  createDriver() {
    return new MysqlDriver(this.client);
  }

  createIntrospector(db: Kysely<unknown>) {
    return new MysqlIntrospector(db);
  }

  createQueryCompiler() {
    return new MysqlQueryCompiler();
  }
}
