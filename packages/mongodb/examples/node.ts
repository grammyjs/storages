import { MongoDBAdapter, ISession } from '@grammyjs/storage-mongodb'
import { Bot, Context, session, SessionFlavor } from 'grammy'
import { MongoClient } from 'mongodb'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

async function bootstrap(): Promise<void> {
	const client = new MongoClient()
	await client.connect('mongodb://localhost:27017')
	const db = client.database('test')
	const sessions = db.collection<ISession>('users')

	const bot = new Bot<MyContext>('')
	bot.use(
		session({
			initial: () => ({ counter: 0 }),
			storage: new MongoDBAdapter({ collection: sessions }),
		})
	)

	bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`))
	bot.on(':photo', (ctx) => ctx.session.counter++)

	bot.start()
}

bootstrap()
