import { S3Client } from '@aws-sdk/client-s3'
import { Client as MinioClient } from 'minio'

import { createAwsDriver, createBunDriver, createMinioDriver, type S3Driver } from './drivers.ts'
import { isNotFoundError } from './errors.ts'
import type { StorageAdapter } from 'grammy/web'

export class S3Adapter<T> implements StorageAdapter<T> {
	private readonly driver: S3Driver
	private readonly bucket: string
	private readonly prefix: string

	constructor(client: MinioClient | S3Client, options: { bucket: string; prefix?: string })
	constructor(client: Bun.S3Client, options?: { prefix?: string })
	constructor(
		client: S3Client | MinioClient | Bun.S3Client,
		{ bucket = '', prefix = '' }: { bucket?: string; prefix?: string } = {}
	) {
		if (client instanceof MinioClient) {
			if (!bucket) {
				throw new Error('You must specify a bucket.')
			}

			this.driver = createMinioDriver(client)
		} else if (client instanceof S3Client) {
			if (!bucket) {
				throw new Error('You must specify a bucket.')
			}

			this.driver = createAwsDriver(client)
		} else if (typeof Bun !== 'undefined' && client instanceof Bun.S3Client) {
			this.driver = createBunDriver(client)
		} else {
			throw new TypeError(
				'Unsupported client: pass an S3Client from @aws-sdk/client-s3, a Client from minio, or a Bun.S3Client.'
			)
		}

		this.bucket = bucket
		this.prefix = prefix
	}

	private buildKey(key: string): string {
		return `${this.prefix}${key}`
	}

	async read(key: string): Promise<T | undefined> {
		try {
			const body = await this.driver.get(this.bucket, this.buildKey(key))

			return body === undefined ? undefined : (JSON.parse(body) as T)
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
			await this.driver.put(this.bucket, this.buildKey(key), JSON.stringify(value))
		} catch (error) {
			console.error('Error writing to S3:', error)
			throw error
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.driver.remove(this.bucket, this.buildKey(key))
		} catch (error) {
			console.error('Error deleting from S3:', error)
			throw error
		}
	}

	async has(key: string): Promise<boolean> {
		try {
			return await this.driver.exists(this.bucket, this.buildKey(key))
		} catch (error) {
			if (isNotFoundError(error)) {
				return false
			}

			console.error('Error checking key existence in S3:', error)
			return false
		}
	}
}
