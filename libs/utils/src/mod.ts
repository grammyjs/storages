import { Bot, Context, type SessionFlavor } from 'grammy';

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
		can_connect_to_business: false,
		has_main_web_app: false,
	};

	if (json) {
		return new Bot<JsonBot>('fake-token', { botInfo });
	} else {
		return new Bot<StringBot>('fake-token', { botInfo });
	}
}

export function createMessage(bot: Bot<any>, text = 'Test Text') {
	const createRandomNumber = () => Math.floor(Math.random() * (123456789 - 1) + 1);

	return new Context(
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
				from: {
					id: 1,
					is_bot: false,
					first_name: 'Test user',
				},
			},
		},
		bot.api,
		bot.botInfo,
	);
}
