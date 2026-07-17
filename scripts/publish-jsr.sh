#!/usr/bin/env bash
set -euo pipefail

for dir in packages/*/; do
	if [ -f "$dir/deno.json" ]; then
		(cd "$dir" && pnpm dlx jsr publish "$@")
	else
		(cd "$dir" && pnpm dlx pkg-to-jsr && pnpm dlx jsr publish "$@")
	fi
done
