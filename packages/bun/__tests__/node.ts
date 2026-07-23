import assert from 'node:assert/strict'
import test from 'node:test'

import { BunS3Adapter, BunSQLAdapter } from '../src/mod.ts'

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

interface S3Call {
	method: 'file' | 'write' | 'delete'
	path: string
	data?: unknown
}

function createS3Mock(initialFiles: Record<string, string> = {}): {
	client: Bun.S3Client
	calls: S3Call[]
	files: Map<string, string>
} {
	const files = new Map(Object.entries(initialFiles))
	const calls: S3Call[] = []
	const client = {
		file(path: string) {
			calls.push({ method: 'file', path })
			return {
				exists: (): Promise<boolean> => Promise.resolve(files.has(path)),
				json: (): Promise<unknown> => Promise.resolve(JSON.parse(files.get(path) ?? '')),
			}
		},
		write(path: string, data: string) {
			calls.push({ method: 'write', path, data })
			files.set(path, data)
			return Promise.resolve(data.length)
		},
		delete(path: string) {
			calls.push({ method: 'delete', path })
			files.delete(path)
			return Promise.resolve()
		},
	} as unknown as Bun.S3Client
	return { client, calls, files }
}

test('s3: returns undefined when the object is absent', async () => {
	const mock = createS3Mock()
	const adapter = new BunS3Adapter(mock.client, { dirName: 'sessions' })

	assert.equal(await adapter.read('chat:1'), undefined)
	assert.deepEqual(mock.calls[0], { method: 'file', path: 'sessions/chat:1.json' })
})

test('s3: deserializes a stored JSON session', async () => {
	const mock = createS3Mock({ 'sessions/chat:1.json': '{"pizzaCount":1}' })
	const adapter = new BunS3Adapter<{ pizzaCount: number }>(mock.client, {
		dirName: 'sessions',
	})

	assert.deepEqual(await adapter.read('chat:1'), { pizzaCount: 1 })
})

test('s3: propagates invalid stored JSON', async () => {
	const mock = createS3Mock({ 'sessions/chat:1.json': '{' })
	const adapter = new BunS3Adapter(mock.client, { dirName: 'sessions' })

	await assert.rejects(adapter.read('chat:1'), SyntaxError)
})

test('s3: writes JSON to the object named after the key', async () => {
	const mock = createS3Mock()
	const adapter = new BunS3Adapter(mock.client, { dirName: 'sessions' })

	await adapter.write('chat:1', { pizzaCount: 1 })

	assert.deepEqual(mock.calls[0], {
		method: 'write',
		path: 'sessions/chat:1.json',
		data: '{"pizzaCount":1}',
	})
	assert.equal(mock.files.get('sessions/chat:1.json'), '{"pizzaCount":1}')
})

test('s3: stores objects at the bucket root without a dirName', async () => {
	const mock = createS3Mock()
	const adapter = new BunS3Adapter(mock.client)

	await adapter.write('chat:1', { pizzaCount: 1 })

	assert.deepEqual(mock.calls[0], {
		method: 'write',
		path: 'chat:1.json',
		data: '{"pizzaCount":1}',
	})
})

test('s3: deletes the object by key', async () => {
	const mock = createS3Mock({ 'sessions/chat:1.json': '{"pizzaCount":1}' })
	const adapter = new BunS3Adapter(mock.client, { dirName: 'sessions' })

	await adapter.delete('chat:1')

	assert.deepEqual(mock.calls[0], { method: 'delete', path: 'sessions/chat:1.json' })
	assert.equal(mock.files.has('sessions/chat:1.json'), false)
})
