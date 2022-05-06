import { Bot, Context, session, SessionFlavor } from 'grammy';
import { RedisAdapter } from '@grammyjs/storage-redis';
import IORedis from 'ioredis';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const redisInstance = new IORedis('redis://localhost:6379/0');

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
