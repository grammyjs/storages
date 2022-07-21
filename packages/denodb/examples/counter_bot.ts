import {
    Bot,
    Context,
    session,
    SessionFlavor,
} from "https://deno.land/x/grammy@v1.9.2/mod.ts";
import {
    Database,
    PostgresConnector,
    SQLite3Connector,
} from "https://deno.land/x/denodb@v1.0.40/mod.ts";
import { DenoDBAdapter } from "https://deno.land/x/grammy_storages/denodb/src/mod.ts";

// Define session structure
interface SessionData {
    count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create db connection
// For sqlite
const connection = new SQLite3Connector({
    filepath: "./example.db",
});
/*
// For postgres
const connection = new PostgresConnector({
  host: "127.0.0.1",
  username: "postgres",
  password: "changeme",
  database: "dbname",
});
// For more databases see: https://eveningkid.com/denodb-docs/docs/guides/using-mariadb
*/
const db = new Database(connection);

// Create the bot and register the session middleware
const bot = new Bot<MyContext>("<Token>");
bot.use(session({
    initial: () => ({ count: 0 }),
    storage: new DenoDBAdapter(db),
}));

// (optional) sync the database if you're not using migrations
await db.sync();

// Use persistant session data in update handlers
bot.on("message", async (ctx) => {
    ctx.session.count++;
    await ctx.reply(`c: ${ctx.session.count}`, { parse_mode: "HTML" });
});

bot.catch((err) => console.error(err));
bot.start();
