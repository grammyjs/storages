import { Bot, Context, session, SessionFlavor } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdapter } from '@grammyjs/storage-supabase';

// This bot will collect some basic statistics about each chat. They can be
// retrieved with the `/stats` command.

// This is the data that will be saved per chat.
interface SessionData {
  messages: number;
  edits: number;
}

// flavor the context type to include sessions
type MyContext = Context & SessionFlavor<SessionData>;

// supabase instance
const supabase = createClient('http://localhost:3000', 'some.fake.key');

//create storage
const storage = supabaseAdapter({
  supabase,
  table: 'session', // the defined table name you want to use to store your session
});

// Create a bot
const bot = new Bot<MyContext>('token'); // <-- place your token inside this string

// Note that using `session()` will only save the data in-memory. If the Node
// process terminates, all data will be lost. A bot running in production will
// need some sort of database or file storage to persist data between restarts.
// Confer the grammY documentation to find out how to store data with your bot.
bot.use(
  session({
    storage,
    initial: () => ({ messages: 1, edits: 0 }),
  }),
);

// Collect statistics
bot.on('message', async (ctx, next) => {
  ctx.session.messages++;
  await ctx.reply(`Message received and totalling to ${ctx.session.messages}`);
  await next();
});

bot.on('edited_message', async (ctx, next) => {
  ctx.session.edits++;
  await ctx.reply(`Message has been updated and totalling to ${ctx.session.edits} edits`);

  await next();
});

bot
  .filter((ctx) => ctx.chat?.type === 'private')
  .command('start', (ctx) => ctx.reply('Hi there! I will count the messages in this chat so you can get your /stats!'));

bot.on(':new_chat_members:me', (ctx) => ctx.reply('Hi everyone! I will count the messages in this chat so you can get your /stats!'));

// Send statistics upon `/stats`
bot.command('stats', async (ctx) => {
  const stats = ctx.session;

  // Format stats to string
  const message = `You sent <b>${stats.messages} messages</b> since I'm here! You edited messages <b>${stats.edits} times</b>—that is <b>${
    stats.edits / stats.messages
  } edits</b> per message on average!`;

  // Send message in same chat using `reply` shortcut. Don't forget to `await`!
  await ctx.reply(message, { parse_mode: 'HTML' });
});

// Catch errors and log them
bot.catch((err) => {
  console.error(err);
});

// Start bot!
bot.start();