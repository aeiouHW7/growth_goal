#!/bin/bash
# Growth CLI wrapper - add this to PATH or source it
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" && npx tsx growth-cli.ts "$@"
