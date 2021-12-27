import { describe, test, expect } from 'vitest'
import { newDb } from 'pg-mem';
import { PsqlAdapter } from '../dist/mod'
import { session } from 'grammy'
import * as utils from '@satont/grammy-storage-utils'

describe('Pizza counter test', () => {
  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = utils.createBot()
    const ctx = utils.createMessage(bot);
    const client = new (newDb().adapters.createPg().Client)

    bot.use(session({
      initial:() => ({ pizzaCount: 0 }),
      storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
    }));

    await bot.handleUpdate(ctx.update);

    bot.on('msg:text', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(0);
    });
  });

  test('Pizza counter should be equals 1 after first message', async () => {
    const bot = utils.createBot();
    const client = new (newDb().adapters.createPg().Client)

    bot.use(session({
      initial: () => ({ pizzaCount: 0 }),
      storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
    }));

    bot.hears('first', (ctx) => {
      ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
    });
    
    bot.hears('second', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(1);
    });
    
    await bot.handleUpdate(utils.createMessage(bot, 'first').update);
    await bot.handleUpdate(utils.createMessage(bot, 'second').update);
  });
});

describe('Simple string test', () => {
  test('Should be changed', async () => {
    const client = new (newDb().adapters.createPg().Client)
    const bot = utils.createBot(false)

    bot.use(session({
      initial: () => 'test',
      storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
    }));

    bot.hears('first', async (ctx) => {
      ctx.session = `${ctx.session} edited`;
    });
    
    bot.hears('second', async (ctx) => {
      expect(ctx.session).toEqual('test edited');
    });
    
    await bot.handleUpdate(utils.createMessage(bot, 'first').update);
    await bot.handleUpdate(utils.createMessage(bot, 'second').update);
  })
})