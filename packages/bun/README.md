# Bun storage adapters for grammY

Session storage for [grammY](https://grammy.dev) backed by an existing
[Bun SQL](https://bun.sh/docs/runtime/sql) instance or an
[S3 bucket](https://bun.sh/docs/api/s3).

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-bun) and [JSR](https://jsr.io/@grammyjs/storage-bun) under the same name.

```bash
bun add @grammyjs/storage-bun
# or via JSR:
bunx jsr add @grammyjs/storage-bun
```

## Database setup

Create and migrate the table before constructing the adapter. The adapter never
creates or checks this table, which avoids extra DDL work on serverless cold
starts.

PostgreSQL and SQLite:

```sql
CREATE TABLE grammy_sessions (
	"key" VARCHAR(255) PRIMARY KEY,
	"value" TEXT NOT NULL
);
```

MySQL:

```sql
CREATE TABLE grammy_sessions (
	`key` VARCHAR(255) PRIMARY KEY,
	`value` TEXT NOT NULL
);
```

## SQL usage

```ts
import { Bot, session } from 'grammy'
import { SQL } from 'bun'
import { BunSQLAdapter } from '@grammyjs/storage-bun'

interface SessionData {
	pizzaCount: number
}

const bot = new Bot('BOT_TOKEN')
const sql = new SQL(process.env.DATABASE_URL!)

bot.use(
	session({
		initial: (): SessionData => ({ pizzaCount: 0 }),
		storage: new BunSQLAdapter<SessionData>(sql, {
			tableName: 'grammy_sessions',
			dialect: 'postgres',
		}),
	})
)
```

Set `dialect` to `postgres`, `sqlite`, or `mysql` to use the corresponding
atomic upsert syntax. The adapter does not create, close, or otherwise manage
the supplied `SQL` connection.

## S3 usage

```ts
import { Bot, session } from 'grammy'
import { S3Client } from 'bun'
import { BunS3Adapter } from '@grammyjs/storage-bun'

interface SessionData {
	pizzaCount: number
}

const bot = new Bot('BOT_TOKEN')
const client = new S3Client({
	bucket: 'my-bucket',
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

bot.use(
	session({
		initial: (): SessionData => ({ pizzaCount: 0 }),
		storage: new BunS3Adapter<SessionData>(client, { dirName: 'sessions' }),
	})
)
```

Sessions are stored as objects named `${key}.json` inside `dirName` (the bucket
root by default), by analogy with the file adapter. The adapter does not create
or check the bucket and never manages the supplied `S3Client`.
