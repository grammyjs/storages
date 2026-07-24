import assert from 'node:assert'
import test from 'node:test'

import { createBot, createMessage } from '@grammyjs/storage-utils'
import { session } from 'grammy'

import { S3Adapter } from '../src/index.ts'

class FakeS3File {
	private readonly store: Map<string, string>
	private readonly path: string

	constructor(store: Map<string, string>, path: string) {
		this.store = store
		this.path = path
	}

	async exists(): Promise<boolean> {
		return this.store.has(this.path)
	}

	async text(): Promise<string> {
		return this.store.get(this.path) ?? ''
	}
}

class FakeBunS3Client {
	readonly store = new Map<string, string>()

	file(path: string): FakeS3File {
		return new FakeS3File(this.store, path)
	}

	async write(path: string, data: string): Promise<number> {
		this.store.set(path, data)
		return data.length
	}

	async delete(path: string): Promise<void> {
		this.store.delete(path)
	}
}

Object.assign(globalThis, { Bun: { S3Client: FakeBunS3Client } })

const client = new FakeBunS3Client()

function createAdapter(prefix?: string): S3Adapter<{ pizzaCount: number }> {
	return new S3Adapter(client, { prefix })
}

test('Adapter CRUD', async () => {
	client.store.clear()
	const adapter = createAdapter()

	assert.equal(await adapter.read('key'), undefined)
	assert.equal(await adapter.has('key'), false)

	await adapter.write('key', { pizzaCount: 42 })
	assert.deepEqual(await adapter.read('key'), { pizzaCount: 42 })
	assert.equal(await adapter.has('key'), true)

	await adapter.delete('key')
	assert.equal(await adapter.read('key'), undefined)
	assert.equal(await adapter.has('key'), false)
})

test('Adapter respects prefix', async () => {
	client.store.clear()
	const adapter = createAdapter('sessions/')

	await adapter.write('key', { pizzaCount: 1 })
	assert.ok(client.store.has('sessions/key'))
	assert.deepEqual(await adapter.read('key'), { pizzaCount: 1 })
})

test('Pizza counter tests', async () => {
	client.store.clear()

	const bot = createBot()

	bot.use(
		session({
			initial: () => ({ pizzaCount: 0 }),
			storage: createAdapter(),
		})
	)

	bot.hears('first', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 0)
		ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1
	})

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 1)
	})

	await bot.handleUpdate(createMessage(bot, 'first').update)
	await bot.handleUpdate(createMessage(bot, 'second').update)
})

test('Simple string tests', async () => {
	client.store.clear()

	const bot = createBot(false)

	bot.use(
		session({
			initial: () => 'test',
			storage: new S3Adapter<string>(client),
		})
	)

	bot.hears('first', (ctx) => {
		ctx.session = `${ctx.session} edited`
	})

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session, 'test edited')
	})

	await bot.handleUpdate(createMessage(bot, 'first').update)
	await bot.handleUpdate(createMessage(bot, 'second').update)
})
