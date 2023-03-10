import { Bot, lazySession, webhookCallback, StorageAdapter, Context, SessionFlavor } from 'grammy/web';
import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';
import { KvAdapter } from '@grammyjs/storage-cloudflare';

interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
    BOT_TOKEN: string,
    KV_NAMESPACE: KVNamespace<string>
  }

interface SessionData {
  name: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const bot = new Bot<MyContext>(env.BOT_TOKEN);

    bot.use(lazySession({
      initial: (): SessionData => {
        return { name: 'World' };
      },
      storage: new KvAdapter<SessionData>(env.KV_NAMESPACE),
    }));

    bot.command('start', async (ctx: MyContext) => {
      const session = await ctx.session;
      await ctx.reply(`Hello ${session.name}`);
    });

    bot.command('name', async (ctx: MyContext) => {
      const session = await ctx.session;
      session.name = ctx.match as string;
      await ctx.reply(`Hello ${session.name}`);
    });

    return webhookCallback(bot, 'cloudflare-mod' as any)(request);
  },
};