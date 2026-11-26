import assert from 'node:assert'
import test from 'node:test'

import * as utils from '@grammyjs/storage-utils'
import { session } from 'grammy'
import { newDb } from 'pg-mem'

import { PsqlAdapter } from '../src/mod.ts'

test('Pizza counter test', async () => {
	const bot = utils.createBot()
	const client = new (newDb().adapters.createPg().Client)()

	bot.use(
		session({
			initial: () => ({ pizzaCount: 0 }),
			storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
		})
	)

	bot.hears('first', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 0)
		ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1
	})

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 1)
	})

	await bot.handleUpdate(utils.createMessage(bot, 'first').update)
	await bot.handleUpdate(utils.createMessage(bot, 'second').update)
})

test('Should be changed', async () => {
	const client = new (newDb().adapters.createPg().Client)()
	const bot = utils.createBot(false)

	bot.use(
		session({
			initial: () => 'test',
			storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
		})
	)

	bot.hears('first', async (ctx) => {
		ctx.session = `${ctx.session} edited`
	})

	bot.hears('second', async (ctx) => {
		assert.equal(ctx.session, 'test edited')
	})

	await bot.handleUpdate(utils.createMessage(bot, 'first').update)
	await bot.handleUpdate(utils.createMessage(bot, 'second').update)
})

for (const tableName of ["my'sessions", 'my"sessions']) {
	test(`stores and deletes sessions in table ${tableName}`, async () => {
		const client = new (newDb().adapters.createPg().Client)()
		const storage = await PsqlAdapter.create({ client, tableName })

		await storage.write('chat', 'first')
		assert.equal(await storage.read('chat'), 'first')
		await storage.write('chat', 'second')
		assert.equal(await storage.read('chat'), 'second')
		await storage.delete('chat')
		assert.equal(await storage.read('chat'), undefined)
	})
}

test('preserves the legacy index name for a mixed-case table', async () => {
	const db = newDb()
	const client = new (db.adapters.createPg().Client)()

	await PsqlAdapter.create({ client, tableName: 'MyÉSessions' })

	assert.deepEqual(
		db.public
			.getTable('MyÉSessions')
			.listIndices()
			.map((index) => index.name),
		['idx_myÉsessions']
	)
})
