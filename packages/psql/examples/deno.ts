import { Bot, Context, session, SessionFlavor } from 'https://deno.land/x/grammy@v1.5.4/mod.ts';
import { PsqlAdapter } from 'https://x.nest.land/grammy-psql-storage@0.0.5/src/mod.ts';
import { Client } from 'https://deno.land/x/postgres@v0.14.2/mod.ts';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

async function bootstrap() {
  const client = new Client({
    user: 'user',
    database: 'test',
    hostname: 'localhost',
    port: 5432,
  });

  await client.connect();

  const bot = new Bot<MyContext>('');
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new PsqlAdapter({ tableName: 'sessions', client }),
    })
  );

  bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`));
  bot.on(':photo', (ctx) => ctx.session.counter++);

  bot.start();
}

bootstrap();
