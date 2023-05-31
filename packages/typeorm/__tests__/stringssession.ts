import { beforeAll, test, expect, describe } from 'vitest';

import { session } from 'grammy';
import { DataSource } from 'typeorm';
import { TypeormAdapter } from '../src';

import createDbConnection, { Session } from './helpers/createDbConnection';
import { createBot, createMessage } from '@grammyjs/storage-utils';

let source: DataSource;

beforeAll(async () => {
  source = await createDbConnection();
});

describe('Test string session', () => {
  test('Initial session state should equals "test"', async () => {
    const bot = createBot(false);
    const ctx = createMessage(bot);
    bot.use(session({
      initial() {
        return 'test';
      },
      storage: new TypeormAdapter({ repository: source.getRepository(Session) }),
    }));

    await bot.handleUpdate(ctx.update);

    bot.on('msg:text', (ctx) => {
      expect(ctx.session).toEqual(test);
    });
  });

  test('Session state should be changed to "testqwe" after message', async () => {
    const bot = createBot(false);

    bot.use(session({
      initial() {
        return 'test';
      },
      storage: new TypeormAdapter({ repository: source.getRepository(Session) }),
    }));

    
    bot.hears('first', (ctx) => {
      expect(ctx.session).toEqual('test');
      ctx.session = ctx.session + 'qwe';
    });

    bot.hears('second', (ctx) => {
      expect(ctx.session).toEqual('testqwe');
    });

    await bot.handleUpdate(createMessage(bot, 'first').update);
    await bot.handleUpdate(createMessage(bot, 'second').update);
  });
});