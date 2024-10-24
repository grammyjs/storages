import { Collection, MongoClient } from 'mongodb';
import { expect } from 'https://deno.land/x/expect@v0.4.0/mod.ts';
import { session } from 'grammy';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { MongoDBAdapter } from '../src/mod.ts';

Deno.test('Pizza counter tests', async () => {
	const client = await createMongoClient();
	const db = client.db('testdb');
	const collection = db.collection<any>('sessions');

	const bot = createBot();

	bot.use(session({
		initial: () => ({ pizzaCount: 0 }),
		storage: new MongoDBAdapter({ collection }),
	}));

	bot.hears('first', (ctx) => {
		expect(ctx.session.pizzaCount).toEqual(0);
		ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
	});

	bot.hears('second', (ctx) => {
		expect(ctx.session.pizzaCount).toEqual(1);
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);

	await clearCollection(collection);
	client.close();
});

Deno.test('Simple string tests', async () => {
	const client = await createMongoClient();
	const db = client.db('testdb');
	const collection = db.collection<any>('sessions');

	const bot = createBot(false);

	bot.use(session({
		initial() {
			return 'test';
		},
		storage: new MongoDBAdapter({ collection }),
	}));

	bot.hears('first', async (ctx) => {
		ctx.session = `${ctx.session} edited`;
	});

	bot.hears('second', async (ctx) => {
		expect(ctx.session).toEqual('test edited');
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);

	await clearCollection(collection);
	client.close();
});

const createMongoClient = async () => {
	const client = new MongoClient();
	await client.connect({
		servers: [{ host: 'localhost', port: 27017 }],
		db: 'testdb',
	});

	return client;
};

const clearCollection = (col: Collection<any>) => col.deleteMany({});
