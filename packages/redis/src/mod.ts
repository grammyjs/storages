import type { StorageAdapter } from 'grammy';

interface Client {
	get: (key: string) => Promise<string | null>;
	set: (key: string, value: string) => Promise<void>;
	expire: (key: string, ttl: number) => Promise<void>;
	del: (key: string) => Promise<void>;
}

export class RedisAdapter<T> implements StorageAdapter<T> {
	private redis: Client;
	private readonly ttl?: number;
	private readonly autoParseDates: boolean;

	/**
	 * @constructor
	 * @param {opts} Constructor options
	 * @param {opts.ttl} ttl - Session time to life in SECONDS.
	 * @param {opts.instance} instance - Instance of redis.
	 * @param {opts.autoParseDates} autoParseDates - set to true to convert string in the json date format to date object
	 */
	constructor(
		{ instance, ttl, autoParseDates }: {
			instance?: Client;
			ttl?: number;
			autoParseDates?: boolean;
		},
	) {
		if (instance) {
			this.redis = instance;
		} else {
			throw new Error('You should pass redis instance to constructor.');
		}

		this.ttl = ttl;
		this.autoParseDates = autoParseDates || false;
	}

	async read(key: string) {
		const session = await this.redis.get(key);
		if (session === null || session === undefined) {
			return undefined;
		}
		if (this.autoParseDates) {
			return JSON.parse(session, dateParser) as unknown as T;
		}
		return JSON.parse(session) as unknown as T;
	}

	async write(key: string, value: T) {
		await this.redis.set(key, JSON.stringify(value));
		if (this.ttl) {
			this.redis.expire(key, this.ttl);
		}
	}

	async delete(key: string) {
		await this.redis.del(key);
	}
}

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
const dateParser = (_key: string, value: any) => {
	if (typeof value === 'string' && ISO_8601.test(value)) {
		let newValue;
		if (!value.endsWith('Z')) {
			newValue = `${value}Z`;
		} else newValue = value;
		return new Date(newValue);
	}
	return value;
};
