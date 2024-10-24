import test from 'node:test';
import * as assert from 'node:assert';

import { newDb } from 'pg-mem';
import { PsqlAdapter } from '../src/mod.ts';
import { session } from 'grammy';
import * as utils from '@grammyjs/storage-utils';

test('Pizza counter test', async () => {
	const bot = utils.createBot();
	const client = new (newDb().adapters.createPg().Client)();

	bot.use(session({
		initial: () => ({ pizzaCount: 0 }),
		storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
	}));

	bot.hears('first', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 0);
		ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
	});

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 1);
	});

	await bot.handleUpdate(utils.createMessage(bot, 'first').update);
	await bot.handleUpdate(utils.createMessage(bot, 'second').update);
});

test('Should be changed', async () => {
	const client = new (newDb().adapters.createPg().Client)();
	const bot = utils.createBot(false);

	bot.use(session({
		initial: () => 'test',
		storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
	}));

	bot.hears('first', async (ctx) => {
		ctx.session = `${ctx.session} edited`;
	});

	bot.hears('second', async (ctx) => {
		assert.equal(ctx.session, 'test edited');
	});

	await bot.handleUpdate(utils.createMessage(bot, 'first').update);
	await bot.handleUpdate(utils.createMessage(bot, 'second').update);
});
