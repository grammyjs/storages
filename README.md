# Grammy storages

This is monorepo for Satont's adapters for [grammY](https://grammy.dev)

## Packages

- `file`: a file storage
- `mongodb`: a mongodb storage
- `psql`: a postgresql storage
- `redis`: a redis storage
- `typeorm`: a typeorm storage

Each package is 100% [TypeScript](https://www.typescriptlang.org/), well tested and focused on support [Deno](https://deno.land) and [Node.js](https://nodejs.org/en/)


## Contributing

Bug reports and pull requests are welcome.

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

## Building

```
pnpm run build
```

## Testing

```
pnpm test
```


## Linting

```
pnpm lint
```