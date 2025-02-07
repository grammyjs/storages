const BOT_TOKEN = "";
const TURSO_URL = "";
const TURSO_TOKEN = "";

import { Bot } from "grammy";
import { LibSQLAdapter } from "@grammyjs/storage-libsql";
import { createClient } from "@libsql/client";

const bot = new Bot(BOT_TOKEN);
const tursoClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

const libsqlAdapter = await LibSQLAdapter.create<Record<string, any>>({ table: "a-b.c$d", client: tursoClient });

bot.command('up', async ctx => {
  const item = ctx.match;
  const key = "x-y.z$w";
  const value = await libsqlAdapter.read(key) ?? {};
  const itemValue = (value[item] ?? 0) + 1;
  value[item] = itemValue;
  await libsqlAdapter.write(key, value);
  await ctx.reply(`Incremented ${item} to ${itemValue}`);
});
bot.command('down', async ctx => {
  const item = ctx.match;
  const key = "x-y.z$w";
  const value = await libsqlAdapter.read(key) ?? {};
  const itemValue = (value[item] ?? 0) - 1;
  value[item] = itemValue;
  await libsqlAdapter.write(key, value);
  await ctx.reply(`Decremented ${item} to ${itemValue}`);
});

bot.start();
