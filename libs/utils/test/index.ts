import ava from 'ava';
import { Bot, session } from 'grammy';
import { createBot, createMessage } from '../dist/cjs/mod';

ava('Should create json session bot', async (t) => {
  const bot = createBot();
  t.assert(bot instanceof Bot);

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
  }));

  bot.on('message', (ctx) => {
    t.not(typeof ctx.session?.pizzaCount, 'undefined');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

ava('Should create string session bot', async (t) => {
  const bot = createBot(false);
  t.assert(bot instanceof Bot);

  bot.use(session({
    initial: () => 'test',
  }));

  bot.on('message', (ctx) => {
    t.is(typeof ctx.session, 'string');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
});

ava('Should create message', (t) => {
  const bot = createBot();
  const message = createMessage(bot, 'Test');

  t.truthy(message.update.update_id);
  t.is(message.message.text, 'Test');
});