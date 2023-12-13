#!/usr/bin/env bash

# install pnpm if doesnt exist (assumes npm is installed)
if ! command -v pnpm -v &> /dev/null; then
  npm i -g pnpm
fi
# install dependencies
if [! -d node_modules]; then
  pnpm i
fi
# start bot
pnpm run start
