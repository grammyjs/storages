import { Bot, Context, session, SessionFlavor } from "grammy";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { PrismaClient } from "@prisma/client";

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const prisma = new PrismaClient();

async function bootstrap() {
  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new PrismaAdapter<SessionData>(prisma.session),
    })
  );

  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);

  bot.start();
}

bootstrap();
