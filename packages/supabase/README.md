# Supabase database storage adapter for grammY

Database storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) in [Supabase database](https://supabase.io/docs/guides/database) when using sessions.

## Installation

```bash
npm install @grammyjs/storage-supabase --save
```

## Instructions

To get started, you first need to

- Have both `@supabase/supabase-js` and `grammy` installed
- Have a defined table for sessions in supabase will the following informations:
  - `id` as a primary key of type `varchar`, cannot be null
  - `session` as `text`. Make it nullable.

  You could also add `created_at` and `updated_at` to keep track of changes.

## How to use

You can check [examples](https://github.com/grammyjs/storages/tree/main/packages/supabase/examples) folder for full blown usage, or see a simple use case below:

```ts
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { supabaseAdapter } from '@grammyjs/storage-supabase';
import { createClient } from '@supabase/supabase-js';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const URL = 'http://localhost:3000';
const KEY = 'some.fake.key';

// supabase instance
const supabase = createClient(URL, KEY);

//create storage
const storage = supabaseAdapter({
  supabase,
  table: 'session', // the defined table name you want to use to store your session
});

// Create bot and register session middleware
const bot = new Bot<MyContext>(''); // <-- put your bot token here
bot.use(
  session({
    initial: () => ({ counter: 0 }),
    storage,
  }),
);

// Display total stats of images uploaded so far
bot.command('stats', (ctx) => ctx.reply
(`Already got ${ctx.session.counter} images!`));

// Collect statistics of photos uploaded
bot.on(':photo', (ctx) => ctx.session.counter++);

bot.start();
```