import { S3Client } from '@aws-sdk/client-s3'
import { S3Adapter } from '@grammyjs/storage-s3'
import { Bot, session } from 'grammy'

const client = new S3Client({
	region: 'us-east-1',
	// Optional: set `endpoint` (and `forcePathStyle` for MinIO) to use any S3-compatible storage
	// Optional: pass `credentials` here if not using the default AWS credential chain
})

const adapter = new S3Adapter(client, {
	bucket: 'grammy-sessions',
	prefix: 'sessions/',
})

interface SessionData {
	counter: number
	lastMessage?: string
}

const bot = new Bot<SessionData>('your-bot-token')

bot.use(
	session({
		initial: () => ({ counter: 0 }),
		storage: adapter,
	})
)

bot.command('start', (ctx) => {
	ctx.session.counter++
	ctx.reply(`Welcome! This is your visit #${ctx.session.counter}`)
})

bot.on('message:text', (ctx) => {
	ctx.session.counter++
	ctx.session.lastMessage = ctx.message.text
	ctx.reply(`Message #${ctx.session.counter}: "${ctx.message.text}"`)
})

bot.start()
