import type { StorageAdapter } from 'grammy'
import type { Redis as Client } from 'ioredis'

export class RedisAdapter<T> implements StorageAdapter<T> {
	private redis: Client
	private readonly ttl?: number
	private readonly autoParseDates: boolean

	constructor({
		instance,
		ttl,
		autoParseDates,
	}: {
		instance?: Client
		ttl?: number
		autoParseDates?: boolean
	}) {
		if (instance) {
			this.redis = instance
		} else {
			throw new Error('You should pass redis instance to constructor.')
		}

		this.ttl = ttl
		this.autoParseDates = autoParseDates || false
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.redis.get(key)
		if (session === null || session === undefined) {
			return undefined
		}
		if (this.autoParseDates) {
			return JSON.parse(session, dateParser) as unknown as T
		}
		return JSON.parse(session) as unknown as T
	}

	async write(key: string, value: T): Promise<void> {
		const val = JSON.stringify(value)
		const { ttl } = this
		await this.redis.set(key, val, 'EX', ttl)
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key)
	}
}

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/
const dateParser = (_key: string, value: unknown): unknown => {
	if (typeof value === 'string' && ISO_8601.test(value)) {
		let newValue: string
		if (!value.endsWith('Z')) {
			newValue = `${value}Z`
		} else {
			newValue = value
		}
		return new Date(newValue)
	}
	return value
}
