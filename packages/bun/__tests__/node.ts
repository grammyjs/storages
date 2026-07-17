import assert from 'node:assert/strict'
import test from 'node:test'

import { BunSQLAdapter } from '../src/mod.ts'

class Identifier {
	readonly name: string

	constructor(name: string) {
		this.name = name
	}
}

interface QueryCall {
	strings: string[]
	values: unknown[]
}

function createSqlMock(results: unknown[][] = []): {
	sql: Bun.SQL
	calls: QueryCall[]
} {
	const calls: QueryCall[] = []
	const sql = ((first: TemplateStringsArray | string, ...values: unknown[]) => {
		if (typeof first === 'string') return new Identifier(first)
		calls.push({ strings: [...first], values })
		return Promise.resolve(results.shift() ?? [])
	}) as unknown as Bun.SQL
	return { sql, calls }
}

function values(call: QueryCall): unknown[] {
	return call.values.map((value) => (value instanceof Identifier ? value.name : value))
}

test('does not query when constructed', () => {
	const mock = createSqlMock()
	new BunSQLAdapter(mock.sql, { tableName: 'grammy_sessions', dialect: 'postgres' })
	assert.equal(mock.calls.length, 0)
})

test('returns undefined when the session is absent', async () => {
	const mock = createSqlMock([[]])
	const adapter = new BunSQLAdapter(mock.sql, {
		tableName: 'grammy_sessions',
		dialect: 'postgres',
	})

	assert.equal(await adapter.read('chat:1'), undefined)
	assert.deepEqual(mock.calls[0]?.strings, ['SELECT ', ' FROM ', ' WHERE ', ' = ', ''])
	assert.deepEqual(values(mock.calls[0]!), ['value', 'grammy_sessions', 'key', 'chat:1'])
})

test('deserializes a stored JSON session', async () => {
	const mock = createSqlMock([[{ value: '{"pizzaCount":1}' }]])
	const adapter = new BunSQLAdapter<{ pizzaCount: number }>(mock.sql, {
		tableName: 'grammy_sessions',
		dialect: 'sqlite',
	})

	assert.deepEqual(await adapter.read('chat:1'), { pizzaCount: 1 })
})

test('propagates invalid stored JSON', async () => {
	const mock = createSqlMock([[{ value: '{' }]])
	const adapter = new BunSQLAdapter(mock.sql, {
		tableName: 'grammy_sessions',
		dialect: 'mysql',
	})

	await assert.rejects(adapter.read('chat:1'), SyntaxError)
})

test('upserts JSON with ON CONFLICT for PostgreSQL and SQLite', async () => {
	for (const dialect of ['postgres', 'sqlite'] as const) {
		const mock = createSqlMock()
		const adapter = new BunSQLAdapter(mock.sql, { tableName: 'grammy_sessions', dialect })

		await adapter.write('chat:1', { pizzaCount: 1 })

		assert.match(mock.calls[0]?.strings.join('') ?? '', /ON CONFLICT/)
		assert.deepEqual(values(mock.calls[0]!).slice(-2), ['value', 'value'])
		assert.ok(values(mock.calls[0]!).includes('{"pizzaCount":1}'))
	}
})

test('upserts JSON with ON DUPLICATE KEY UPDATE for MySQL', async () => {
	const mock = createSqlMock()
	const adapter = new BunSQLAdapter(mock.sql, {
		tableName: 'grammy_sessions',
		dialect: 'mysql',
	})

	await adapter.write('chat:1', { pizzaCount: 1 })

	assert.match(mock.calls[0]?.strings.join('') ?? '', /ON DUPLICATE KEY UPDATE/)
	assert.deepEqual(values(mock.calls[0]!).slice(-2), ['value', '{"pizzaCount":1}'])
})

test('deletes the session by key', async () => {
	const mock = createSqlMock()
	const adapter = new BunSQLAdapter(mock.sql, {
		tableName: 'grammy_sessions',
		dialect: 'postgres',
	})

	await adapter.delete('chat:1')

	assert.deepEqual(mock.calls[0]?.strings, ['DELETE FROM ', ' WHERE ', ' = ', ''])
	assert.deepEqual(values(mock.calls[0]!), ['grammy_sessions', 'key', 'chat:1'])
})
