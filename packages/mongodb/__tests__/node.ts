import test, {} from 'node:test';
import assert from 'node:assert';

import { session } from 'grammy';
import { MongoClient } from 'mongodb';
import { createBot, createMessage } from '@grammyjs/storage-utils';

import { ISession, MongoDBAdapter } from '../src/mod.ts';

const client = new MongoClient(`mongodb://localhost:27017/testdb`);
let collection = client.db('testdb').collection<ISession>('sessions');

test.describe('test MongoDBAdapter', () => {
	test.before(async () => {
		await client.connect();
	});

	test.after(async () => {
		await client.close();
	});

	test.beforeEach(async () => {
		if (collection) {
			await collection.deleteMany({});
		}
	});

	test.it('Pizza counter test', async () => {
		const bot = createBot();

		bot.use(session({
			initial: () => ({ pizzaCount: 0 }),
			storage: new MongoDBAdapter({ collection }),
		}));

		bot.hears('first', (ctx) => {
			assert.equal(ctx.session.pizzaCount, 0);
			ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
		});

		bot.hears('second', (ctx) => {
			assert.equal(ctx.session.pizzaCount, 1);
		});

		await bot.handleUpdate(createMessage(bot, 'first').update);
		await bot.handleUpdate(createMessage(bot, 'second').update);
	});

	test.it('Test storing of simple string', async () => {
		const bot = createBot(false);

		bot.use(session({
			initial() {
				return 'test';
			},
			storage: new MongoDBAdapter({ collection }),
		}));

		bot.hears('first', async (ctx) => {
			assert.equal(ctx.session, 'test');
			ctx.session = `${ctx.session} edited`;
		});

		bot.hears('second', async (ctx) => {
			assert.equal(ctx.session, 'test edited');
		});

		await bot.handleUpdate(createMessage(bot, 'first').update);
		await bot.handleUpdate(createMessage(bot, 'second').update);
	});
});
