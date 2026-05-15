#!/usr/bin/env node
/**
 * PreToolUse Hook: Pre-commit Quality Check
 *
 * Runs quality checks before git commit commands:
 * - Checks staged files for console.log, debugger, secrets
 * - Validates commit message format (conventional commits)
 * - Runs linter on staged files if available
 *
 * Adapted from ECC pre-bash-commit-quality.js.
 *
 * Exit codes:
 *   0 = allow commit
 *   2 = block commit (critical issues found)
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MAX_STDIN = 1024 * 1024;

function getStagedFiles() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return [];
  return result.stdout.trim().split('\n').filter(f => f.length > 0);
}

function getStagedFileContent(filePath) {
  const result = spawnSync('git', ['show', `:${filePath}`], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

function shouldCheckFile(filePath) {
  const checkableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs'];
  return checkableExtensions.some(ext => filePath.endsWith(ext));
}

function findFileIssues(filePath) {
  const issues = [];
  try {
    const content = getStagedFileContent(filePath);
    if (content === null || content === undefined) return issues;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.includes('console.log') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        issues.push({ type: 'console.log', message: `console.log found at line ${lineNum}`, line: lineNum, severity: 'warning' });
      }

      if (/\bdebugger\b/.test(line) && !line.trim().startsWith('//')) {
        issues.push({ type: 'debugger', message: `debugger statement at line ${lineNum}`, line: lineNum, severity: 'error' });
      }

      const secretPatterns = [
        { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API key' },
        { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub PAT' },
        { pattern: /AKIA[A-Z0-9]{16}/, name: 'AWS Access Key' },
        { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i, name: 'API key' },
      ];

      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(line)) {
          issues.push({ type: 'secret', message: `Potential ${name} exposed at line ${lineNum}`, line: lineNum, severity: 'error' });
        }
      }
    });
  } catch {
    // file not readable — skip
  }
  return issues;
}

function validateCommitMessage(command) {
  const messageMatch = command.match(/(?:-m|--message)[=\s]+["']?([^"']+)["']?/);
  if (!messageMatch) return null;

  const message = messageMatch[1];
  const issues = [];

  const conventionalCommit = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?:\s*.+/;
  if (!conventionalCommit.test(message)) {
    issues.push({
      type: 'format',
      message: 'Commit message does not follow conventional commit format',
      suggestion: 'Use format: type(scope): description',
    });
  }

  if (message.length > 72) {
    issues.push({
      type: 'length',
      message: `Commit message too long (${message.length} chars, max 72)`,
    });
  }

  return { message, issues };
}

function runLinter(files) {
  const jsFiles = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
  const results = { eslint: null };

  if (jsFiles.length > 0) {
    const eslintBin = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
    if (fs.existsSync(eslintBin)) {
      const result = spawnSync(eslintBin, ['--format', 'compact', ...jsFiles], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      });
      results.eslint = { success: result.status === 0, output: result.stdout || result.stderr || '' };
    }
  }
  return results;
}

function evaluate(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const command = input.tool_input?.command || '';

    if (!command.includes('git commit')) return { output: rawInput, exitCode: 0 };
    if (command.includes('--amend')) return { output: rawInput, exitCode: 0 };

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      process.stderr.write('[Hook] No staged files found.\n');
      return { output: rawInput, exitCode: 0 };
    }

    process.stderr.write(`[Hook] Checking ${stagedFiles.length} staged file(s)...\n`);

    const filesToCheck = stagedFiles.filter(shouldCheckFile);
    let errorCount = 0;
    let warningCount = 0;

    for (const file of filesToCheck) {
      const fileIssues = findFileIssues(file);
      if (fileIssues.length > 0) {
        process.stderr.write(`\n[FILE] ${file}\n`);
        for (const issue of fileIssues) {
          const label = issue.severity === 'error' ? 'ERROR' : 'WARNING';
          process.stderr.write(`  ${label} Line ${issue.line}: ${issue.message}\n`);
          if (issue.severity === 'error') errorCount++;
          if (issue.severity === 'warning') warningCount++;
        }
      }
    }

    const messageValidation = validateCommitMessage(command);
    if (messageValidation && messageValidation.issues.length > 0) {
      process.stderr.write('\nCommit Message Issues:\n');
      for (const issue of messageValidation.issues) {
        process.stderr.write(`  WARNING ${issue.message}\n`);
        if (issue.suggestion) process.stderr.write(`     TIP ${issue.suggestion}\n`);
        warningCount++;
      }
    }

    const lintResults = runLinter(filesToCheck);
    if (lintResults.eslint && !lintResults.eslint.success) {
      process.stderr.write('\nESLint Issues:\n');
      process.stderr.write(lintResults.eslint.output + '\n');
      errorCount++;
    }

    if (errorCount > 0) {
      process.stderr.write(`\n[Hook] BLOCKED: ${errorCount} error(s), ${warningCount} warning(s). Fix errors before committing.\n`);
      return { output: rawInput, exitCode: 2 };
    } else if (warningCount > 0) {
      process.stderr.write(`\n[Hook] WARNING: ${warningCount} warning(s) found. Commit allowed.\n`);
    } else {
      process.stderr.write('\n[Hook] PASS: All checks passed!\n');
    }
  } catch (error) {
    process.stderr.write(`[Hook] Error: ${error.message}\n`);
  }

  return { output: rawInput, exitCode: 0 };
}

if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      data += chunk.substring(0, MAX_STDIN - data.length);
    }
  });

  process.stdin.on('end', () => {
    const result = evaluate(data);
    process.stdout.write(result.output);
    process.exit(result.exitCode);
  });
}
