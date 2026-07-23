import type { StorageAdapter } from 'grammy'

export interface BunS3AdapterOptions {
	/**
	 * Path inside the bucket where session files are stored, for example
	 * `'sessions'`. Files are named `${key}.json` by analogy with the file
	 * adapter. Defaults to the bucket root.
	 */
	dirName?: string
}

export class BunS3Adapter<T> implements StorageAdapter<T> {
	private readonly client: Bun.S3Client
	private readonly dirName: string

	constructor(client: Bun.S3Client, options: BunS3AdapterOptions = {}) {
		this.client = client
		this.dirName = options.dirName ?? ''
	}

	private resolveSessionPath(key: string): string {
		return this.dirName === '' ? `${key}.json` : `${this.dirName}/${key}.json`
	}

	async read(key: string): Promise<T | undefined> {
		const file = this.client.file(this.resolveSessionPath(key))
		if (!(await file.exists())) {
			return undefined
		}

		return (await file.json()) as T
	}

	async write(key: string, value: T): Promise<void> {
		await this.client.write(this.resolveSessionPath(key), JSON.stringify(value))
	}

	async delete(key: string): Promise<void> {
		await this.client.delete(this.resolveSessionPath(key))
	}
}
