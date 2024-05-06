# S3 Storage Adapter for grammY

Session storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) via an
[S3 compatible object storage](https://en.wikipedia.org/wiki/Amazon_S3#S3_API_and_competing_services).

The most prominent options are:

- AWS S3 (12 months limited free tier)
- Cloudflare R2 (unlimited free tier, no egress fee, but needs account with
  payment connected, in case the use exceeds free tier)
- https://github.com/minio/minio your own S3 in docker
- ... <!-- is there a stable external list that compares the options? -->

## Pros and Cons

The biggest restriction of the current setup is that it only works with deno.
For it to work with pnpm / node, we would need to add the following line to
`.npmrc` (which is currently `.gitignore`d)

```
@jsr:registry=https://npm.jsr.io
# The above doesn't work and prevents us from adding
# "@bradenmacdonald/s3-lite-client": "npm:@jsr/bradenmacdonald__s3-lite-client@0.7.4"
# to packages/s3/package.json
# the error reported by "pnpm i":
#   ERR_PNPM_FETCH_404 GET https://registry.npmjs.org/@grammyjs%2Fstorage-utils: Not Found - 404
#   This error happened while installing a direct dependency of /run/media/karfau/hdd-data/dev/storages/packages/file
#   @grammyjs/storage-utils is not in the npm registry, or you have no permission to fetch it.
```

which would allow us to add `packages/s3/package.json` with the following
`dependency`:
`"@bradenmacdonald/s3-lite-client": "npm:@jsr/bradenmacdonald__s3-lite-client@0.7.4"`
it would also require some changes to the imports, to provide the bare
specifiers as listed in `package.json` in `deno.json` "imports". And we would
need to add related tests

1. It is not the fastest way to get your data (benchmarks?), so it currently
   does not implement the methods for loading all sessions. In a webhook
   approach it works best using `LazySession`
   [and the `serialize` middleware from `@grammyjs/runner`](https://grammy.dev/advanced/deployment#webhooks).
2. You should consider limiting the key to
   ["safe characters"](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html).
3. The setup requires 3-5 parameters (depending on the provider) that you need
   to pass as env variables, which could be passed as one JSON string in a
   single env variable. But by using individual andcommon variable names like
   `AWS_SECRET_KEY`, more tools will pick them up. The process of getting all
   the right parameters from your provider can be very different.
4. Each provider can have different limitations regarding the storage, check
   them out.
5. You can use the same storage to even store the raw Updates to process them
   later
6. You can use the same storage to also store and access other data using the
   `client`. It helps to think of the objects that you store as files on disk,
   where you have at least one ID as a path element (or filename). Examples:
   assets, or each update as a json file for async processing.
7. You can use the aws cli, `mc`, `rclone` and similar CLI tools to access the
   data or to get a local copy of some or all files.

## Instructions

1. Import the adapter

   ```ts
   import { S3DBAdapter } from "https://deno.land/x/grammy_storages/s3/src/mod.ts";
   ```

2. Get the credentials from you provider and pass them from one or multiple env
   variables.

   ```ts
   const clientOptions: S3ClientOptions = JSON.parse(
     Deno.env.get("S3_CLIENT_OPTS") ?? "{}",
   );
   ```

3. Define lazy session structure

   ```ts
   interface SessionData {
     count: number;
   }
   type MyContext = Context & LazySessionFlavor<SessionData>;
   ```

4. Define method to create session key from context

   ```ts
   function getSessionKey (ctx: MyContext) {
     // it could be user based
     return `/chat/${ctx.from?.id ?? 0}/session.json`;
     // or if group chats are relevant, it could be chat based
     // return `/chat/${ctx.chat?.id ?? 0}/session.json`;
   }
   ```

5. Register adapter's middleware

   ```ts
   const bot = new Bot<MyContext>("<Token>");

   bot.use(sequentialize(getSessionKey)).use(lazySession({
     getSessionKey,
     initial(){
      return {count: 0 }
     },
     storage: new S3Adapter(clientOptions),
   }));
   ```

Use `await ctx.session` as explained in
[session plugin](https://grammy.dev/plugins/session.html#lazy-sessions)'s docs.

<!--
## More examples

can be found in the [examples](./examples) folder.
-->
