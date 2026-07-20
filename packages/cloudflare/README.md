# Cloudflare KV/D1 storages for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in cloudflare when
using sessions.

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-cloudflare) and [JSR](https://jsr.io/@grammyjs/storage-cloudflare) under the same name.

```bash
npm install @grammyjs/storage-cloudflare --save
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-cloudflare
# Deno:
# deno add jsr:@grammyjs/storage-cloudflare
```

## Usage

### D1

You should create table for sessions in your D1 database. You can use the following SQL query and replace `sessions` with your desired table name:

```sql
CREATE TABLE IF NOT EXISTS "GrammySessions" (key TEXT PRIMARY KEY, value TEXT)
CREATE INDEX IF NOT EXISTS "IDX_sessions" ON "GrammySessions" (key)
```

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/cloudflare/examples)
folder
