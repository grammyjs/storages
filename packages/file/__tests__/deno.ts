import { session } from 'grammy';
import { test } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { FileAdapter } from '../src/mod.ts';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { rm as remove } from 'node:fs/promises';

const dirPath = path.resolve(Deno.cwd(), 'sessions');
const cleanDir = () => remove(dirPath, { recursive: true });

test('Should create sessions dir', async () => {
	new FileAdapter({ dirName: 'sessions' });
	expect(existsSync(dirPath)).toBe(true);

	await cleanDir();
});

test('Pizza counter tests', async () => {
	const bot = createBot();

	bot.use(session({
		initial: () => ({ pizzaCount: 0 }),
		storage: new FileAdapter({ dirName: 'sessions' }),
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

	await cleanDir();
});

test('Simple string tests', async () => {
	const bot = createBot(false);

	bot.use(session({
		initial: () => 'test',
		storage: new FileAdapter({ dirName: 'sessions' }),
	}));

	bot.hears('first', async (ctx) => {
		ctx.session = `${ctx.session} edited`;
	});

	bot.hears('second', async (ctx) => {
		expect(ctx.session).toEqual('test edited');
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);

	await cleanDir();
});
