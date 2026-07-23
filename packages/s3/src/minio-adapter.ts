import { Buffer } from 'node:buffer'

import { Client as MinioClient } from 'minio'

import { isNotFoundError } from './errors.ts'
import type { StorageAdapter } from 'grammy/web'
import type { Readable } from 'node:stream'

export interface MinioAdapterConfig {
	instance: MinioClient
	bucket: string
	prefix?: string
}

async function streamToString(stream: Readable): Promise<string> {
	const chunks: Uint8Array[] = []

	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk))
	}

	return Buffer.concat(chunks).toString('utf8')
}

export class MinioAdapter<T> implements StorageAdapter<T> {
	private readonly client: MinioClient
	private readonly bucket: string
	private readonly prefix: string

	constructor({ instance, bucket, prefix = '' }: MinioAdapterConfig) {
		if (!instance) {
			throw new Error('You should pass Minio Client instance to constructor.')
		}

		if (!bucket) {
			throw new Error('You should pass bucket to constructor.')
		}

		this.client = instance
		this.bucket = bucket
		this.prefix = prefix
	}

	private buildKey(key: string): string {
		return `${this.prefix}${key}`
	}

	async read(key: string): Promise<T | undefined> {
		try {
			const stream = await this.client.getObject(this.bucket, this.buildKey(key))
			const body = await streamToString(stream)

			return JSON.parse(body) as T
		} catch (error) {
			if (isNotFoundError(error)) {
				return undefined
			}

			console.error('Error reading from S3:', error)
			return undefined
		}
	}

	async write(key: string, value: T): Promise<void> {
		try {
			await this.client.putObject(
				this.bucket,
				this.buildKey(key),
				JSON.stringify(value),
				undefined,
				{ 'Content-Type': 'application/json' }
			)
		} catch (error) {
			console.error('Error writing to S3:', error)
			throw error
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.client.removeObject(this.bucket, this.buildKey(key))
		} catch (error) {
			console.error('Error deleting from S3:', error)
			throw error
		}
	}

	async has(key: string): Promise<boolean> {
		try {
			await this.client.statObject(this.bucket, this.buildKey(key))
			return true
		} catch (error) {
			if (isNotFoundError(error)) {
				return false
			}

			console.error('Error checking key existence in S3:', error)
			return false
		}
	}
}
