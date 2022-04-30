#!/usr/bin/env bash

pnpm run build

cd ./packages

for f in *; do
    if [ -d "$f" ]; then
        if [ -f "$f/package.json" ]; then
            echo "Publishing $f"
            cd $f
            pnpm publish --dry-run --no-git-checks
            cd ..
        fi
    fi
done