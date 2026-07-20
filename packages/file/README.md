# File storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in files when
using sessions.

## Installation

This package is published to both [npm](https://www.npmjs.com/package/@grammyjs/storage-file) and [JSR](https://jsr.io/@grammyjs/storage-file) under the same name.

Node

```bash
npm install @grammyjs/storage-file --save
# or via JSR (npm compatibility layer):
# npx jsr add @grammyjs/storage-file
```

Deno

```bash
deno add jsr:@grammyjs/storage-file
```

```ts
import { FileAdapter } from 'jsr:@grammyjs/storage-file'
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/file/examples)
folder
