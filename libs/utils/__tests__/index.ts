// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert';

import { Bot, session } from 'grammy';
import { createBot, createMessage } from '../dist/esm/mod.js';

test('Should create json session bot', async () => {
  const bot = createBot();
  assert.ok(bot instanceof Bot);

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
  }));

  bot.on('message', (ctx) => {
    assert.ok(typeof ctx.session?.pizzaCount !== 'undefined');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

test('Should create string session bot', async () => {
  const bot = createBot(false);
  assert.ok(bot instanceof Bot);

  bot.use(session({
    initial: () => 'test',
  }));

  bot.on('message', (ctx) => {
    assert.ok(typeof ctx.session === 'string');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

test('Should create message', () => {
  const bot = createBot();
  const message = createMessage(bot, 'Test');

  assert.ok(Boolean(message.update.update_id));
  assert.equal(message.message.text, 'Test');
});