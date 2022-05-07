// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import test from 'node:test';
import assert from 'node:assert';

import { session } from 'grammy';
import { FileAdapter } from '../dist/esm/mod';
import { fs, path, cwd } from '../dist/esm/deps.node';
import { createBot, createMessage } from '@grammyjs/storage-utils';

const dirPath = path.resolve(cwd(), 'sessions');
const cleanDir = async () => {
  await fs.remove(dirPath).catch(() => null);
};

test('Should create sessions dir', async () => {
  await cleanDir();

  new FileAdapter({ dirName: 'sessions' });
  assert.ok(fs.existsSync(dirPath));
});

test('Pizza counter tests', async () => {
  await cleanDir();

  const bot = createBot();

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
    storage: new FileAdapter({ dirName: 'sessions' }),
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
 

test('Simple string tests', async () => {
  await cleanDir();

  const bot = createBot(false);

  bot.use(session({
    initial: () => 'test',
    storage: new FileAdapter({ dirName: 'sessions' }),
  }));

  bot.hears('first', async (ctx) => {
    ctx.session = `${ctx.session} edited`;
  });
  
  bot.hears('second', async (ctx) => {
    assert.equal(ctx.session, 'test edited');
  });
  
  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);
});