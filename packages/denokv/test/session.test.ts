import { DenoKVAdapter } from '../src/adapter.ts';
import { session } from 'grammy';
import { test } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { createBot, createMessage } from '@grammyjs/storage-utils';

test('Simple string tests', async () => {
	const tempFilePath = await Deno.makeTempFile();
	const bot = createBot(false);
	const kv = await Deno.openKv(tempFilePath);

	bot.use(session({
		initial: () => 'test',
		storage: new DenoKVAdapter(kv),
	}));

	bot.hears('first', (ctx) => {
		ctx.session = `${ctx.session} edited`;
	});

	bot.hears('second', (ctx) => {
		expect(ctx.session).toEqual('test edited');
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);

	await kv.close();
	Deno.removeSync(tempFilePath);
});

test('Pizza counter tests', async () => {
	const tempFilePath = await Deno.makeTempFile();
	const bot = createBot();
	const kv = await Deno.openKv(tempFilePath);

	bot.use(session({
		initial: () => ({ pizzaCount: 0 }),
		storage: new DenoKVAdapter(kv),
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

	await kv.close();
	Deno.removeSync(tempFilePath);
});
