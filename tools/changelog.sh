#!/bin/sh
pnpm exec conventional-changelog -l @satont/grammy-$1-storage --commit-path packages/$1 -i packages/$1/CHANGELOG.md -s