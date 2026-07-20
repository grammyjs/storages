# PSQL storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[PostgreSQL](https://www.postgresql.org/) when using sessions.

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-psql) and [JSR](https://jsr.io/@grammyjs/storage-psql) under the same name.

Node

```bash
npm install @grammyjs/storage-psql pg --save
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-psql
```

Deno

```bash
deno add jsr:@grammyjs/storage-psql npm:pg
```

```ts
import { PsqlAdapter } from 'jsr:@grammyjs/storage-psql'
import { Client } from 'npm:pg'
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/psql/examples)
folder

## Vendor Examples

### [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) ([Neon](https://neon.tech))

```js
import { createClient } from '@vercel/postgres'
import { PsqlAdapter } from '@grammyjs/storage-psql'

const client = createClient()

await client.connect()

bot.use(
	session({
		storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
	})
)
```
