import { mkdirSync } from 'node:fs'
import { readFile, writeFile, rm, stat, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { StorageAdapter } from 'grammy'

type Serializer<Session> = (input: Session) => string
type Deserializer<Session> = (input: string) => Session

interface ConstructorOptions<Session> {
	dirName?: string
	serializer?: Serializer<Session>
	deserializer?: Deserializer<Session>
}

async function ensureDir(dirPath: string): Promise<void> {
	try {
		await stat(dirPath)
	} catch (e: unknown) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
			await mkdir(dirPath, { recursive: true })
		} else {
			throw e
		}
	}
}

export class FileAdapter<T> implements StorageAdapter<T> {
	private folderPath: string
	serializer: Serializer<T>
	deserializer: Deserializer<T>

	constructor(opts: ConstructorOptions<T> = {}) {
		this.folderPath = resolve(process.cwd(), opts?.dirName ?? 'sessions')

		this.serializer = opts.serializer ?? ((input: T): string => JSON.stringify(input, null, '\t'))
		this.deserializer = opts.deserializer ?? ((input: string): T => JSON.parse(input))

		mkdirSync(this.folderPath, { recursive: true })
	}

	private resolveSessionPath(key: string): string {
		const subFolder = key.slice(-2)
		return resolve(this.folderPath, subFolder, `${key}.json`)
	}

	private async findSessionFile(key: string): Promise<string | null> {
		try {
			return await readFile(this.resolveSessionPath(key), { encoding: 'utf8' })
		} catch {
			return null
		}
	}

	async read(key: string): Promise<T | undefined> {
		const file = await this.findSessionFile(key)

		if (!file) {
			return undefined
		}

		return this.deserializer(file)
	}

	async write(key: string, value: T): Promise<void> {
		const fullPath = this.resolveSessionPath(key)
		const fileName = `${key}.json`
		const folderPath = fullPath.substring(0, fullPath.length - fileName.length)

		await ensureDir(folderPath)
		await writeFile(fullPath, this.serializer(value), { encoding: 'utf8' })
	}

	async delete(key: string): Promise<void> {
		try {
			await rm(this.resolveSessionPath(key), { recursive: true })
		} catch {}
	}
}
