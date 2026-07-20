# MongoDB storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) with
[MongoDB](https://www.mongodb.com/) when using sessions.

Compatible with deno and node!

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-mongodb) and [JSR](https://jsr.io/@grammyjs/storage-mongodb) under the same name.

Node

```bash
npm install @grammyjs/storage-mongodb --save
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-mongodb
```

Deno

```bash
deno add jsr:@grammyjs/storage-mongodb
```

```ts
import { ISession, MongoDBAdapter } from 'jsr:@grammyjs/storage-mongodb'
```

## Usage

You can see [examples/](https://github.com/grammyjs/storages/tree/main/packages/mongodb/examples) which contains both Deno and Node examples.

### Mongoose

If you use Mongoose for operations with mongodb, you can still use this adapter.
You need to get a native connection and use it:

```ts
import mongoose from 'mongoose'
import { MongoDBAdapter, ISession } from '@grammyjs/storage-mongodb'

await mongoose.connect('mongodb://localhost:27017/test')

const collection = mongoose.connection.db.collection<ISession>('sessions')

bot.use(
	session({
		initial: (): SessionData => ({
			pizzaCount: 0,
		}),
		storage: new MongoDBAdapter({ collection }),
	})
)
```
