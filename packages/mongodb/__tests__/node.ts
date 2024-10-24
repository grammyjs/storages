import test, {} from 'node:test';
import assert from 'node:assert';

import { session } from 'grammy';
import { Collection, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createBot, createMessage } from '@grammyjs/storage-utils';

import { ISession, MongoDBAdapter } from '../src/mod.ts';

let mongod: MongoMemoryServer;
let client: MongoClient;
let collection: Collection<ISession>;

test.describe('test MongoDBAdapter', () => {
	test.before(async () => {
		mongod = await MongoMemoryServer.create();
		client = new MongoClient(`${mongod.getUri()}/testdb`);
		collection = client.db('testdb').collection('sessions');

		await client.connect();
	});

	test.after(async () => {
		await client.close();
		await mongod.stop();
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
