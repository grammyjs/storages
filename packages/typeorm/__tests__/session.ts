import { session } from 'grammy';
import { getConnection, getRepository } from 'typeorm';
import { TypeormAdapter } from '../src';
import { beforeAll, test, expect, describe } from 'vitest';

import createDbConnection, { Session } from './helpers/createDbConnection';
import { createBot, createMessage } from '@satont/grammy-storage-utils';


beforeAll(async () => {
  await createDbConnection();
});

test('bot should be created', () => {
  expect(createBot()).not.toBeFalsy();
});

test('Typeorm connection test', async () => {
  expect(getConnection().isConnected).toBe(true);

  const key = 'TEST KEY';
  const value = 'TEST VALUE';
  const repository = getRepository(Session);

  await repository.save({ key, value });
  expect((await repository.findOne({ where: { key } })).value).toBe(value);
});

describe('Pizza counter test', () => {
  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const ctx = createMessage(bot);

    bot.use(session({
      initial() {
        return { pizzaCount: 0 };
      },
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
    }));

    await bot.handleUpdate(ctx.update);

    bot.on('msg:text', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(0);
    });
  });

  test('Pizza counter should be equals 1 after first message', async () => {
    const bot = createBot();

    bot.use(session({
      initial: () => ({ pizzaCount: 0 }),
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
    }));

    bot.hears('first', (ctx) => {
      ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
    });
    
    bot.hears('second', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(1);
    });
    
    const firstMessage = createMessage(bot, 'first');
    const secondMessage = createMessage(bot, 'second');

    await bot.handleUpdate(firstMessage.update);
    await bot.handleUpdate(secondMessage.update);
  });
});
