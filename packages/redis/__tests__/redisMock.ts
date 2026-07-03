export class RedisMock {
	private store = new Map<string, unknown>()

	get(key: string): Promise<unknown> {
		return Promise.resolve(this.store.get(key))
	}

	set(key: string, data: string | number | Uint8Array): void {
		Promise.resolve(this.store.set(key, data))
	}

	del(key: string): void {
		Promise.resolve(this.store.delete(key))
	}
}
