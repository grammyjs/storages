# DenoKV Storage Adapter for grammY

Database storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) via
[Deno KV API](https://deno.land/manual/runtime/kv) when using sessions.

## Attention

⚠️ At this moment Deno KV is `experimental` API. Use cli flag `--unstable` while
starting project.

## Instructions

1. Import the adapter

   ```ts
   import { DenoKVAdapter } from "https://deno.land/x/grammy_storages/denokv/src/mod.ts";
   ```

2. Get KV instance (leave path blank to use default)

   ```ts
   const kv = await Deno.openKv("./kv.db");
   ```

3. Define session structure

   ```ts
   interface SessionData {
     count: number;
   }
   type MyContext = Context & SessionFlavor<SessionData>;
   ```

4. Register adapter's middleware

   ```ts
   const bot = new Bot<MyContext>("<Token>");

   bot.use(session({
     initial: () => ({ count: 0 }),
     storage: new DenoKVAdapter(kv),
   }));
   ```

5. Use `ctx.session` as explained in
   [session plugin](https://grammy.dev/plugins/session.html)'s docs.

## How to Use

You can check [examples](./examples) folder for full blown usage, or see a
simple use case below:

```ts
const kv = await Deno.openKv("./kv.db");

type MyContext = Context & SessionFlavor<string>;
const bot = new Bot<MyContext>("<Token>");

bot.use(session({
  initial: () => "test",
  storage: new DenoKVAdapter(kv),
}));
```
