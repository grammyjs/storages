import { test, expect, describe, beforeEach } from 'vitest';
import { session } from 'grammy';
import { PrismaAdapter } from '../src';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import prisma from './helpers/prisma';

beforeEach(async () => {
  await prisma.session.deleteMany({});
});

describe('Delete test', () => {
  test('A not yet stored record should be nullable without throwing', async () => {
    const bot = createBot();

    bot.use(
      session({
        initial() {
          return { pizzaCount: 0 };
        },
        storage: new PrismaAdapter(prisma.session),
      })
    );

    bot.hears('first', (ctx) => {
      ctx.session = null;
    });

    bot.hears('second', (ctx) => {
      expect(ctx.session).toHaveProperty('pizzaCount');
    });

    const firstMessage = createMessage(bot, 'first');
    const secondMessage = createMessage(bot, 'second');

    await bot.handleUpdate(firstMessage.update);
    await bot.handleUpdate(secondMessage.update);
  });
});