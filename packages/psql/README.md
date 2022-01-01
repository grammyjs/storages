# PSQL storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[PostgreSQL](https://www.postgresql.org/) when using sessions.

## Installation

Node

```bash
npm install @satont/grammy-psql-storage pg --save
```

Deno

```ts
import { PsqlAdapter } from "https://x.nest.land/grammy-psql-storage@1.0.0/src/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.14.2/mod.ts";
```

## Usage

You can check
[examples](https://github.com/Satont/grammy-storages/tree/main/packages/psql/examples)
folder
