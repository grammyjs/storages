import { Database } from '../src/deps.ts';
import { Bot, Context, SessionFlavor, SQLite3Connector } from './test_deps.ts';

export function sqLiteConnection() {
  const connector = new SQLite3Connector({ filepath: ':memory:' });
  const db = new Database(connector);

  return db;
}

interface JsonSessionData {
  pizzaCount: number;
}

interface StringSessionFlavor {
  get session(): string;
  set session(session: string | null | undefined);
}

type JsonBot = Context & SessionFlavor<JsonSessionData>;
type StringBot = Context & StringSessionFlavor;

export function createBot(json?: true): Bot<JsonBot>;
export function createBot(json?: false): Bot<StringBot>;
export function createBot(json = true) {
  const botInfo = {
    id: 42,
    first_name: 'Test Bot',
    is_bot: true as const,
    username: 'bot',
    can_join_groups: true,
    can_read_all_group_messages: true,
    supports_inline_queries: false,
  };

  if (json) {
    return new Bot<JsonBot>('fake-token', { botInfo });
  } else {
    return new Bot<StringBot>('fake-token', { botInfo });
  }
}

// deno-lint-ignore no-explicit-any
export function createMessage(bot: Bot<any>, text = 'Test Text') {
  const createRandomNumber = () =>
    Math.floor(Math.random() * (123456789 - 1) + 1);

  const ctx = new Context(
    {
      update_id: createRandomNumber(),
      message: {
        text,
        message_id: createRandomNumber(),
        chat: {
          id: 1,
          type: 'private',
          first_name: 'Test User',
        },
        date: Date.now(),
      },
    },
    bot.api,
    bot.botInfo,
  );

  return ctx;
}
