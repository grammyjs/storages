import { SessionDelegate } from './types/SessionDelegate'
import type { StorageAdapter } from 'grammy'

export * from './types/SessionDelegate'

export class PrismaAdapter<T> implements StorageAdapter<T> {
	private sessionDelegate: SessionDelegate

	constructor(repository: SessionDelegate) {
		this.sessionDelegate = repository
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.sessionDelegate.findUnique({ where: { key } })
		return session?.value ? (JSON.parse(session.value) as T) : undefined
	}

	async write(key: string, data: T): Promise<void> {
		const value = JSON.stringify(data)
		await this.sessionDelegate.upsert({
			where: { key },
			create: { key, value },
			update: { value },
		})
	}

	async delete(key: string): Promise<void> {
		await this.sessionDelegate.delete({ where: { key } }).catch((err) => {
			// Record does not exist in database
			if (err?.code === 'P2025') return
			return Promise.reject(err)
		})
	}
}
