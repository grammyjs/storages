import { FileAdapter } from 'jsr:@grammyjs/storage-file'
import { Bot, type Context, session, type SessionFlavor } from 'npm:grammy'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

async function bootstrap(): Promise<void> {
	const bot = new Bot<MyContext>('')
	bot.use(
		session({
			initial: () => ({ counter: 0 }),
			storage: new FileAdapter({
				dirName: 'sessions',
			}),
		})
	)

	bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`))
	bot.on(':photo', (ctx) => ctx.session.counter++)

	bot.start()
}

bootstrap()
