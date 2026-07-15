import { RedisAdapter } from 'npm:@grammyjs/storage-redis'
import { Bot, type Context, session, type SessionFlavor } from 'npm:grammy'
import { Redis } from 'npm:ioredis'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

const redisInstance = new Redis('redis://127.0.0.1:6379/0')

//Create storage
const storage = new RedisAdapter({ instance: redisInstance, ttl: 10, autoParseDates: true })

// Create bot and register session middleware
const bot = new Bot<MyContext>('')
bot.use(
	session({
		initial: () => ({ counter: 0 }),
		storage,
	})
)

// Register your usual middleware, and start the bot
bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`))
bot.on(':photo', (ctx) => ctx.session.counter++)

bot.start()
