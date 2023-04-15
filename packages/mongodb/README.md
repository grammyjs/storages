# MongoDB storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) with
[MongoDB](https://www.mongodb.com/) when using sessions.

Compatible with deno and node!

## Installation

Node

```bash
npm install @grammyjs/storage-mongodb --save
```

Deno

```ts
import {
  ISession,
  MongoDBAdapter,
} from "https://deno.land/x/grammy_storages/mongodb/src/mod.ts";
```

## Usage

You can see [examples/](https://github.com/grammyjs/storages/tree/main/packages/mongodb/examples) which contains both Deno and Node examples.

### Mongoose

If you use Mongoose for operations with mongodb, you can still use this adapter.
You need to get a native connection and use it:

```ts
import mongoose from "mongoose";
import { MongoDBAdapter, ISession } from "@grammyjs/storage-mongodb";

await mongoose.connect("mongodb://localhost:27017/test");

const collection = mongoose.connection.db.collection<ISession>(
  "sessions",
);

bot.use(session({
    initial: (): SessionData => ({
        pizzaCount: 0,
    }),
    storage: new MongoDBAdapter({ collection }),
}))
```
