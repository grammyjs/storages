# Bun SQL storage adapter for grammY

Session storage for [grammY](https://grammy.dev) backed by an existing
[Bun SQL](https://bun.sh/docs/runtime/sql) instance.

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

## Usage

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
