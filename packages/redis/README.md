# Redis storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[Redis](https://redis.io/) when using sessions.

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-redis) and [JSR](https://jsr.io/@grammyjs/storage-redis) under the same name.

Node

```bash
npm install @grammyjs/storage-redis ioredis --save
npm install @types/ioredis -D
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-redis
```

```ts
import { RedisAdapter } from '@grammyjs/storage-redis'
import IORedis from 'ioredis'
```

Deno

```bash
deno add jsr:@grammyjs/storage-redis npm:ioredis
```

```ts
import { RedisAdapter } from 'jsr:@grammyjs/storage-redis'
import { Redis } from 'npm:ioredis'
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/redis/examples)
folder

## Vendor Examples

### [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)

```js
import { Redis } from '@upstash/redis'
import { RedisAdapter } from '@grammyjs/storage-redis'

// automaticDeserialization is off because the adapter stores JSON strings and parses them itself.
const instance = Redis.fromEnv({ automaticDeserialization: false })

const storage = new RedisAdapter({ instance })

bot.use(session({ storage }))
```

Leave `ttl` unset with this client: the adapter writes it with the ioredis call `set(key, value, 'EX', ttl)`, which `@upstash/redis` does not accept. Use grammY's `enhanceStorage({ storage, millisecondsToLive })` for expiry instead.
