#!/usr/bin/env node
/**
 * PreToolUse Hook: Block Foreground Dev Servers
 *
 * Blocks npm/pnpm/yarn/bun run dev|start outside tmux to keep the terminal
 * available for other commands. Dev servers should run in tmux sessions.
 *
 * Adapted from ECC pre-bash-dev-server-block.js with shell-split and
 * shell-substitution libs inlined (faithful port, not simplified).
 *
 * Exit codes:
 *   0 = allow
 *   2 = block (dev server without tmux)
 */

'use strict';

const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

// ── Inlined from ECC scripts/lib/shell-split.js ──────────────────

function splitShellSegments(command) {
  const segments = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < command.length; i++) {
    const ch = command[i];

    if (quote) {
      if (ch === '\\' && i + 1 < command.length) {
        current += ch + command[i + 1];
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      current += ch;
      continue;
    }

    if (ch === '\\' && i + 1 < command.length) {
      current += ch + command[i + 1];
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    const next = command[i + 1] || '';
    const prev = i > 0 ? command[i - 1] : '';

    if (ch === '&' && next === '&') {
      if (current.trim()) segments.push(current.trim());
      current = '';
      i++;
      continue;
    }

    if (ch === '|' && next === '|') {
      if (current.trim()) segments.push(current.trim());
      current = '';
      i++;
      continue;
    }

    if (ch === ';') {
      if (current.trim()) segments.push(current.trim());
      current = '';
      continue;
    }

    if (ch === '&' && next !== '&') {
      if (next === '>' || prev === '>') {
        current += ch;
        continue;
      }
      if (current.trim()) segments.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) segments.push(current.trim());
  return segments;
}

// ── Inlined from ECC scripts/lib/shell-substitution.js ───────────

function extractCommandSubstitutions(input) {
  const source = String(input || '');
  const substitutions = [];
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (ch === '\\' && !inSingle) { i += 1; continue; }
    if (ch === "'" && !inDouble && prev !== '\\') { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle && prev !== '\\') { inDouble = !inDouble; continue; }
    if (inSingle) continue;

    if (ch === '`') {
      let body = '';
      i += 1;
      while (i < source.length) {
        const inner = source[i];
        if (inner === '\\') {
          body += inner;
          if (i + 1 < source.length) { body += source[i + 1]; i += 2; continue; }
        }
        if (inner === '`') break;
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        substitutions.push(body);
        substitutions.push(...extractCommandSubstitutions(body));
      }
      continue;
    }

    if (ch === '$' && source[i + 1] === '(') {
      let depth = 1;
      let body = '';
      let bodyInSingle = false;
      let bodyInDouble = false;
      i += 2;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !bodyInSingle) {
          body += inner;
          if (i + 1 < source.length) { body += source[i + 1]; i += 2; continue; }
        }
        if (inner === "'" && !bodyInDouble && innerPrev !== '\\') {
          bodyInSingle = !bodyInSingle;
        } else if (inner === '"' && !bodyInSingle && innerPrev !== '\\') {
          bodyInDouble = !bodyInDouble;
        } else if (!bodyInSingle && !bodyInDouble) {
          if (inner === '(') depth += 1;
          else if (inner === ')') { depth -= 1; if (depth === 0) break; }
        }
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        substitutions.push(body);
        substitutions.push(...extractCommandSubstitutions(body));
      }
    }
  }
  return substitutions;
}

function extractSubshellGroups(input) {
  const source = String(input || '');
  const groups = [];
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (ch === '\\' && !inSingle) { i += 1; continue; }
    if (ch === "'" && !inDouble && prev !== '\\') { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle && prev !== '\\') { inDouble = !inDouble; continue; }
    if (inSingle || inDouble) continue;

    if (ch === '$' && source[i + 1] === '(') {
      let depth = 1;
      let skipInSingle = false;
      let skipInDouble = false;
      i += 2;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !skipInSingle) { i += 2; continue; }
        if (inner === "'" && !skipInDouble && innerPrev !== '\\') skipInSingle = !skipInSingle;
        else if (inner === '"' && !skipInSingle && innerPrev !== '\\') skipInDouble = !skipInDouble;
        else if (!skipInSingle && !skipInDouble) {
          if (inner === '(') depth += 1;
          else if (inner === ')') depth -= 1;
        }
        i += 1;
      }
      i -= 1;
      continue;
    }

    if (ch === '`') {
      i += 1;
      while (i < source.length && source[i] !== '`') {
        if (source[i] === '\\' && i + 1 < source.length) { i += 2; continue; }
        i += 1;
      }
      continue;
    }

    if (ch === '(') {
      let depth = 1;
      let body = '';
      let bodyInSingle = false;
      let bodyInDouble = false;
      i += 1;
      while (i < source.length && depth > 0) {
        const inner = source[i];
        const innerPrev = source[i - 1];
        if (inner === '\\' && !bodyInSingle) {
          body += inner;
          if (i + 1 < source.length) { body += source[i + 1]; i += 2; continue; }
        }
        if (inner === "'" && !bodyInDouble && innerPrev !== '\\') bodyInSingle = !bodyInSingle;
        else if (inner === '"' && !bodyInSingle && innerPrev !== '\\') bodyInDouble = !bodyInDouble;
        else if (!bodyInSingle && !bodyInDouble) {
          if (inner === '(') depth += 1;
          else if (inner === ')') { depth -= 1; if (depth === 0) break; }
        }
        body += inner;
        i += 1;
      }
      if (body.trim()) {
        groups.push(body);
        groups.push(...extractSubshellGroups(body));
      }
    }
  }
  return groups;
}

// ── Ported from ECC pre-bash-dev-server-block.js ─────────────────

const DEV_COMMAND_WORDS = new Set(['npm', 'pnpm', 'yarn', 'bun', 'npx', 'tmux']);
const SKIPPABLE_PREFIX_WORDS = new Set(['env', 'command', 'builtin', 'exec', 'noglob', 'sudo', 'nohup']);
const PREFIX_OPTION_VALUE_WORDS = {
  env: new Set(['-u', '-C', '-S', '--unset', '--chdir', '--split-string']),
  sudo: new Set(['-u', '-g', '-h', '-p', '-r', '-t', '-C', '--user', '--group', '--host', '--prompt', '--role', '--type', '--close-from']),
};

const DEV_PATTERN = /\b(npm\s+run\s+(dev|start)|pnpm\s+(run\s+)?(dev|start)|yarn\s+(run\s+)?(dev|start)|bun\s+(run\s+)?(dev|start))\b/;
const TMUX_LAUNCHER = /^\s*tmux\s+(new|new-session|new-window|split-window)\b/;

function readToken(input, startIndex) {
  let index = startIndex;
  while (index < input.length && /\s/.test(input[index])) index += 1;
  if (index >= input.length) return null;

  let token = '';
  let quote = null;

  while (index < input.length) {
    const ch = input[index];
    if (quote) {
      if (ch === quote) { quote = null; index += 1; continue; }
      if (ch === '\\' && quote === '"' && index + 1 < input.length) {
        token += input[index + 1]; index += 2; continue;
      }
      token += ch; index += 1; continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; index += 1; continue; }
    if (/\s/.test(ch)) break;
    if (ch === '\\' && index + 1 < input.length) { token += input[index + 1]; index += 2; continue; }
    token += ch; index += 1;
  }
  return { token, end: index };
}

function shouldSkipOptionValue(wrapper, optionToken) {
  if (!wrapper || !optionToken || optionToken.includes('=')) return false;
  const optionSet = PREFIX_OPTION_VALUE_WORDS[wrapper];
  return Boolean(optionSet && optionSet.has(optionToken));
}

function isOptionToken(token) {
  return token.startsWith('-') && token.length > 1;
}

function normalizeCommandWord(token) {
  if (!token) return '';
  const base = path.basename(token).toLowerCase();
  return base.replace(/\.(cmd|exe|bat)$/i, '');
}

function getLeadingCommandWord(segment) {
  let index = 0;
  let activeWrapper = null;
  let skipNextValue = false;

  while (index < segment.length) {
    const parsed = readToken(segment, index);
    if (!parsed) return null;
    index = parsed.end;
    const token = parsed.token;
    if (!token) continue;
    if (skipNextValue) { skipNextValue = false; continue; }
    if (token === '--') { activeWrapper = null; continue; }
    if (token === '{' || token === '}') continue;
    if (/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token)) continue;

    const normalizedToken = normalizeCommandWord(token);
    if (SKIPPABLE_PREFIX_WORDS.has(normalizedToken)) { activeWrapper = normalizedToken; continue; }
    if (activeWrapper && isOptionToken(token)) {
      if (shouldSkipOptionValue(activeWrapper, token)) skipNextValue = true;
      continue;
    }
    return normalizedToken;
  }
  return null;
}

function collectCheckSegments(cmd) {
  const segments = [...splitShellSegments(cmd)];
  const queue = [cmd];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);

    for (const body of extractCommandSubstitutions(current)) {
      for (const seg of splitShellSegments(body)) segments.push(seg);
      queue.push(body);
    }
    for (const body of extractSubshellGroups(current)) {
      for (const seg of splitShellSegments(body)) segments.push(seg);
      queue.push(body);
    }
  }
  return segments;
}

function isBlockedDevSegment(segment) {
  const commandWord = getLeadingCommandWord(segment);
  if (!commandWord || !DEV_COMMAND_WORDS.has(commandWord)) return false;
  return DEV_PATTERN.test(segment) && !TMUX_LAUNCHER.test(segment);
}

// ── stdin entry point ────────────────────────────────────────────

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    raw += chunk.substring(0, MAX_STDIN - raw.length);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const cmd = String(input.tool_input?.command || '');

    const segments = collectCheckSegments(cmd);
    const hasBlockedDev = segments.some(isBlockedDevSegment);

    if (hasBlockedDev) {
      process.stderr.write(
        'BLOCKED: Dev server must run in tmux to keep terminal available.\n' +
        'Use: tmux new-session -d -s dev "npm run dev"\n' +
        'Then: tmux attach -t dev\n'
      );
      process.exit(2);
    }
  } catch {
    // parse error — pass through
  }

  process.stdout.write(raw);
});
