import { test } from 'vitest';
import { Bot, session } from 'grammy';
import { createBot, createMessage } from '../dist/cjs/mod';

test('Should create json session bot', async (t) => {
  const bot = createBot();
  t.expect(bot).toBeInstanceOf(Bot);

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
  }));

  bot.on('message', (ctx) => {
    t.expect(ctx.session?.pizzaCount).not.toBeTypeOf('undefined');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

test('Should create string session bot', async (t) => {
  const bot = createBot(false);
  t.expect(bot).toBeInstanceOf(Bot);

  bot.use(session({
    initial: () => 'test',
  }));

  bot.on('message', (ctx) => {
    t.expect(ctx.session).toBeTypeOf('string');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

test('Should create message', (t) => {
  const bot = createBot();
  const message = createMessage(bot, 'Test');

  t.expect(message.update.update_id).toBeTruthy();
  t.expect(message.message.text).toBe('Test');
});