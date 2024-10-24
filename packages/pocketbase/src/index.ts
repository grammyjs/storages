import type { StorageAdapter } from 'grammy';
import type { BaseModel, ListResult } from 'pocketbase';

type AdapterConstructor = {
	/**
	 * For example: http://127.0.0.1:8090
	 */
	pocketbaseInstanceUrl: string;
	botToken: string;
};

type SessionItem<T> = {
	key: string;
	value: T;
} & BaseModel;

export class PocketbaseAdapter<T> implements StorageAdapter<T> {
	private pocketbaseInstanceUrl: string;
	private botToken: string;

	constructor(opts: AdapterConstructor) {
		this.pocketbaseInstanceUrl = opts.pocketbaseInstanceUrl;
		this.botToken = opts.botToken;
	}

	private async get(key: string) {
		const f = await fetch(
			`${this.pocketbaseInstanceUrl}/api/collections/sessions/records?filter=key='${key}'`,
			{
				headers: new Headers({
					'bot_token': this.botToken,
					'Content-Type': 'application/json',
				}),
			},
		);

		if (!f.ok) return undefined;

		const data = await f.json() as ListResult<SessionItem<unknown>>;

		if (!data.items.length) return undefined;

		return data.items[0];
	}

	async read(key: string): Promise<T | undefined> {
		const res = await this.get(key);

		if (!res) return undefined;

		return res.value as T;
	}

	async write(key: string, value: T): Promise<void> {
		const alreadyExists = await this.get(key);

		if (alreadyExists) {
			const updateFetch = await fetch(
				`${this.pocketbaseInstanceUrl}/api/collections/sessions/records/${alreadyExists.id}`,
				{
					method: 'PATCH',
					body: JSON.stringify({
						value,
					}),
					headers: new Headers({
						'bot_token': this.botToken,
						'Content-Type': 'application/json',
					}),
				},
			);

			if (!updateFetch.ok) return undefined;
		} else {
			const createFetch = await fetch(
				`${this.pocketbaseInstanceUrl}/api/collections/sessions/records`,
				{
					method: 'POST',
					body: JSON.stringify({
						key,
						value,
					}),
					headers: new Headers({
						'bot_token': this.botToken,
						'Content-Type': 'application/json',
					}),
				},
			);

			if (!createFetch.ok) return undefined;
		}
	}

	async delete(key: string): Promise<void> {
		const existingSession = await this.get(key);

		if (!existingSession) return undefined;

		const f = await fetch(
			`${this.pocketbaseInstanceUrl}/api/collections/sessions/records/${existingSession.id}`,
			{
				method: 'DELETE',
				headers: new Headers({
					'bot_token': this.botToken,
					'Content-Type': 'application/json',
				}),
			},
		);

		if (!f.ok) return undefined;
	}
}
