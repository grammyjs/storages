import { Buffer } from 'node:buffer'

import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { Client as MinioClient } from 'minio'

import type { Readable } from 'node:stream'

/**
 * Normalized view over the supported S3 SDKs: every driver works with
 * already-serialized session payloads and lets "object not found" errors
 * propagate to the adapter, which recognizes them via `isNotFoundError`.
 */
export interface S3Driver {
	get(bucket: string, key: string): Promise<string | undefined>
	put(bucket: string, key: string, body: string): Promise<void>
	remove(bucket: string, key: string): Promise<void>
	exists(bucket: string, key: string): Promise<boolean>
}

export function createAwsDriver(client: S3Client): S3Driver {
	return {
		async get(bucket, key) {
			const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

			return result.Body ? await result.Body.transformToString() : undefined
		},
		async put(bucket, key, body) {
			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					Body: body,
					ContentType: 'application/json',
				})
			)
		},
		async remove(bucket, key) {
			await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
		},
		async exists(bucket, key) {
			await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
			return true
		},
	}
}

async function streamToString(stream: Readable): Promise<string> {
	const chunks: Uint8Array[] = []

	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk))
	}

	return Buffer.concat(chunks).toString('utf8')
}

export function createMinioDriver(client: MinioClient): S3Driver {
	return {
		async get(bucket, key) {
			const stream = await client.getObject(bucket, key)
			return await streamToString(stream)
		},
		async put(bucket, key, body) {
			await client.putObject(bucket, key, body, Buffer.byteLength(body), {
				'Content-Type': 'application/json',
			})
		},
		async remove(bucket, key) {
			await client.removeObject(bucket, key)
		},
		async exists(bucket, key) {
			await client.statObject(bucket, key)
			return true
		},
	}
}

export function createBunDriver(client: Bun.S3Client): S3Driver {
	return {
		async get(_bucket, key) {
			const file = client.file(key)

			if (!(await file.exists())) {
				return undefined
			}

			return await file.text()
		},
		async put(_bucket, key, body) {
			await client.write(key, body)
		},
		async remove(_bucket, key) {
			await client.delete(key)
		},
		async exists(_bucket, key) {
			return await client.file(key).exists()
		},
	}
}
