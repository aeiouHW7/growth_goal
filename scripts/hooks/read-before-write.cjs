#!/usr/bin/env node
/**
 * PreToolUse Hook: Read Before Write
 *
 * Advisory warning when Write tool is used on an existing file.
 * Hooks are stateless and cannot verify whether Read was actually called,
 * so this is a soft reminder (exit 0), not a hard block.
 *
 * New file creation passes silently.
 * Edit tool is not handled — Claude Code already enforces read-before-edit.
 *
 * Exit codes:
 *   0 = allow (always — this is advisory only)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

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

    if (filePath) {
      let exists = false;
      try {
        fs.lstatSync(filePath);
        exists = true;
      } catch (err) {
        if (err && err.code !== 'ENOENT') exists = true;
      }

      if (exists) {
        process.stderr.write(
          `[Hook] Overwriting existing file: ${path.basename(filePath)}\n` +
          'Make sure you have read it first. Prefer Edit for partial changes.\n'
        );
      }
    }
  } catch {
    // parse error — allow through
  }

  process.stdout.write(raw);
});
