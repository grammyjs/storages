import { session } from 'grammy';
import { PrismaAdapter } from '../src';
import { test, expect, describe } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createBot, createMessage } from '@grammyjs/storage-utils';

const prisma = new PrismaClient();

test('bot should be created', () => {
  expect(createBot()).not.toBeFalsy();
});

test('Prisma connection test', async () => {
  const key = 'TEST KEY';
  const value = 'TEST VALUE';

  await prisma.session.create({ data: { key, value } });
  expect((await prisma.session.findUnique({ where: { key } })).value).toBe(value);
});

describe('Pizza counter test', () => {
  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const ctx = createMessage(bot);

    bot.use(
      session({
        initial() {
          return { pizzaCount: 0 };
        },
        storage: new PrismaAdapter(prisma.session),
      })
    );

    await bot.handleUpdate(ctx.update);

    bot.on('msg:text', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(0);
    });
  });

  test('Pizza counter should be equals 1 after first message', async () => {
    const bot = createBot();

    bot.use(
      session({
        initial: () => ({ pizzaCount: 0 }),
        storage: new PrismaAdapter(prisma.session),
      })
    );

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
