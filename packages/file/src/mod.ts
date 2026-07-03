import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile, rm, stat, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { StorageAdapter } from 'grammy'

interface SystemError {
	code?: string
}

type Serializer<Session> = (input: Session) => string
type Deserializer<Session> = (input: string) => Session

interface ConstructorOptions<Session> {
	dirName?: string
	serializer?: Serializer<Session>
	deserializer?: Deserializer<Session>
}

const fs = {
	readFile: (path: string): Promise<string> => readFile(path, { encoding: 'utf8' }),
	writeFile: (path: string, data: string): Promise<void> =>
		writeFile(path, data, { encoding: 'utf8' }),
	existsSync,
	ensureDir: async (path: string): Promise<void> => {
		try {
			await stat(path)
		} catch (e) {
			if ((e as SystemError).code === 'ENOENT') {
				await mkdir(path, { recursive: true })
			} else {
				throw e
			}
		}
	},
	ensureDirSync: (path: string): void => {
		mkdirSync(path, { recursive: true })
	},
	remove: (path: string): Promise<void> => rm(path, { recursive: true }),
}

const path = {
	resolve,
}

const { cwd } = process

export class FileAdapter<T> implements StorageAdapter<T> {
	private folderPath: string
	serializer: Serializer<T>
	deserializer: Deserializer<T>

	constructor(opts: ConstructorOptions<T> = {}) {
		this.folderPath = path.resolve(cwd(), opts?.dirName ?? 'sessions')

		this.serializer = opts.serializer ?? ((input: T): string => JSON.stringify(input, null, '\t'))
		this.deserializer = opts.deserializer ?? ((input: string): T => JSON.parse(input))

		fs.ensureDirSync(this.folderPath)
	}

	private resolveSessionPath(key: string): string {
		const subFolder = key.slice(-2)
		return path.resolve(this.folderPath, subFolder, `${key}.json`)
	}

	private async findSessionFile(key: string): Promise<string | null> {
		try {
			return await fs.readFile(this.resolveSessionPath(key))
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

		await fs.ensureDir(folderPath)
		await fs.writeFile(fullPath, this.serializer(value))
	}

	async delete(key: string): Promise<void> {
		try {
			await fs.remove(this.resolveSessionPath(key))
		} catch {}
	}
}
