# DenoKV Storage Adapter for grammY

Database storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) via [Deno KV API](https://deno.land/manual/runtime/kv) when using sessions.

## Attention

1. ⚠️ At this moment Deno KV is `experimental` API. Use cli flag `--unstable` while starting project.
   Check the API at https://deno.land/api?s=Deno.Kv&unstable
3. Deno KV has **a fixed size limit** and you might run into some issues when you are using [the conversations plugin](https://grammy.dev/plugins/conversations) whilst you're building long forms or pagination system inside a conversation. You can find out more about it in the last paragraph of the [API description](https://deno.land/api?s=Deno.Kv&unstable) but here's the short version:
   > Keys have a maximum length of 2048 bytes after serialization.
   > Values have a maximum length of 64 KiB after serialization.

   The size limit error at a glance
    ![image](https://github.com/grammyjs/storages/assets/1687551/3cfc6bfe-392f-4cea-8bf0-e23ba532089e)

## Instructions

1. Import the adapter

   ```ts
   import { DenoKVAdapter } from "https://deno.land/x/grammy_storages/denokv/src/mod.ts";
   ```

4. Get KV instance (leave path blank to use default)

   ```ts
   const kv = await Deno.openKv("./kv.db");
   ```

5. Define session structure

   ```ts
   interface SessionData {
     count: number;
   }
   type MyContext = Context & SessionFlavor<SessionData>;
   ```

6. Register adapter's middleware

   ```ts
   const bot = new Bot<MyContext>("<Token>");

   bot.use(session({
     initial: () => ({ count: 0 }),
     storage: new DenoKVAdapter(kv),
   }));
   ```

7. Use `ctx.session` as explained in
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
