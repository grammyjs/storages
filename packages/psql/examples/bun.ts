import { Bot, Context, session, SessionFlavor } from "grammy";
import { PsqlAdapter } from '@grammyjs/storage-psql';
import { SQL } from "bun"

interface SessionData {
  counter: number;
}

type MyContext = Context & SessionFlavor<SessionData>;

async function bootstrap() {
  // @see https://bun.com/docs/runtime/sql#database-environment-variables
  const sql = new SQL();

  await sql.connect();
  
  const client = {
      async query(query: string, params?: string[]) {
          return {
              rows: await sql.unsafe(query, params)
          }
      }
  };

  const bot = new Bot<MyContext>("");
  
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
    })
  );
  
  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  
  bot.on(":photo", (ctx) => ctx.session.counter++);
  
  bot.start();
}

bootstrap()
