import { Collection, MongoClient } from 'mongodb';
import { test } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { session } from 'grammy';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { MongoDBAdapter } from '../../src/mod.ts';

const createMongoClient = async () => {
	const client = new MongoClient(`mongodb://localhost:27017/testdb `);
	await client.connect();

	return client;
};

const clearCollection = (col: Collection<any>) => col.deleteMany({});

test('Pizza counter tests', async () => {
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

test('Simple string tests', async () => {
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
