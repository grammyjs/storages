# Redis storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[Redis](https://redis.io/) when using sessions.

## Installation

Node

```bash
npm install @satont/grammy-redis-storage ioredis --save
npm install @types/ioredis -D
```

```ts
import { RedisAdapter } from "@satont/grammy-redis-storage";
import IORedis from "ioredis";
```

Deno

```ts
import { RedisAdapter } from "https://x.nest.land/grammy-redis-storage@1.1.1/src/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.25.0/mod.ts";
```

## Usage

You can check
[examples](https://github.com/Satont/grammy-storages/tree/main/packages/redis/examples)
folder
