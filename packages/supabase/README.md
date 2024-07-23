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

  You could also add `created_at` and `updated_at` to keep track of changes. ( [See below](#createdat-and-updatedat-guide) )

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

## createdAt and updatedAt Guide

You can alter table manually or just execute this SQL snippet in SQL editor (don't forget to replace `YOUR_TABLE_NAME` with your table name):

```sql
-- Add new columns to table named `created_at` and `updated_at`
ALTER TABLE YOUR_TABLE_NAME
ADD COLUMN created_at timestamptz default now(),
ADD COLUMN updated_at timestamptz default now();

-- Enable MODDATETIME extension
create extension if not exists moddatetime schema extensions;

-- This will set the `updated_at` column on every update
create trigger handle_updated_at before update on YOUR_TABLE_NAME
  for each row execute procedure moddatetime (updated_at);
```

### Manually enable extension

1. Navigate to `Database` -> `Extensions` in your Supabase dashboard
2. Enable the `MODDATETIME` extension
3. Add a new column to your table named `created_at`, with type `timestamptz`, and default value `now()`
4. Add a new column to your table named updated_at, with type `timestamptz`, and default value `now()`
5. Go to the SQL editor and run the following query (replace `YOUR_TABLE_NAME` with the name of your table):

```sql
create trigger handle_updated_at before update on YOUR_TABLE_NAME
  for each row execute procedure moddatetime (updated_at);
```

 
## Notes (WARNING)

Using the `anon public` key will lead to unexpected behaviour since [RLS (Row Level Security)](https://supabase.com/docs/guides/database/postgres/row-level-security) is enabled by default when creating the table, and will lock writing unless explicit permissions.  
When RLS is enabled without configuration, a [default-deny policy](https://www.postgresql.org/docs/current/ddl-rowsecurity.html#DDL-ROWSECURITY:~:text=If%20no%20policy%20exists%20for%20the%20table%2C%20a%20default%2Ddeny%20policy%20is%20used%2C%20meaning%20that%20no%20rows%20are%20visible%20or%20can%20be%20modified) is used.

You can use `service_role` secret, but be aware that this will **bypass** RLS.
