import { Bot, Context, session, SessionFlavor } from "grammy";
import { TypeormAdapter } from "@grammyjs/grammy-typeorm-storage";
import { createConnection, getRepository } from 'typeorm';
import { Session } from './SessionEntity';

type SessionData = string
type MyContext = Context & SessionFlavor<SessionData>;

async function bootstrap() {
  await createConnection({
    name: 'default',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [Session],
    synchronize: true,
  });

  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ('initial state'),
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
    })
  );
  
  bot.command("sessionData", (ctx) =>
    ctx.reply(`Current session data is  ${ctx.session}!`)
  );
  
  bot.start();
}

bootstrap()

