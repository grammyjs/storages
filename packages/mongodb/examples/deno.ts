import { Bot, Context, session, SessionFlavor } from "https://deno.land/x/grammy@v1.9.2/mod.ts";
import { MongoDBAdapter, ISession } from "https://deno.land/x/grammy_storages/mongodb/src/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.30.1/mod.ts";

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

async function bootstrap() {
  const client = new MongoClient();
  await client.connect("mongodb://localhost:27017");
  const db = client.database("test");
  const sessions = db.collection<ISession>("users");

  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new MongoDBAdapter({ collection: sessions }),
    })
  );
  
  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);
  
  bot.start();
}

bootstrap()

