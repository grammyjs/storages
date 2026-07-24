import assert from 'node:assert'
import { Readable } from 'node:stream'
import test from 'node:test'

import { createBot, createMessage } from '@grammyjs/storage-utils'
import { session } from 'grammy'
import { Client, type BucketItemStat } from 'minio'

import { S3Adapter } from '../src/index.ts'

type UploadedObjectInfo = Awaited<ReturnType<Client['putObject']>>

class FakeMinioClient extends Client {
	readonly store = new Map<string, string>()

	override async getObject(_bucketName: string, objectName: string): Promise<Readable> {
		const data = this.store.get(objectName)

		if (data === undefined) {
			throw Object.assign(new Error('The specified key does not exist.'), { code: 'NoSuchKey' })
		}

		return Readable.from([data])
	}

	override async putObject(
		_bucketName: string,
		objectName: string,
		stream: Readable | Buffer | string
	): Promise<UploadedObjectInfo> {
		if (typeof stream !== 'string') {
			throw new TypeError('FakeMinioClient only supports string payloads')
		}

		this.store.set(objectName, stream)
		return { etag: 'fake-etag', versionId: null }
	}

	override async removeObject(_bucketName: string, objectName: string): Promise<void> {
		this.store.delete(objectName)
	}

	override async statObject(_bucketName: string, objectName: string): Promise<BucketItemStat> {
		const data = this.store.get(objectName)

		if (data === undefined) {
			throw Object.assign(new Error('Not Found'), { code: 'NotFound' })
		}

		return { size: data.length, etag: 'fake-etag', lastModified: new Date(), metaData: {} }
	}
}

const client = new FakeMinioClient({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'test-access-key',
	secretKey: 'test-secret-key',
})

function createAdapter(prefix?: string): S3Adapter<{ pizzaCount: number }> {
	return new S3Adapter(client, { bucket: 'test-bucket', prefix })
}

test('Should throw on missing constructor arguments', () => {
	assert.throws(() => new S3Adapter(client), /bucket/)
	assert.throws(() => new S3Adapter({} as never), /Unsupported client/)
})

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
			storage: new S3Adapter<string>(client, { bucket: 'test-bucket' }),
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
