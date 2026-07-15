import { PsqlAdapter } from '@grammyjs/storage-psql'
import { SQL } from 'bun'
import { Bot, Context, session, SessionFlavor } from 'grammy'

interface SessionData {
	counter: number
}

type MyContext = Context & SessionFlavor<SessionData>

async function bootstrap(): Promise<void> {
	// @see https://bun.com/docs/runtime/sql
	const sql = new SQL({
		adapter: 'postgres',
		hostname: '127.0.0.1',
		port: 5432,
		database: 'test',
		username: 'postgres',
		password: '123456',
	})

	await sql.connect()

	const client = {
		async query(query: string, params?: string[]): Promise<{ rows: unknown }> {
			return {
				rows: await sql.unsafe(query, params),
			}
		},
	}

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
