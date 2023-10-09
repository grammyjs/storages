import { D1Database } from '@cloudflare/workers-types'
import {
	type Context,
	type SessionFlavor,
	Bot,
	session,
	webhookCallback
} from 'grammy/web'

import { D1Adapter } from '../../../src/index.js'

export interface Env {
	BOT_TOKEN: string
	DB: D1Database;
}

interface SessionData {
	timestamp: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const grammyD1StorageAdapter = await D1Adapter.create<SessionData>(env.DB, 'GrammySessions')

		const bot = new Bot<MyContext>('1065054386:AAFh6G_GtAzIqGgZZUGLtJQoYMpEY_iXQ2k');

		bot.use(session({
			initial: (): SessionData => {
				return { timestamp: "World" }
			},
			storage: grammyD1StorageAdapter,
		}))

		bot.use(async (ctx, next) => {
			ctx.session.timestamp = Date.now().toString();

			await next();
		})

		bot.command("start", async (ctx: MyContext) => {
			await ctx.reply(`Hello at ${ctx.session.timestamp}`);
		})

		return webhookCallback(bot, "cloudflare-mod")(request);
	},
};
