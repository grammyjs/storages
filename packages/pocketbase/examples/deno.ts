import {
	Bot,
	type Context,
	session,
	type SessionFlavor,
} from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { PocketbaseAdapter } from 'jsr:@grammyjs/storage-pocketbase';
import 'jsr:@std/dotenv/load';

interface SessionData {
	messagesCount: number;
}

type MyContext = Context & SessionFlavor<SessionData>;
const botToken = Deno.env.get('botToken') || Deno.exit(1);
const bot = new Bot<MyContext>(botToken);

bot.use(
	session({
		initial: () => ({ messagesCount: 0 }),
		storage: new PocketbaseAdapter({
			pocketbaseInstanceUrl: '', // for example: http://127.0.0.1:8090
			botToken: botToken,
		}),
	}),
);

bot.on('message', async (ctx) => {
	ctx.session.messagesCount++;

	const message = `Your messages count: ${ctx.session.messagesCount}`;

	await ctx.reply(message);
});

bot.start({
	onStart: () => {
		console.log('POLLING');
	},
});
