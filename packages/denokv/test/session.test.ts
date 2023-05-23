import { DenoKVAdapter } from '../src/adapter.ts';
import { session } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { expect } from 'https://deno.land/x/expect@v0.2.9/mod.ts';
import { createBot, createMessage } from '../../../libs/utils/src/mod.ts';

Deno.test('Simple string tests', async () => {
  const tempFilePath = await Deno.makeTempFile();
  const bot = createBot(false);
  const kv = await Deno.openKv(tempFilePath);

  bot.use(session({
    initial: () => 'test',
    storage: new DenoKVAdapter(kv),
  }));

  bot.hears('first', (ctx) => {
    ctx.session = `${ctx.session} edited`;
  });

  bot.hears('second', (ctx) => {
    expect(ctx.session).toEqual('test edited');
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);

  await kv.close();
  Deno.removeSync(tempFilePath);
});

Deno.test('Pizza counter tests', async () => {
  const tempFilePath = await Deno.makeTempFile();
  const bot = createBot();
  const kv = await Deno.openKv(tempFilePath);

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
    storage: new DenoKVAdapter(kv),
  }));

  bot.hears('first', (ctx) => {
    expect(ctx.session.pizzaCount).toEqual(0);
    ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
  });

  bot.hears('second', (ctx) => {
    expect(ctx.session.pizzaCount).toEqual(1);
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);

  await kv.close();
  Deno.removeSync(tempFilePath);
});
