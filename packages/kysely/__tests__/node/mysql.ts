// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import test from 'node:test';
import assert from 'node:assert';

import { SqlAdapter } from '../../dist/esm/mod';
import { session } from 'grammy';
import * as utils from '@grammyjs/storage-utils';
import { JsonSessionData } from '@grammyjs/storage-utils';
import MySQL from 'mysql2/promise';
const { createPool } = MySQL;

const pool = createPool({ host: 'localhost', user: 'root', password: 'satont', database: 'grammy', port: 3306 });

await test('Pizza counter test', async () => {
  const bot = utils.createBot();
  const storage = await SqlAdapter.create<JsonSessionData>('mysql', pool);

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
    storage,
  }) as any);

  bot.hears('first', (ctx) => {
    assert.equal(ctx.session.pizzaCount, 0);
    ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
  });
  
  bot.hears('second', (ctx) => {
    assert.equal(ctx.session.pizzaCount, 1);
  });
  
  await bot.handleUpdate(utils.createMessage(bot, 'first').update);
  await bot.handleUpdate(utils.createMessage(bot, 'second').update);

  //await pool.query('drop table sessions');
});

await test('Should be changed', async () => {
  const bot = utils.createBot(false);
  const storage = await SqlAdapter.create<string>('mysql', pool);

  bot.use(session({
    initial: () => 'test',
    storage: storage,
  }) as any);

  bot.hears('first', async (ctx) => {
    ctx.session = `${ctx.session} edited`;
  });
  
  bot.hears('second', async (ctx) => {
    assert.equal(ctx.session, 'test edited');
  });
  
  await bot.handleUpdate(utils.createMessage(bot, 'first').update);
  await bot.handleUpdate(utils.createMessage(bot, 'second').update);

  //await pool.query('drop table sessions');
});

await pool.end();