import { StorageAdapter } from 'grammy';
import { cwd } from 'node:process';
import { mkdirSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Serializer<Session> = (input: Session) => string;
type Deserializer<Session> = (input: string) => Session;

interface ConstructorOptions<Session> {
	dirName?: string;
	serializer?: Serializer<Session>;
	deserializer?: Deserializer<Session>;
}

export class FileAdapter<T> implements StorageAdapter<T> {
	private folderPath: string;
	serializer: Serializer<T>;
	deserializer: Deserializer<T>;

	/**
	 * @constructor
	 * @param {opts} options options
	 * @param {opts.dirName} options.dirName - name of directory where files should be stored. Defaults to `sessions`.
	 * @param {opts.serializer} options.serializer
	 * serializer of file. Default `JSON.stringify(input, null, '\t')`.
	 *
	 * @param {opts.deserializer} options.deserializer
	 * deserializer of file. Default `JSON.parse(input)`.
	 */
	constructor(opts: ConstructorOptions<T> = {}) {
		this.folderPath = path.resolve(cwd(), opts?.dirName ?? 'sessions');

		this.serializer = opts.serializer ??
			((input) => JSON.stringify(input, null, '\t'));
		this.deserializer = opts.deserializer ??
			((input) => JSON.parse(input));

		mkdirSync(this.folderPath, { recursive: true });
	}

	private resolveSessionPath(key: string) {
		const subFolder = key.substr(-2);
		return path.resolve(this.folderPath, subFolder, `${key}.json`);
	}

	private async findSessionFile(key: string) {
		try {
			return await readFile(this.resolveSessionPath(key), { encoding: 'utf8' });
		} catch {
			return null;
		}
	}

	async read(key: string) {
		const file = await this.findSessionFile(key);

		if (!file) {
			return undefined;
		}

		return this.deserializer(file);
	}

	async write(key: string, value: T) {
		const fullPath = this.resolveSessionPath(key);
		const fileName = `${key}.json`;
		const folderPath = fullPath.substring(0, fullPath.length - fileName.length);

		await mkdir(folderPath, { recursive: true });
		await writeFile(fullPath, this.serializer(value));
	}

	async delete(key: string) {
		try {
			await unlink(this.resolveSessionPath(key));
			// deno-lint-ignore no-empty
		} catch { /* empty */ }
	}
}
