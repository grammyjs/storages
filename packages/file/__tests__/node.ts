
import { session } from 'grammy';
import { FileAdapter } from '../dist/cjs/mod';
import { fs, path, cwd } from '../dist/cjs/deps.node';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { test, beforeEach, expect } from 'vitest';

const dirPath = path.resolve(cwd(), 'sessions');
const cleanDir = async () => {
  await fs.remove(dirPath).catch(() => null);
};

beforeEach(async () => await cleanDir());

test('Should create sessions dir', async () => {
  new FileAdapter({ dirName: 'sessions' });
  expect(fs.existsSync(dirPath)).toBe(true);
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
});