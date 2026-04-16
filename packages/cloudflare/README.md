# Cloudflare KV/D1 storages for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in cloudflare when
using sessions.

## Installation

```bash
npm install @grammyjs/storage-cloudflare --save
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
