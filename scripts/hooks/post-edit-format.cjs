#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files after edits
 *
 * Runs after Edit/Write tool use. Detects the project formatter
 * (Biome or Prettier) and auto-formats the edited file.
 *
 * Simplified from ECC post-edit-format.js (inlined formatter detection).
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let data = '';

function findProjectRoot(startDir) {
  let dir = startDir;
  const root = path.parse(dir).root;
  let depth = 0;
  while (dir !== root && depth < 20) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
    depth++;
  }
  return null;
}

function detectFormatter(projectRoot) {
  if (!projectRoot) return null;
  if (fs.existsSync(path.join(projectRoot, 'biome.json')) ||
      fs.existsSync(path.join(projectRoot, 'biome.jsonc'))) return 'biome';
  const prettierConfigs = [
    '.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.yml',
    '.prettierrc.yaml', 'prettier.config.js', 'prettier.config.cjs',
  ];
  for (const config of prettierConfigs) {
    if (fs.existsSync(path.join(projectRoot, config))) return 'prettier';
  }
  return null;
}

function findBin(projectRoot, name) {
  const localBin = path.join(projectRoot, 'node_modules', '.bin', name);
  if (fs.existsSync(localBin)) return localBin;
  return null;
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) {
    data += chunk.substring(0, MAX_STDIN - data.length);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx|js|jsx)$/.test(filePath)) {
      const resolvedPath = path.resolve(filePath);
      const projectRoot = findProjectRoot(path.dirname(resolvedPath));
      const formatter = detectFormatter(projectRoot);

      if (formatter) {
        const bin = findBin(projectRoot, formatter === 'biome' ? 'biome' : 'prettier');
        if (bin) {
          const args = formatter === 'biome'
            ? ['check', '--write', resolvedPath]
            : ['--write', resolvedPath];
          try {
            execFileSync(bin, args, {
              cwd: projectRoot,
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: 15000,
            });
          } catch {
            // format failed — non-blocking
          }
        }
      }
    }
  } catch {
    // invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
