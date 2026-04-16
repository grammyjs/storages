import { Bot, session } from 'grammy';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBAdapter } from '@grammyjs/storage-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  // Optional: provide credentials if not using AWS environment
  // credentials: {
  //   accessKeyId: 'your-access-key-id',
  //   secretAccessKey: 'your-secret-access-key'
  // }
});

const docClient = DynamoDBDocumentClient.from(client);

const adapter = new DynamoDBAdapter({
  instance: docClient,
  tableName: 'GrammySessions',
  ttl: 24 * 60 * 60, // 24 hours in seconds
});

interface SessionData {
  counter: number;
  lastMessage?: string;
}

const bot = new Bot<SessionData>('your-bot-token');

bot.use(session({
  initial: () => ({ counter: 0 }),
  storage: adapter,
}));

bot.command('start', (ctx) => {
  ctx.session.counter++;
  ctx.reply(`Welcome! This is your visit #${ctx.session.counter}`);
});

bot.on('message:text', (ctx) => {
  ctx.session.counter++;
  ctx.session.lastMessage = ctx.message.text;
  ctx.reply(`Message #${ctx.session.counter}: "${ctx.message.text}"`);
});

bot.start();