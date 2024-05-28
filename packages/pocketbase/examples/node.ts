import { Bot, session, type SessionFlavor, type Context } from "grammy";
import { PocketbaseAdapter } from "@grammyjs/storage-pocketbase";

interface SessionData {
  messagesCount: number;
}

type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(process.env.botToken!);

bot.use(
  session({
    initial: () => ({ messagesCount: 0 }),
    storage: new PocketbaseAdapter({
      pocketbaseInstanceUrl: '', // for example: http://127.0.0.1:8090 
      botToken: process.env.botToken!
    })
  })
);

bot.on("message", async ctx => {
  ctx.session.messagesCount++;

  const message = `Your messages count: ${ctx.session.messagesCount}`;

  await ctx.reply(message);
});

bot.start({
  onStart: () => {
    console.log("POLLING");
  }
});