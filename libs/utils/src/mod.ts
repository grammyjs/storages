import * as Deps from './deps.deno.ts';

interface JsonSessionData {
  pizzaCount: number;
}

interface StringSessionFlavor {
  get session(): string;
  set session(session: string | null | undefined);
}

type JsonBot = Deps.Context & Deps.SessionFlavor<JsonSessionData>
type StringBot = Deps.Context & StringSessionFlavor

export function createBot(json?: true): Deps.Bot<JsonBot>
export function createBot(json?: false): Deps.Bot<StringBot>
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
    return new Deps.Bot<JsonBot>('fake-token', { botInfo });
  } else {
    return new Deps.Bot<StringBot>('fake-token', { botInfo });
  }
}

export function createMessage(bot: Deps.Bot<any>, text = 'Test Text') {
  const createRandomNumber = () => Math.floor(Math.random() * (123456789 - 1) + 1);

  const ctx = new Deps.Context({ 
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
      from: {
        id: 1,
        is_bot: false,
        first_name: 'Test user',
      },
    },
  },
  bot.api, 
  bot.botInfo
  );

  return ctx;
}