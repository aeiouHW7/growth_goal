#!/usr/bin/env node
/**
 * PreToolUse Hook: Config Protection
 *
 * Blocks modifications to linter/formatter/tsconfig files.
 * AI agents frequently modify these to make checks pass instead of fixing
 * the actual code. This hook steers the agent back to fixing the source.
 *
 * Adapted from ECC (Everything Claude Code).
 *
 * Exit codes:
 *   0 = allow (not a config file, or first-time creation)
 *   2 = block (existing config file modification attempted)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

const PROTECTED_FILES = new Set([
  // TypeScript
  'tsconfig.json',
  'tsconfig.build.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  // ESLint
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  // Prettier
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  // Biome
  'biome.json',
  'biome.jsonc',
]);

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    raw += chunk.substring(0, MAX_STDIN - raw.length);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const filePath = input.tool_input?.file_path || '';
    if (!filePath) {
      process.stdout.write(raw);
      return;
    }

    const basename = path.basename(filePath);
    if (PROTECTED_FILES.has(basename)) {
      let exists = true;
      try {
        fs.lstatSync(filePath);
      } catch (err) {
        if (err && err.code === 'ENOENT') exists = false;
      }

      if (exists) {
        process.stderr.write(
          `BLOCKED: Modifying ${basename} is not allowed. ` +
          'Fix the source code to satisfy linter/formatter rules instead of ' +
          'weakening the config. If this is a legitimate config change, ' +
          'disable the config-protection hook temporarily.\n'
        );
        process.exit(2);
      }
    }
  } catch {
    // parse error — allow through
  }

  process.stdout.write(raw);
});
