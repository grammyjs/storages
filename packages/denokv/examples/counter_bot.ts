import { DenoKVAdapter } from 'jsr:@grammyjs/storage-denokv'
import { Bot, type Context, session, type SessionFlavor } from 'npm:grammy'

// Define session structure
interface SessionData {
	count: number
}
type MyContext = Context & SessionFlavor<SessionData>

// Create project db instance (or leave it blank to use default)
const kv = await Deno.openKv('./kv.db')

// Create the bot and register the session middleware
const bot = new Bot<MyContext>('<Token>')
bot.use(
	session({
		initial: () => ({ count: 0 }),
		storage: new DenoKVAdapter(kv),
	})
)

// Use persistant session data in update handlers
bot.on('message', async (ctx) => {
	ctx.session.count++
	await ctx.reply(`c: ${ctx.session.count}`, { parse_mode: 'HTML' })
})

bot.catch((err) => console.error(err))
bot.start()
