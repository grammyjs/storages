import pg, { type Client } from 'pg'

import type { StorageAdapter } from 'grammy'

interface AdapterConstructor {
	client: Client
	tableName: string
	query: (query: string, params?: string[] | undefined) => Promise<unknown>
}

interface DbObject {
	key: string
	value: string
}

function buildQueryRunner(client: Client) {
	return async (query: string, params?: string[]): Promise<DbObject[]> => {
		const { rows } = await client.query(query, params)
		return rows as DbObject[]
	}
}

export class PsqlAdapter<T> implements StorageAdapter<T> {
	private tableName: string
	private query: (query: string, params?: string[] | undefined) => Promise<unknown>

	private constructor(opts: AdapterConstructor) {
		this.tableName = opts.tableName
		this.query = opts.query
	}

	static async create(
		opts = { tableName: 'sessions' } as Omit<AdapterConstructor, 'query'>
	): Promise<PsqlAdapter<unknown>> {
		const tableName = pg.escapeIdentifier(opts.tableName)
		// Preserve existing index names: PostgreSQL folds only ASCII A–Z in unquoted UTF-8
		// identifiers, while JavaScript’s toLowerCase() also lowercases letters such as É.
		const foldedName = opts.tableName.replace(/[A-Z]/g, (letter) => letter.toLowerCase())
		const indexName = pg.escapeIdentifier(`idx_${foldedName}`)
		const queryString = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        "key" VARCHAR NOT NULL,
        "value" TEXT
      )`
		const query = buildQueryRunner(opts.client)
		await query(queryString)
		await query(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${tableName} ("key")`)

		return new PsqlAdapter({
			...opts,
			tableName,
			query,
		})
	}

	private async findSession(key: string): Promise<DbObject | undefined> {
		const results = (await this.query(`select * from ${this.tableName} where key = $1`, [
			key,
		])) as DbObject[]
		return results[0]
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.findSession(key)

		if (!session) {
			return undefined
		}

		return JSON.parse(session.value) as T
	}

	async write(key: string, value: T): Promise<void> {
		await this.query(
			`
      INSERT INTO ${this.tableName} (key, value)
      values ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = $2`,
			[key, JSON.stringify(value)]
		)
	}

	async delete(key: string): Promise<void> {
		await this.query(`delete from ${this.tableName} where key = $1`, [key])
	}
}
