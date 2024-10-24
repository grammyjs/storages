export class RedisMock {
	private store: Map<string, string> = new Map();

	get(key: string): Promise<string | null> {
		return Promise.resolve(this.store.get(key) as string | null);
	}

	async set(key: string, data: string): Promise<void> {
		this.store.set(key, data);
	}

	async del(key: string): Promise<void> {
		this.store.delete(key);
	}

	async expire(key: string, ttl: number): Promise<void> {}
}
