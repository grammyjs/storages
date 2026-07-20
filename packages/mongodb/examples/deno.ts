import { MongoDBAdapter, type ISession } from 'jsr:@grammyjs/storage-mongodb'
import { Bot, type Context, session, type SessionFlavor } from 'npm:grammy'
import { MongoClient } from 'npm:mongodb'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

async function bootstrap(): Promise<void> {
	const client = new MongoClient('mongodb://localhost:27017')
	await client.connect()
	const db = client.db('test')
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
