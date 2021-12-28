import { Bot, Context, session, SessionFlavor } from 'https://deno.land/x/grammy@v1.5.4/mod.ts';
import { RedisAdapter } from 'https://x.nest.land/grammy-psql-storage@0.0.5/src/mod.ts';
import { connect } from 'https://deno.land/x/redis@v0.25.0/mod.ts';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const redisInstance = await connect({
  hostname: '127.0.0.1',
  port: 6379,
  db: 0,
});

//create storage
const storage = new RedisAdapter({ instance: redisInstance, ttl: 10 });

// Create bot and register session middleware
const bot = new Bot<MyContext>('');
bot.use(
  session({
    initial: () => ({ counter: 0 }),
    storage,
  }),
);

// Register your usual middleware, and start the bot
bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`));
bot.on(':photo', (ctx) => ctx.session.counter++);

bot.start();
