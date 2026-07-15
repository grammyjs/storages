import type { SQL } from 'bun'
import type { StorageAdapter } from 'grammy'

export type BunSQLDialect = 'postgres' | 'sqlite' | 'mysql'

export interface BunSQLAdapterOptions {
	tableName: string
	dialect: BunSQLDialect
}

interface SessionRow {
	value: string
}

export class BunSQLAdapter<T> implements StorageAdapter<T> {
	private readonly sql: SQL
	private readonly options: BunSQLAdapterOptions

	constructor(sql: SQL, options: BunSQLAdapterOptions) {
		this.sql = sql
		this.options = options
	}

	async read(key: string): Promise<T | undefined> {
		const [session] = (await this
			.sql`SELECT ${this.sql('value')} FROM ${this.sql(this.options.tableName)} WHERE ${this.sql('key')} = ${key}`) as SessionRow[]
		return session === undefined ? undefined : (JSON.parse(session.value) as T)
	}

	async write(key: string, value: T): Promise<void> {
		const table = this.sql(this.options.tableName)
		const keyColumn = this.sql('key')
		const valueColumn = this.sql('value')
		const serialized = JSON.stringify(value)

		if (this.options.dialect === 'mysql') {
			await this
				.sql`INSERT INTO ${table} (${keyColumn}, ${valueColumn}) VALUES (${key}, ${serialized}) ON DUPLICATE KEY UPDATE ${valueColumn} = ${serialized}`
			return
		}

		await this
			.sql`INSERT INTO ${table} (${keyColumn}, ${valueColumn}) VALUES (${key}, ${serialized}) ON CONFLICT (${keyColumn}) DO UPDATE SET ${valueColumn} = EXCLUDED.${valueColumn}`
	}

	async delete(key: string): Promise<void> {
		await this
			.sql`DELETE FROM ${this.sql(this.options.tableName)} WHERE ${this.sql('key')} = ${key}`
	}
}
