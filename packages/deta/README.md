# Deta.sh Base storage adapter for [grammY](https://github.com/grammyjs/grammY)

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) on [Deta.sh Base](https://deta.sh/) when using sessions.

## Installation

Node

```bash
npm install @grammyjs/storage-deta --save
```

Deno

```ts
import { DetaAdapter } from "https://deno.land/x/grammy_storages/deta/src/mod.ts";
```

## Introduction

> Set up your Deta Base by creating a Deta project. Copy the Project Key to here.

You should now have:

1. A project key for your Deta.sh project.
2. A Telegram bot token.

Put those values into the following example code:

## Usage

You can check [examples](examples/) folder.

Example of a message counter bot running on Deno:

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { DetaAdapter } from "https://deno.land/x/grammy_storages/deta/src/mod.ts";

// Define session structure
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create the bot and register the session middleware
const bot = new Bot<MyContext>(""); // <-- Put your Bot token here.

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: new DetaAdapter<SessionData>({
    baseName: "session", // <-- Base name - your choice.
    projectKey: "", // <-- Project Key here.
  }),
}));

// Use persistant session data in update handlers
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```