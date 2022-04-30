# Google Firestore storage adapter for grammY

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) on [Google Cloud Firestore](https://cloud.google.com/firestore) when using sessions.

## Installation

```bash
npm install @grammyjs/storage-firestore --save
```

You should also have [`@google-cloud/firestore`](https://www.npmjs.com/package/@google-cloud/firestore) installed.

## Introduction

> Set up your Firestore database by following <https://cloud.google.com/firestore/docs/quickstart-servers#node.js>.

You should now have:

1. A project ID for you google cloud project
2. A keyfile containing the firestore authentication credentials
3. A Telegram bot token

Put those values into the following example code:

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { adapter } from "@grammyjs/storage-firestore";
import { Firestore } from "@google-cloud/firestore";

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Connect to Firestore
const db = new Firestore({
  // adjust these values:
  projectId: "YOUR_PROJECT_ID",
  keyFilename: "firestore-keyfile.json",
});

// Create bot and register session middleware
const bot = new Bot<MyContext>("");
bot.use(
  session({
    initial: () => ({ counter: 0 }),
    storage: adapter(db.collection("sessions")),
  })
);

// Register your usual middleware, and start the bot
bot.command("stats", (ctx) =>
  ctx.reply(`Already got ${ctx.session.counter} photos!`)
);
bot.on(":photo", (ctx) => ctx.session.counter++);

bot.start();
```

On firestore, you are billed per operation.
If your bot does not need the session data for most of the messages it processes, this would cause a lot of superfluous reads and writes.
Imagine your bot is in a group chat where it only counts photos but otherwise ignores all messages.
Then it would not make sense to retrieve the session data for every request, and to write back the identical data.
The solution is to use the built-in lazy mode of grammY, so just replace `bot.use(session ...)` by `bot.use(lazySession ...)`, and remember to `await ctx.session` whenever you use it.
You must also flavor your context with `LazySessionFlavor` instead of just `SessionFlavor`.