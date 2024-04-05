# Pocketbase storage adapter for grammY

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) with [Pocketbase](https://pocketbase.io/) when using sessions.

## Usage

### Host a Pocketbase instance

> This package was developed with Pocketbase v0.22.7 in mind, you may upgrade or downgrade your Pocketbase instance version, but full compatibility is not guaranteed

**[Pocketbase v0.22.7 binaries](https://github.com/pocketbase/pocketbase/releases/tag/v0.22.7)**

This package uses the Pocketbase instance URL; You may obtain this after running `./pocketbase serve` in the terminal, in the location that you have extracted your pocketbase binary.

For more information regarding this, read [the official Pocketbase documentation](https://pocketbase.io/docs).

In this example and for ease of prototyping, we will host a Pocketbase instance on our local Windows machine.

After running `./pocketbase serve` in the location in which we extracted the .exe binary, we will be faced with this screen:

![Pocketbase server routes](./docs/images/pb-url.png)

> Copy the underlined url, this url will be used for the `pocketbaseInstanceUrl` when using this storage adapter
