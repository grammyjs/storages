import { PsqlAdapter } from 'npm:@grammyjs/storage-psql'
import { Bot, type Context, session, type SessionFlavor } from 'npm:grammy'
import { Client } from 'npm:pg'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

async function bootstrap(): Promise<void> {
	const client = new Client({
		user: 'user',
		database: 'test',
		host: 'localhost',
		port: 5432,
	})

	await client.connect()

	const bot = new Bot<MyContext>('')
	bot.use(
		session({
			initial: () => ({ counter: 0 }),
			storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
		})
	)

	bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`))
	bot.on(':photo', (ctx) => ctx.session.counter++)

	bot.start()
}

bootstrap()
