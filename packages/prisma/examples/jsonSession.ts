import { PrismaAdapter } from '@grammyjs/storage-prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Bot, Context, session, SessionFlavor } from 'grammy'

import { PrismaClient } from '../generated/prisma/client'

interface SessionData {
	counter: number
}
type MyContext = Context & SessionFlavor<SessionData>

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function bootstrap(): Promise<void> {
	const bot = new Bot<MyContext>('')
	bot.use(
		session({
			initial: () => ({ counter: 0 }),
			storage: new PrismaAdapter<SessionData>(prisma.session),
		})
	)

	bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`))
	bot.on(':photo', (ctx) => ctx.session.counter++)

	bot.start()
}

bootstrap()
