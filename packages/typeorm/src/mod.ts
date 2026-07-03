import { StorageAdapter } from 'grammy'
import { Repository } from 'typeorm'

import { ISession } from './types/session'

export * from './types/session'

export class TypeormAdapter<T> implements StorageAdapter<T> {
	private repository: Repository<ISession>

	constructor(opts: { repository: Repository<ISession> }) {
		this.repository = opts.repository
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.repository.findOne({ where: { key } })

		if (session === null || session === undefined) {
			return undefined
		}
		return JSON.parse(session.value) as unknown as T
	}

	async write(key: string, data: T): Promise<void> {
		const session = await this.repository.findOne({
			where: { key },
			select: ['key'],
		})
		const value = JSON.stringify(data)

		if (session !== null && session !== undefined) {
			await this.repository.update({ key }, { value })
		} else {
			await this.repository.save({ key, value })
		}
	}

	async delete(key: string): Promise<void> {
		await this.repository.delete({ key })
	}
}
