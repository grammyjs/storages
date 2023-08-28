# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/grammyjs/storages/compare/v2.3.0...v2.3.1) (2023-08-28)

### Bug Fixes

- **prisma:** silence the "Record to delete does not exist" error ([#186](https://github.com/grammyjs/storages/issues/186)) ([7ce1614](https://github.com/grammyjs/storages/commit/7ce16144b8d00ebb6ddfeabec06426d2eddcf3c9))
- **supabase:** use pinned supabase dependency ([de19f34](https://github.com/grammyjs/storages/commit/de19f341e165b20cb5b80e28f204648075dd2895))

# [2.3.0](https://github.com/grammyjs/storages/compare/v2.2.0...v2.3.0) (2023-05-31)

### Bug Fixes

- **denokv:** make tests idempotent ([b9e23b4](https://github.com/grammyjs/storages/commit/b9e23b45aee215e7e46d033d1b43a57720a60b30))
- **denokv:** script test ([c3e9889](https://github.com/grammyjs/storages/commit/c3e988981c79cd39a2a3416f7accae09823377c7))
- **dependency:** update dependency vitest to ^0.31.0 ([#173](https://github.com/grammyjs/storages/issues/173)) ([2ad2054](https://github.com/grammyjs/storages/commit/2ad20549052d034481011fdc61f0251eded9e44b))
- **typeorm:** use correct import of `ObjectId` for mongo ([cefaf34](https://github.com/grammyjs/storages/commit/cefaf3487ddde1213f200293f27fe87c3e80540e))

# [2.2.0](https://github.com/grammyjs/storages/compare/v2.1.4...v2.2.0) (2023-04-15)

### Features

- add Cloudflare Workers KV adapter ([#169](https://github.com/grammyjs/storages/issues/169)) ([efa162b](https://github.com/grammyjs/storages/commit/efa162bd85b0bb58b8fecf3e827b83126aeefde6))
- **denokv:** add `DenoKVAdapter` package ([#175](https://github.com/grammyjs/storages/issues/175)) ([e4bc891](https://github.com/grammyjs/storages/commit/e4bc891ffd25192afd71427700f4a81ceac65f36))

## [2.1.4](https://github.com/grammyjs/storages/compare/v2.1.3...v2.1.4) (2023-03-02)

### Bug Fixes

- **denodb:** again change denodb dependency to another url because it's again broken ([14ad651](https://github.com/grammyjs/storages/commit/14ad65134702ac3b4948bbf9321f7f5faf39df93))

## [2.1.3](https://github.com/grammyjs/storages/compare/v2.1.2...v2.1.3) (2023-03-02)

**Note:** Version bump only for package @grammyjs/storages

## [2.1.2](https://github.com/grammyjs/storages/compare/v2.1.1...v2.1.2) (2023-03-02)

### Bug Fixes

- **dependency:** update dependency vitest to ^0.29.0 ([d4a1970](https://github.com/grammyjs/storages/commit/d4a1970f51ab5cc9c25319488eac442c4e0220c9))
- **firestore:** correct path of exports in `package.json` ([972181a](https://github.com/grammyjs/storages/commit/972181a3ce3c6b484cfe5058f27d76a54304a926))

## [2.1.1](https://github.com/grammyjs/storages/compare/v2.1.0...v2.1.1) (2023-02-25)

### Bug Fixes

- **dependency:** update dependency vitest to ^0.28.0 ([564127a](https://github.com/grammyjs/storages/commit/564127afaa981b9ffc64ca215fcd3187d57b0232))

# [2.1.0](https://github.com/grammyjs/storages/compare/v2.0.2...v2.1.0) (2023-01-16)

### Bug Fixes

- **denodb:** pin `denodb` dependency to github version instead of released one ([7bc7095](https://github.com/grammyjs/storages/commit/7bc70954e8809c032b8b94300aa84fd7ae15d6ad))
- **dependency:** update dependency vitest to ^0.26.0 ([f77f620](https://github.com/grammyjs/storages/commit/f77f620561ef3ae186f17875fdb95c5a3991e962))
- **dependency:** update dependency vitest to ^0.27.0 ([3395170](https://github.com/grammyjs/storages/commit/33951704880ac3b3b99cf087f641291570b7e196))
- **utils:** add missed from to message object ([d19fe78](https://github.com/grammyjs/storages/commit/d19fe78f36cd01633607959db3f7f322b11c49b8))

### Features

- unpin grammy version from all packages ([f814e3e](https://github.com/grammyjs/storages/commit/f814e3e675c31e599cfaa1c93975e8dd55d23be6))
