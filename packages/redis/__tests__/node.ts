// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import test from 'node:test';
import assert from 'node:assert';

import { Bot, Context, session } from 'grammy';
import { RedisAdapter } from '../dist/esm/mod';
import { RedisMock } from './redisMock';
import { createBot, createMessage } from '@grammyjs/storage-utils';

test('Pizza counter tests', async () => {
  const bot = createBot();

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
    storage: new RedisAdapter({ instance: new RedisMock() as any }),
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
  interface StringSessionFlavor {
    get session(): string;
    set session(session: string | null | undefined);
  }

  const bot = new Bot<Context & StringSessionFlavor>('fake-token', { 
    botInfo: {
      id: 42,
      first_name: 'Test Bot',
      is_bot: true,
      username: 'bot',
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false,
    },
  });

  bot.use(session({
    initial: () => 'test',
    storage: new RedisAdapter({ instance: new RedisMock() as any }),
  }));

  bot.hears('first', async (ctx) => {
    assert.equal(ctx.session, 'test');
    ctx.session = `${ctx.session} edited`;
  });
  
  bot.hears('second', async (ctx) => {
    assert.equal(ctx.session, 'test edited');
  });
  
  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);
});