import assert from 'node:assert'
import { Readable } from 'node:stream'
import test from 'node:test'

import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { createBot, createMessage } from '@grammyjs/storage-utils'
import { sdkStreamMixin } from '@smithy/util-stream'
import { mockClient } from 'aws-sdk-client-mock'
import { session } from 'grammy'

import { S3Adapter } from '../src/index.ts'

const s3Mock = mockClient(S3Client)
const store = new Map<string, string>()

function notFoundError(name: string): Error {
	const error = new Error(name)
	error.name = name
	return error
}

s3Mock.on(GetObjectCommand).callsFake((input) => {
	const data = store.get(input.Key ?? '')

	if (data === undefined) {
		throw notFoundError('NoSuchKey')
	}

	return { Body: sdkStreamMixin(Readable.from([data])) }
})

s3Mock.on(PutObjectCommand).callsFake((input) => {
	if (!input.Key || typeof input.Body !== 'string') {
		throw new TypeError('Unexpected PutObjectCommand input')
	}

	store.set(input.Key, input.Body)
	return {}
})

s3Mock.on(DeleteObjectCommand).callsFake((input) => {
	store.delete(input.Key ?? '')
	return {}
})

s3Mock.on(HeadObjectCommand).callsFake((input) => {
	if (!store.has(input.Key ?? '')) {
		throw notFoundError('NotFound')
	}

	return {}
})

const client = new S3Client({ region: 'us-east-1' })

function createAdapter(prefix?: string): S3Adapter<{ pizzaCount: number }> {
	return new S3Adapter(client, { bucket: 'test-bucket', prefix })
}

test('Should throw on missing constructor arguments', () => {
	assert.throws(() => new S3Adapter(client), /bucket/)
	assert.throws(() => new S3Adapter({} as never), /Unsupported client/)
})

test('Adapter CRUD', async () => {
	store.clear()
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
	store.clear()
	const adapter = createAdapter('sessions/')

	await adapter.write('key', { pizzaCount: 1 })
	assert.ok(store.has('sessions/key'))
	assert.deepEqual(await adapter.read('key'), { pizzaCount: 1 })
})

test('Pizza counter tests', async () => {
	store.clear()

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
	store.clear()

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
