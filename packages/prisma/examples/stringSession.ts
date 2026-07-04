import { PrismaAdapter } from '@grammyjs/storage-prisma'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Bot, Context, session, SessionFlavor } from 'grammy'

import { PrismaClient } from '../generated/prisma/client'

type SessionData = string
type MyContext = Context & SessionFlavor<SessionData>

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function bootstrap(): Promise<void> {
	const bot = new Bot<MyContext>('')
	bot.use(
		session({
			initial: () => 'initial state',
			storage: new PrismaAdapter(prisma.session),
		})
	)

	bot.command('sessionData', (ctx) => ctx.reply(`Current session data is  ${ctx.session}!`))

	bot.start()
}

bootstrap()
