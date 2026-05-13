#!/usr/bin/env node

/**
 * ACE Doctor - 环境健康检查与依赖诊断
 *
 * 职责：
 * 1. 检查开发环境基础依赖（Node.js、Docker、Git）
 * 2. 检查运行时容器状态
 * 3. 检查端口占用
 * 4. 对于缺失的工具，给出安装指引
 */

import { execSync } from 'node:child_process';
import { platform } from 'node:os';

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查命令是否存在
function checkCommand(command, friendlyName) {
  try {
    execSync(`command -v ${command}`, { stdio: 'pipe' });
    return { installed: true };
  } catch {
    return { installed: false };
  }
}

// 获取版本信息
function getVersion(command, args = '--version') {
  try {
    const version = execSync(`${command} ${args}`, { encoding: 'utf-8', stdio: 'pipe' })
      .trim()
      .split('\n')[0];
    return version;
  } catch {
    return 'unknown';
  }
}

// 安装指引
const installGuides = {
  node: {
    darwin: '访问 https://nodejs.org 下载安装包，或使用 Homebrew:\n      brew install node',
    linux: '使用包管理器安装:\n      sudo apt-get install nodejs npm  # Ubuntu/Debian\n      sudo yum install nodejs npm      # CentOS/RHEL',
    win32: '访问 https://nodejs.org 下载 Windows 安装包'
  },
  docker: {
    darwin: '下载 Docker Desktop for Mac:\n      https://www.docker.com/products/docker-desktop',
    linux: '访问 Docker 官网按照发行版安装:\n      https://docs.docker.com/engine/install/',
    win32: '下载 Docker Desktop for Windows:\n      https://www.docker.com/products/docker-desktop'
  },
  git: {
    darwin: '使用 Homebrew 安装:\n      brew install git\n      或使用 Xcode Command Line Tools:\n      xcode-select --install',
    linux: '使用包管理器安装:\n      sudo apt-get install git  # Ubuntu/Debian\n      sudo yum install git      # CentOS/RHEL',
    win32: '下载 Git for Windows:\n      https://git-scm.com/download/win'
  }
};

async function checkHealth() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║  📋 ACE Environment Health Check     ║', 'cyan');
  log('╚════════════════════════════════════════╝\n', 'cyan');

  const issues = [];
  const os = platform();

  // ============================================
  // 1. 基础工具检查
  // ============================================
  log('【1/5】基础开发工具', 'bright');
  log('─────────────────────────────────────────', 'cyan');

  // Node.js
  const nodeCheck = checkCommand('node', 'Node.js');
  if (nodeCheck.installed) {
    const version = getVersion('node', '--version');
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);

    if (majorVersion >= 18) {
      log(`✅ Node.js: ${version} (满足要求 ≥18.0.0)`, 'green');
    } else {
      log(`⚠️  Node.js: ${version} (建议升级到 ≥18.0.0)`, 'yellow');
      issues.push({
        level: 'warning',
        tool: 'Node.js',
        message: '版本过低，建议升级',
        guide: installGuides.node[os]
      });
    }
  } else {
    log('❌ Node.js: 未安装', 'red');
    issues.push({
      level: 'error',
      tool: 'Node.js',
      message: '未安装（必需）',
      guide: installGuides.node[os]
    });
  }

  // npm
  const npmCheck = checkCommand('npm', 'npm');
  if (npmCheck.installed) {
    const version = getVersion('npm', '--version');
    log(`✅ npm: ${version}`, 'green');
  } else {
    log('❌ npm: 未安装', 'red');
  }

  // Git
  const gitCheck = checkCommand('git', 'Git');
  if (gitCheck.installed) {
    const version = getVersion('git', '--version');
    log(`✅ Git: ${version}`, 'green');
  } else {
    log('❌ Git: 未安装', 'red');
    issues.push({
      level: 'error',
      tool: 'Git',
      message: '未安装（必需）',
      guide: installGuides.git[os]
    });
  }

  // ============================================
  // 2. Docker 环境检查
  // ============================================
  log('\n【2/5】Docker 环境', 'bright');
  log('─────────────────────────────────────────', 'cyan');

  const dockerCheck = checkCommand('docker', 'Docker');
  if (dockerCheck.installed) {
    const version = getVersion('docker', '--version');
    log(`✅ Docker: ${version}`, 'green');

    // 检查 Docker 是否运行
    try {
      execSync('docker info', { stdio: 'pipe' });
      log('✅ Docker 服务: 运行中', 'green');
    } catch {
      log('❌ Docker 服务: 未启动', 'red');
      issues.push({
        level: 'error',
        tool: 'Docker',
        message: 'Docker 已安装但未运行',
        guide: os === 'darwin'
          ? '请启动 Docker Desktop 应用'
          : '运行: sudo systemctl start docker'
      });
    }

    // Docker Compose
    const composeCheck = checkCommand('docker-compose', 'Docker Compose');
    if (composeCheck.installed || dockerCheck.installed) {
      // Docker Desktop 内置 docker compose
      log('✅ Docker Compose: 可用', 'green');
    } else {
      log('⚠️  Docker Compose: 未找到', 'yellow');
    }
  } else {
    log('❌ Docker: 未安装', 'red');
    issues.push({
      level: 'error',
      tool: 'Docker',
      message: '未安装（必需）',
      guide: installGuides.docker[os]
    });
  }

  // ============================================
  // 3. 容器状态检查
  // ============================================
  log('\n【3/5】运行中的容器', 'bright');
  log('─────────────────────────────────────────', 'cyan');

  if (dockerCheck.installed) {
    try {
      const containers = execSync('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"',
        { encoding: 'utf-8', stdio: 'pipe' });

      if (containers.trim()) {
        log(containers, 'green');
      } else {
        log('📦 无运行中的容器', 'yellow');
        log('   提示: 运行 npm run ace:up 启动环境\n', 'cyan');
      }
    } catch {
      log('❌ 无法获取容器状态', 'red');
    }
  } else {
    log('⊘  跳过（Docker 未安装）', 'yellow');
  }

  // ============================================
  // 4. 端口检查
  // ============================================
  log('\n【4/5】端口占用检查', 'bright');
  log('─────────────────────────────────────────', 'cyan');

  const portsToCheck = [
    { port: 3306, service: 'MySQL' },
    { port: 6379, service: 'Redis' },
    { port: 8080, service: 'Backend API' },
    { port: 3000, service: 'Frontend Dev Server' }
  ];

  for (const { port, service } of portsToCheck) {
    try {
      const cmd = os === 'darwin' || os === 'linux'
        ? `lsof -i :${port} -sTCP:LISTEN`
        : `netstat -ano | findstr :${port}`;

      const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });

      if (result.trim()) {
        log(`⚠️  端口 ${port} (${service}): 已被占用`, 'yellow');
        // 显示占用进程（简化版）
        const lines = result.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          log(`   ${lines[0].substring(0, 80)}`, 'yellow');
        }
      } else {
        log(`✅ 端口 ${port} (${service}): 空闲`, 'green');
      }
    } catch {
      log(`✅ 端口 ${port} (${service}): 空闲`, 'green');
    }
  }

  // ============================================
  // 5. ACE 项目状态
  // ============================================
  log('\n【5/5】ACE 项目状态', 'bright');
  log('─────────────────────────────────────────', 'cyan');

  try {
    const { readFileSync, existsSync } = await import('node:fs');
    const { join } = await import('node:path');

    const activeConfigPath = join(process.cwd(), '.ace/active-domain.json');

    if (existsSync(activeConfigPath)) {
      const config = JSON.parse(readFileSync(activeConfigPath, 'utf-8'));
      log(`✅ Active Domain: ${config.activeDomain}`, 'green');
    } else {
      log('⚠️  Active Domain: 未设置', 'yellow');
      log('   提示: 运行 npm run ace:init 创建项目\n', 'cyan');
    }

    // 检查 package.json
    if (existsSync('package.json')) {
      log('✅ package.json: 存在', 'green');
    } else {
      log('⚠️  package.json: 未找到', 'yellow');
    }
  } catch (e) {
    log('⚠️  无法检查项目状态', 'yellow');
  }

  // ============================================
  // 问题汇总与建议
  // ============================================
  if (issues.length > 0) {
    log('\n╔════════════════════════════════════════╗', 'red');
    log('║  ⚠️  发现问题，需要处理               ║', 'red');
    log('╚════════════════════════════════════════╝\n', 'red');

    const errors = issues.filter(i => i.level === 'error');
    const warnings = issues.filter(i => i.level === 'warning');

    if (errors.length > 0) {
      log('【必须修复】', 'red');
      errors.forEach((issue, idx) => {
        log(`\n${idx + 1}. ${issue.tool}: ${issue.message}`, 'red');
        log(`   安装方法:`, 'cyan');
        log(`   ${issue.guide}`, 'yellow');
      });
    }

    if (warnings.length > 0) {
      log('\n【建议处理】', 'yellow');
      warnings.forEach((issue, idx) => {
        log(`\n${idx + 1}. ${issue.tool}: ${issue.message}`, 'yellow');
        if (issue.guide) {
          log(`   ${issue.guide}`, 'cyan');
        }
      });
    }

    process.exit(1);
  } else {
    log('\n╔════════════════════════════════════════╗', 'green');
    log('║  ✅ 环境检查通过！                   ║', 'green');
    log('╚════════════════════════════════════════╝\n', 'green');

    log('下一步操作:', 'cyan');
    log('  • 启动环境: npm run ace:up', 'bright');
    log('  • 查看状态: npm run ace:status', 'bright');
    log('  • 创建项目: npm run ace:init\n', 'bright');
  }
}

checkHealth();
