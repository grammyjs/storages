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
} from "https://x.nest.land/grammy-mongodb-storage@1.1.0/src/mod.ts";
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/mongodb/examples)
folder, which contains deno and node examples.:

### Mongoose

If you use Mongoose for operations with mongodb, you can still use this adapter.
You need to get a native connection and use it:

```ts
import mongoose from "mongoose";
import MongoStorage from "@grammyjs/storage-mongodb";

await mongoose.connect("mongodb://localhost:27017/test");

const collection = mongoose.connection.db.collection<MongoStorage.ISession>(
  "sessions",
);
new MongoStorage.MongoDBAdapter({ collection });
```
