# TypeORM storage adapter for grammY

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) with [TypeORM](https://typeorm.io/) when using sessions.

## Installation

```bash
npm install @grammyjs/storage-typeorm typeorm --save
```

## Usage


You can check [examples](https://github.com/grammyjs/storages/tree/main/packages/typeorm/examples) folder, or simple use followed code:

Implement the Session entity:
```ts
import { Column, createConnection, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ISession } from "@grammyjs/storage-typeorm";

@Entity()
export class Session implements ISession {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('varchar')
  key: string

  @Column('text')
  value: string
}
```

Create bot and pass adapter as storage:

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { TypeormAdapter } from "@grammyjs/storage-typeorm";
import { createConnection } from 'typeorm';

// that import for example class before
import Session from './session'

// write session types
interface SessionData {
  counter: number;
}

// create context for grammy instance
type MyContext = Context & SessionFlavor<SessionData>;

// Create bot and register session middleware
async function bootstrap() {
  // create typeorm connection
  await createConnection({
    name: 'default',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [Session],
    synchronize: true,
  });

  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
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
