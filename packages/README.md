# grammY storages

This is monorepo of session adapters for [grammY](https://grammy.dev).

## Storages

- [file](https://github.com/grammyjs/storages/tree/main/packages/file)
- [mongodb](https://github.com/grammyjs/storages/tree/main/packages/mongodb)
- [psql](https://github.com/grammyjs/storages/tree/main/packages/psql)
- [redis](https://github.com/grammyjs/storages/tree/main/packages/redis)
- [typeorm](https://github.com/grammyjs/storages/tree/main/packages/typeorm)
- [denodb](https://github.com/grammyjs/storages/tree/main/packages/denodb)
- [deta](https://github.com/grammyjs/storages/tree/main/packages/deta)
- [firestore](https://github.com/grammyjs/storages/tree/main/packages/firestore)
- [free](https://github.com/grammyjs/storages/tree/main/packages/free)
- [supabase](https://github.com/grammyjs/storages/tree/main/packages/supabase)
- [prisma](https://github.com/grammyjs/storages/tree/main/packages/prisma)
- [cloudflare](https://github.com/grammyjs/storages/tree/main/packages/cloudflare)
- [denokv](https://github.com/grammyjs/storages/tree/main/packages/denokv)

Each package is 100 % [TypeScript](https://www.typescriptlang.org/), well tested, and focused on supporting [Deno](https://deno.land) and [Node.js](https://nodejs.org).


## Contributing

Bug reports and pull requests are welcome.

### Commit rules
```
<type>(<scope>?): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: utils|file|mongodb|psql|redis|typeorm|supabase|free|firestore|deta|denodb|denokv|cloudflare
  │                          
  │                          
  │                          
  │
  └─⫸ Commit Type: docs|feat|fix|perf|refactor|test|chore|release
```

This is inspired by https://www.conventionalcommits.org

## Development

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.

2. Install pnpm:
    ```
    npm i -g pnpm
    ```

3. Install the dependencies with:
    ```
    pnpm install
    ```

## Release

```bash
pnpm lerna publish --force-publish [major|minor|patch]
```

`--force-publish` used for bump all packages version here.

## Building

```
pnpm build
```

## Testing

```
pnpm test
```


## Linting

```
pnpm lint
```

