# <h1 align="center">grammY Free Sessions</h1>

---

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) for free and with zero setup.
Authentication works via your existing bot token.

## Installation

We already did the database setup for you.
All you have to do is use this package.
The rest will work automatically.

### Deno

```ts
// Import this module
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

// Install the session middleware
bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}))
```

### Node

Install this package.

```bash
npm i @grammyjs/storage-free
```

Next, use this code.

```ts
// Import the pacakge
import { freeStorage } from "@grammyjs/storage-free";

// Install the session middleware
bot.use(session({
  initial: ...
  storage: freeStorage<SessionData>(bot.token),
}))
```

## Free Storage? Seriously?

Yes.
We trust you, so please be gentle with the servers.

This service is free, forever and for everyone.
We enforce some hard limits to make sure it can stay that way.

- Session keys cannot be longer than 64 characters.
- Session data cannot be larger than 16 KiB _per session key_.
- There cannot be more than 50,000 sessions per bot.

## How Does It Work?

We use your bot token once to make sure you are actually running a bot.
If we can authenticate your bot successfully with the bot token, we generate a second token that is only used to access your session data.
We then forget about your token again, so it is never stored.

This package will handle the login procedure (and everything else) for you.
There is no further setup.

You may also be interested in [our open-source backend implementation](https://github.com/grammyjs/free-session-backend).

## Full Example Bot

Example of a message counter bot running on Deno:

```ts
import {
  Bot,
  Context,
  session,
  SessionFlavor,
} from "https://lib.deno.dev/x/grammy@1.x/mod.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages/free/src/mod.ts";

// Define session structure
interface SessionData {
  count: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

// Create the bot and register the session middleware
const bot = new Bot<MyContext>(""); // <-- put your bot token between the ""

bot.use(session({
  initial: () => ({ count: 0 }),
  storage: freeStorage<SessionData>(bot.token),
}));

// Use persistent session data in update handlers
bot.on("message", async (ctx) => {
  ctx.session.count++;
  await ctx.reply(`Message count: ${ctx.session.count}`);
});

bot.catch((err) => console.error(err));
bot.start();
```
