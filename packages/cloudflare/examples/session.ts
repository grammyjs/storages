import { Bot, lazySession, webhookCallback, StorageAdapter, Context, SessionFlavor } from 'grammy/web';
import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';
import { KvAdapter } from '@grammyjs/storage-cloudflare';

interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
    BOT_TOKEN: string,
    MY_KV_NAMESPACE: KVNamespace<string>
  }

interface SessionData {
  name: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const bot = new Bot<MyContext>(env.BOT_TOKEN);

		bot.use(lazySession({
			initial: (): SessionData => {
				return { name: "World" }
			},
			storage: new KvAdapter<SessionData>(env.MY_KV_NAMESPACE)
		}))

		bot.command("start", async (ctx: MyContext) => {
			const session = await ctx.session;
			await ctx.reply(`Hello ${session.name}`);
		})

		bot.command("name", async (ctx: MyContext) => {
			const session = await ctx.session;
			session.name = ctx.match as string;
			await ctx.reply(`Hello ${session.name}`);
		});

		bot.command("haskey", async (ctx: MyContext) => {
			if (ctx.match) {
				await ctx.reply((await new KvAdapter<SessionData>(env.MY_KV_NAMESPACE).has(ctx.match.toString())).toString());
			} else {
				await ctx.reply("Key cannot be empty.");
			}
		});

		bot.command("allkeys", async (ctx: MyContext) => {
			for await (const key of new KvAdapter<SessionData>(env.MY_KV_NAMESPACE).readAllKeys()) {
				await ctx.reply(key);
			}
		});

		bot.command("allvalues", async (ctx: MyContext) => {
			try {
				for await (const value of new KvAdapter<SessionData>(env.MY_KV_NAMESPACE).readAllValues()) {
					await ctx.reply(JSON.stringify(value));
				}
			} catch (err) {
				if (!(err instanceof SyntaxError)) {
					throw err;
				}
			}
		});

		bot.command("allentries", async (ctx: MyContext) => {
			try {
				for await (const entry of new KvAdapter<SessionData>(env.MY_KV_NAMESPACE).readAllEntries()) {
					await ctx.reply(JSON.stringify(entry));
				}
			} catch (err) {
				if (!(err instanceof SyntaxError)) {
					throw err;
				}
			}
		});

		return webhookCallback(bot, "cloudflare-mod")(request);
	},

	async scheduled() {
		return new Response("OK");
	}
};