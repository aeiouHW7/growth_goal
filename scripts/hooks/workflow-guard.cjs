#!/usr/bin/env node
/**
 * PreToolUse Hook: Workflow Guard
 *
 * When creating new business files under src/, reminds the agent
 * to go through ace-planner first. Soft warning (exit 0), not hard block.
 *
 * Exit codes:
 *   0 = allow (always — this is advisory only)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

const SRC_PATTERN = /\bsrc\//;
const BUSINESS_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.vue', '.svelte']);
const SKIP_PATTERNS = [
  /\.(test|spec|mock|stub|fixture)\.(ts|tsx|js|jsx)$/,
  /__tests__\//,
  /__mocks__\//,
];

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

    if (filePath && SRC_PATTERN.test(filePath)) {
      const ext = path.extname(filePath);
      const isBusinessFile = BUSINESS_EXTENSIONS.has(ext);
      const isTestFile = SKIP_PATTERNS.some(p => p.test(filePath));

      if (isBusinessFile && !isTestFile) {
        let isNewFile = true;
        try {
          fs.lstatSync(filePath);
          isNewFile = false;
        } catch (err) {
          if (err && err.code !== 'ENOENT') isNewFile = false;
        }

        if (isNewFile) {
          process.stderr.write(
            `[Hook] Creating new business file: ${path.basename(filePath)}\n` +
            'Consider running /ace-planner first to ensure this fits the design.\n'
          );
        }
      }
    }
  } catch {
    // parse error — pass through
  }

  process.stdout.write(raw);
});
