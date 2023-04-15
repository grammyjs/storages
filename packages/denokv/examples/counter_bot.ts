import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://lib.deno.dev/x/grammy@1.x/mod.ts";
import { DenoKVAdapter } from "https://deno.land/x/grammy_storages/denokv/src/mod.ts";

// Define session structure
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create project db instance (or leave it blank to use default)
const kv = await Deno.openKv("./kv.db");

// Create the bot and register the session middleware
const bot = new Bot<MyContext>("<Token>");
bot.use(session({
  initial: () => ({ count: 0 }),
  storage: new DenoKVAdapter(kv),
}));

// Use persistant session data in update handlers
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`c: ${ctx.session.count}`, { parse_mode: "HTML" });
});

bot.catch((err) => console.error(err));
bot.start();
