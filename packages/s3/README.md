# S3 storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[S3](https://aws.amazon.com/s3/) when using sessions. Works with AWS S3 and
any S3-compatible storage (MinIO, Cloudflare R2, Wasabi, DigitalOcean Spaces,
and others).

One `S3Adapter` class works with any of the supported clients and detects the
SDK automatically:

- [AWS SDK for JavaScript v3](https://www.npmjs.com/package/@aws-sdk/client-s3)
  (`S3Client`)
- [MinIO JavaScript SDK](https://www.npmjs.com/package/minio) (`Client`)
- [Bun](https://bun.sh/docs/api/s3) (`Bun.S3Client`)

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-s3) and [JSR](https://jsr.io/@grammyjs/storage-s3) under the same name.

Node

```bash
npm install @grammyjs/storage-s3 @aws-sdk/client-s3 --save
# or with the MinIO SDK:
npm install @grammyjs/storage-s3 minio --save
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-s3
```

```ts
import { S3Adapter } from '@grammyjs/storage-s3'
```

Deno

```bash
deno add jsr:@grammyjs/storage-s3 npm:@aws-sdk/client-s3
# or with the MinIO SDK:
deno add jsr:@grammyjs/storage-s3 npm:minio
```

```ts
import { S3Adapter } from 'jsr:@grammyjs/storage-s3'
```

Bun

```bash
bun add @grammyjs/storage-s3
```

```ts
import { S3Adapter } from '@grammyjs/storage-s3'
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/s3/examples)
folder, or see simple use cases below.

### AWS SDK

```ts
import { S3Client } from '@aws-sdk/client-s3'
import { S3Adapter } from '@grammyjs/storage-s3'

const client = new S3Client({ region: 'us-east-1' })

const storage = new S3Adapter(client, {
	bucket: 'my-bucket',
	prefix: 'sessions/',
})

bot.use(
	session({
		initial: () => ({ pizzaCount: 0 }),
		storage,
	})
)
```

### MinIO SDK

```ts
import { S3Adapter } from '@grammyjs/storage-s3'
import { Client } from 'minio'

const client = new Client({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'your-access-key',
	secretKey: 'your-secret-key',
})

const storage = new S3Adapter(client, {
	bucket: 'my-bucket',
	prefix: 'sessions/',
})

bot.use(
	session({
		initial: () => ({ pizzaCount: 0 }),
		storage,
	})
)
```

### Bun

```ts
import { S3Adapter } from '@grammyjs/storage-s3'
import { S3Client } from 'bun'

const client = new S3Client({
	bucket: 'my-bucket',
	accessKeyId: 'your-access-key-id',
	secretAccessKey: 'your-secret-access-key',
})

const storage = new S3Adapter(client, {
	prefix: 'sessions/',
})

bot.use(
	session({
		initial: () => ({ pizzaCount: 0 }),
		storage,
	})
)
```

## Configuration

The `S3Adapter` constructor takes the client instance as the first argument
and an options object as the second:

- `bucket` (required for the AWS and MinIO SDKs): The name of the S3 bucket.
  Not needed for `Bun.S3Client`, which is already bound to a bucket
- `prefix` (optional): A prefix prepended to every object key. Useful to
  separate sessions from other data in the same bucket. Defaults to `''`

## TTL (Time To Live)

S3 has no per-object TTL. If you want sessions to expire automatically,
configure a
[bucket lifecycle rule](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
with an expiration for the sessions prefix.

## Error Handling

The adapter includes built-in error handling and logging. Reading a missing
object returns `undefined`. Errors during read operations are logged and
return `undefined`, while write and delete operations will throw errors.
