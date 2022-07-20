import { test, expect, describe, beforeEach } from 'vitest';
import { session } from 'grammy';
import { PrismaAdapter } from '../src';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import prisma from '../src/prismaClient';

beforeEach(async () => {
  await prisma.session.deleteMany({});
});

test('bot should be created', () => {
  expect(createBot()).not.toBeFalsy();
});

describe('Test string session', () => {
  test('Initial session state should equals "test"', async () => {
    const bot = createBot(false);
    const ctx = createMessage(bot);
    bot.use(session({
      initial() {
        return 'test';
      },
      storage: new PrismaAdapter(prisma.session),
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
      storage: new PrismaAdapter(prisma.session),
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