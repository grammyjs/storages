# Prisma storage adapter for grammY

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) with [Prisma](https://www.prisma.io/) when using sessions.

## Installation

```bash
npm install @grammyjs/storage-prisma --save
```

## Usage

You can check the [examples](https://github.com/grammyjs/storages/tree/main/packages/prisma/examples) folder, or simply use followed code:

Implement the Session model in your Prisma schema:

```prisma
model Session {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String
}
```
> The `id` field is not needed for this adapter to work.
>
> The only restriction is that `key` must be a `String` index, either by
> adding the `@unique` keyword or the `@id` keyword, and `value` must be a `String`.

Generate Prisma client using the terminal:

```bash
npx prisma generate
```

[Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) the schema changes to your database:
```bash
npx prisma db push
# or
npx prisma migrate dev
```

Create bot and pass adapter as storage:

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { PrismaClient } from "@prisma/client";

// Create Prisma client
const prisma = new PrismaClient();

// write session types
interface SessionData {
  counter: number;
}

// create context for grammy instance
type MyContext = Context & SessionFlavor<SessionData>;

// Create bot and register session middleware
async function bootstrap() {
  const bot = new Bot<MyContext>("");

  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new PrismaAdapter(prisma.session),
    })
  );

  // Register your usual middleware, and start the bot
  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);

  bot.start();
}
```
