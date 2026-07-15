class Storage {
	public jwt: string | undefined
	constructor(
		private readonly token: string,
		private readonly rootUrl = 'https://grammy-free-session.deno.dev/api'
	) {}

	async login(): Promise<string> {
		if (this.jwt === undefined) {
			const url = `${this.rootUrl}/login`
			const body = JSON.stringify({ token: this.token })
			const response = await retryFetch(url, { method: 'POST', body })
			const { token } = (await response.json()) as { token: string }
			if (typeof token !== 'string') {
				throw new TypeError('Cannot use free session, invalid bot token!')
			}
			this.jwt = token
		}
		return this.jwt
	}

	logout(): void {
		this.jwt = undefined
	}

	async call(
		method: 'GET' | 'POST' | 'DELETE',
		key?: string, // Make key optional to allow global calls
		body?: string
	): Promise<string | undefined> {
		// Perform request
		const url = key !== undefined ? `${this.rootUrl}/session/${key}` : `${this.rootUrl}/sessions` // Define url based on key
		const jwt = await this.login()
		const headers = { Authorization: `Bearer ${jwt}` }
		const response = await retryFetch(url, { method, body, headers })
		// Handle response
		if (response.status === 401) {
			// Token was revoked, must login again
			this.logout()
			return await this.call(method, key, body)
		} else if (response.status === 404) {
			// Empty session
			return undefined
		} else if (response.status >= 200 && response.status < 300) {
			// Success
			return method === 'GET' ? await response.text() : undefined
		}
		// error
		throw new Error(`${response.status}: ${((await response.json()) as any).error}`)
	}
}

/**
 * Options for creating a storage adapter.
 */
export interface StorageOptions {
	/**
	 * The root URL of the storage backend. Useful if you want to host your own
	 * storage backend behind a different URL.
	 */
	rootUrl?: string
	/**
	 * A storage authentication token that will be used when authenticating at the
	 * backend. Note that the library will automatically renew the token if
	 * authentication fails. Hence, you will still need to provide the bot token.
	 */
	jwt?: string
}

/**
 * @param token The bot token of your bot.
 * @param opts Further configuration options
 * @returns An adapter to grammY's free session storage
 */
export function freeStorage<T>(
	token: string,
	opts?: StorageOptions
): {
	readAllKeys(): Promise<string[]>
	read(key: string): Promise<T | undefined>
	write(key: string, data: T): Promise<void>
	delete(key: string): Promise<void>
	getToken(): Promise<string>
} {
	const storage = new Storage(token, opts?.rootUrl)
	if (opts?.jwt !== undefined) storage.jwt = opts.jwt
	return {
		async readAllKeys(): Promise<string[]> {
			const keys = await storage.call('GET')
			return keys === undefined ? [] : JSON.parse(keys)
		},
		async read(key: string): Promise<T | undefined> {
			const session = await storage.call('GET', key)
			return session === undefined ? undefined : JSON.parse(session)
		},
		async write(key: string, data: T): Promise<void> {
			await storage.call('POST', key, JSON.stringify(data))
		},
		async delete(key: string): Promise<void> {
			await storage.call('DELETE', key)
		},
		/**
		 * Returns the storage authentication token which is used to store the
		 * session data. Only useful if you want to avoid the login call that will
		 * be performed automatically when the storage adapter contacts its backend
		 * for the first time. This can improve startup performance and is
		 * especially useful in serverless environments.
		 */
		async getToken(): Promise<string> {
			return await storage.login()
		},
	}
}

async function retryFetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
	let res: Awaited<ReturnType<typeof fetch>>
	let delay = 10 // Ms
	do {
		res = await fetch(...args)
		if (res.status >= 500) {
			console.error(`${res.status} in free session service, retrying!`)
			await sleep(delay)
			delay += delay // Exponential back-off
			delay = Math.min(delay, 1000 * 60 * 60) // Cap at 1 hour
		}
	} while (res.status >= 500)
	return res
}

async function sleep(ms: number): Promise<void> {
	await new Promise((r) => setTimeout(r, ms))
}
