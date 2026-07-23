import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'

import { isNotFoundError } from './errors.ts'
import type { StorageAdapter } from 'grammy/web'

export interface S3AdapterConfig {
	instance: S3Client
	bucket: string
	prefix?: string
}

export class S3Adapter<T> implements StorageAdapter<T> {
	private readonly client: S3Client
	private readonly bucket: string
	private readonly prefix: string

	constructor({ instance, bucket, prefix = '' }: S3AdapterConfig) {
		if (!instance) {
			throw new Error('You should pass S3Client instance to constructor.')
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
			const result = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: this.buildKey(key),
				})
			)

			if (!result.Body) {
				return undefined
			}

			const body = await result.Body.transformToString()
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
			await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucket,
					Key: this.buildKey(key),
					Body: JSON.stringify(value),
					ContentType: 'application/json',
				})
			)
		} catch (error) {
			console.error('Error writing to S3:', error)
			throw error
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: this.buildKey(key),
				})
			)
		} catch (error) {
			console.error('Error deleting from S3:', error)
			throw error
		}
	}

	async has(key: string): Promise<boolean> {
		try {
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.buildKey(key),
				})
			)

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
