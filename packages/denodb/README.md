# DenoDB Database Storage Adapter for grammY

Database storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) via [DenoDB](https://github.com/eveningkid/denodb) when using sessions.

## Attention

Denodb dependency is broken (see https://github.com/eveningkid/denodb/issues/3790). Until it get fixed we pinned it to fork version of it https://raw.githubusercontent.com/jerlam06/denodb/master/mod.ts

You should use import maps or use same import as in example below: 

```ts
 import * as DenoDB from 'https://raw.githubusercontent.com/jerlam06/denodb/master/mod.ts'
```


## Instructions

1. Import the adapter

   ```ts
   import { DenoDBAdapter } from "https://deno.land/x/grammy_storages/denodb/src/mod.ts";
   ```

2. Create a [Database](https://github.com/eveningkid/denodb#first-steps)

   ```ts
   const db = new Database(connection);
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
       storage: new DenoDBAdapter(db),
   }));
   ```

5. Use `ctx.session` as explained in [session plugin](https://grammy.dev/plugins/session.html)'s docs.

## How to Use

You can check [examples](./examples) folder for full blown usage, or see a simple use case below:

```ts
const connection = new SQLite3Connector({ filepath: "./example.db" });
const db = new Database(connection);

type MyContext = Context & SessionFlavor<string>;
const bot = new Bot<MyContext>("<Token>");

bot.use(session({
    initial: () => "test",
    storage: new DenoDBAdapter(db),
}));
```
