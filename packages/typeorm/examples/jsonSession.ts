import { Bot, Context, session, SessionFlavor } from "grammy";
import { TypeormAdapter } from "@grammyjs/grammy-typeorm-storage";
import { createConnection, getRepository } from 'typeorm';
import { Session } from './SessionEntity';

interface SessionData {
  counter: number;
}
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
      initial: () => ({ counter: 0 }),
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
    })
  );
  
  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);
  
  bot.start();
}

bootstrap()

