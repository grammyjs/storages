import { Bot, Context, type SessionFlavor } from 'grammy'

interface JsonSessionData {
	pizzaCount: number
}

interface StringSessionFlavor {
	get session(): string
	set session(session: string | null | undefined)
}

type JsonBot = Context & SessionFlavor<JsonSessionData>
type StringBot = Context & StringSessionFlavor

export function createBot(json?: true): Bot<JsonBot>
export function createBot(json?: false): Bot<StringBot>
export function createBot(json = true): Bot<JsonBot> | Bot<StringBot> {
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
		has_topics_enabled: false,
		allows_users_to_create_topics: false,
		can_manage_bots: false,
		supports_join_request_queries: false,
	}

	if (json) {
		return new Bot<JsonBot>('fake-token', { botInfo })
	}
	return new Bot<StringBot>('fake-token', { botInfo })
}

export function createMessage(bot: Bot<any>, text = 'Test Text'): Context {
	const createRandomNumber = (): number => Math.floor(Math.random() * (123_456_789 - 1) + 1)

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
				from: {
					id: 1,
					is_bot: false,
					first_name: 'Test user',
				},
			},
		},
		bot.api,
		bot.botInfo
	)

	return ctx
}
