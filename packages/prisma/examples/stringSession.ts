import { Bot, Context, session, SessionFlavor } from "grammy";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { PrismaClient } from '@prisma/client';

type SessionData = string
type MyContext = Context & SessionFlavor<SessionData>;

const prisma = new PrismaClient();

async function bootstrap() {
  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ('initial state'),
      storage: new PrismaAdapter(prisma.session),
    })
  );
  
  bot.command("sessionData", (ctx) =>
    ctx.reply(`Current session data is  ${ctx.session}!`)
  );
  
  bot.start();
}

bootstrap()

