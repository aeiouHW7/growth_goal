#!/usr/bin/env node

/**
 * ACE Init Environment Executor (Enhanced)
 * 检查并自动安装开发环境的必备工具
 *
 * 用法:
 *   node executor.mjs              # 检查并安装
 *   node executor.mjs --check-only # 仅检查，不安装
 *   node executor.mjs --install    # 强制安装（覆盖已存在的）
 */

import { execSync, spawnSync } from 'child_process';
import os from 'os';
import fs from 'fs';

// 简单的颜色输出
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function color(text, colorCode) {
  return `${colorCode}${text}${colors.reset}`;
}

/**
 * 执行命令并返回结果
 */
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'pipe',
      ...options
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

/**
 * 检测操作系统和包管理器
 */
function detectOS() {
  const platform = os.platform();

  if (platform === 'darwin') {
    return { os: 'macos', pkg: 'brew', label: 'macOS' };
  } else if (platform === 'linux') {
    // 检查发行版
    if (fs.existsSync('/etc/os-release')) {
      const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
      if (osRelease.includes('ubuntu') || osRelease.includes('debian')) {
        return { os: 'debian', pkg: 'apt', label: 'Ubuntu/Debian' };
      } else if (osRelease.includes('centos') || osRelease.includes('rhel')) {
        return { os: 'rhel', pkg: 'yum', label: 'CentOS/RHEL' };
      }
    }
    return { os: 'linux', pkg: 'unknown', label: 'Linux' };
  } else if (platform === 'win32') {
    return { os: 'windows', pkg: 'choco', label: 'Windows' };
  }

  return { os: 'unknown', pkg: 'unknown', label: 'Unknown' };
}

/**
 * 检查 Node.js 版本
 */
function checkNode() {
  const result = runCommand('node --version', { silent: true });
  if (!result.success) {
    return { installed: false };
  }

  const version = result.output.replace('v', '');
  const major = parseInt(version.split('.')[0]);

  return {
    installed: true,
    version: result.output,
    valid: major >= 18,
    requiredVersion: '18.0.0'
  };
}

/**
 * 检查 Docker
 */
function checkDocker() {
  const versionResult = runCommand('docker --version', { silent: true });
  if (!versionResult.success) {
    return { installed: false };
  }

  const psResult = runCommand('docker ps', { silent: true });

  return {
    installed: true,
    version: versionResult.output.match(/Docker version ([\d.]+)/)?.[1] || versionResult.output,
    running: psResult.success
  };
}

/**
 * 检查 Git
 */
function checkGit() {
  const result = runCommand('git --version', { silent: true });
  if (!result.success) {
    return { installed: false };
  }

  return {
    installed: true,
    version: result.output.match(/git version ([\d.]+)/)?.[1] || result.output
  };
}

/**
 * 安装 Homebrew (macOS)
 */
function installHomebrew() {
  console.log(color('\n📦 安装 Homebrew...', colors.blue));

  const result = runCommand(
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    { stdio: 'inherit' }
  );

  if (result.success) {
    console.log(color('   ✅ Homebrew 安装完成', colors.green));
    return true;
  } else {
    console.log(color('   ❌ Homebrew 安装失败', colors.red));
    return false;
  }
}

/**
 * 安装 Node.js
 */
function installNode(osInfo) {
  console.log(color('\n📦 安装 Node.js...', colors.blue));

  if (osInfo.pkg === 'brew') {
    const result = runCommand('brew install node@20', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Node.js 安装完成', colors.green));
      return true;
    }
  } else if (osInfo.pkg === 'apt') {
    console.log(color('   使用 NodeSource 仓库安装 Node.js 20...', colors.blue));
    runCommand('curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -', { stdio: 'inherit' });
    const result = runCommand('sudo apt-get install -y nodejs', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Node.js 安装完成', colors.green));
      return true;
    }
  } else if (osInfo.pkg === 'yum') {
    console.log(color('   使用 NodeSource 仓库安装 Node.js 20...', colors.blue));
    runCommand('curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -', { stdio: 'inherit' });
    const result = runCommand('sudo yum install -y nodejs', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Node.js 安装完成', colors.green));
      return true;
    }
  }

  console.log(color('   ❌ Node.js 安装失败，请手动安装', colors.red));
  return false;
}

/**
 * 安装 Docker
 */
function installDocker(osInfo) {
  console.log(color('\n📦 安装 Docker...', colors.blue));

  if (osInfo.os === 'macos') {
    console.log(color('   macOS 需要手动下载 Docker Desktop', colors.yellow));
    console.log(color('   下载地址: https://www.docker.com/products/docker-desktop/', colors.yellow));
    console.log(color('   安装后请重新运行此脚本', colors.yellow));
    return false;
  } else if (osInfo.pkg === 'apt') {
    console.log(color('   使用官方脚本安装 Docker...', colors.blue));
    const result = runCommand('curl -fsSL https://get.docker.com | sudo sh', { stdio: 'inherit' });
    if (result.success) {
      runCommand('sudo systemctl enable docker', { silent: true });
      runCommand('sudo systemctl start docker', { silent: true });
      // 添加用户到 docker 组
      const user = os.userInfo().username;
      runCommand(`sudo usermod -aG docker ${user}`, { silent: true });
      console.log(color('   ✅ Docker 安装完成', colors.green));
      console.log(color(`   ⚠️  已将 ${user} 添加到 docker 组，需要重新登录终端生效`, colors.yellow));
      return true;
    }
  } else if (osInfo.pkg === 'yum') {
    console.log(color('   使用 yum 安装 Docker...', colors.blue));
    runCommand('sudo yum install -y yum-utils', { silent: true });
    runCommand('sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo', { silent: true });
    const result = runCommand('sudo yum install -y docker-ce docker-ce-cli containerd.io', { stdio: 'inherit' });
    if (result.success) {
      runCommand('sudo systemctl enable docker', { silent: true });
      runCommand('sudo systemctl start docker', { silent: true });
      const user = os.userInfo().username;
      runCommand(`sudo usermod -aG docker ${user}`, { silent: true });
      console.log(color('   ✅ Docker 安装完成', colors.green));
      console.log(color(`   ⚠️  已将 ${user} 添加到 docker 组，需要重新登录终端生效`, colors.yellow));
      return true;
    }
  }

  console.log(color('   ❌ Docker 安装失败，请手动安装', colors.red));
  return false;
}

/**
 * 安装 Git
 */
function installGit(osInfo) {
  console.log(color('\n📦 安装 Git...', colors.blue));

  if (osInfo.pkg === 'brew') {
    const result = runCommand('brew install git', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Git 安装完成', colors.green));
      return true;
    }
  } else if (osInfo.pkg === 'apt') {
    const result = runCommand('sudo apt-get update && sudo apt-get install -y git', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Git 安装完成', colors.green));
      return true;
    }
  } else if (osInfo.pkg === 'yum') {
    const result = runCommand('sudo yum install -y git', { stdio: 'inherit' });
    if (result.success) {
      console.log(color('   ✅ Git 安装完成', colors.green));
      return true;
    }
  }

  console.log(color('   ❌ Git 安装失败，请手动安装', colors.red));
  return false;
}

/**
 * 输出环境检查报告
 */
function printReport(checks, osInfo) {
  console.log(color('\n🔍 检查开发环境...', colors.cyan));
  console.log(color(`   系统: ${osInfo.label} (${osInfo.pkg})`, colors.blue));
  console.log('');
  console.log(color('【必备工具】', colors.bold));

  // Node.js
  if (checks.node.installed) {
    if (checks.node.valid) {
      console.log(color(`✅ Node.js: ${checks.node.version}`, colors.green));
    } else {
      console.log(color(`❌ Node.js: ${checks.node.version} (需要 >= ${checks.node.requiredVersion})`, colors.red));
    }
  } else {
    console.log(color('❌ Node.js: 未安装', colors.red));
  }

  // Docker
  if (checks.docker.installed) {
    if (checks.docker.running) {
      console.log(color(`✅ Docker: ${checks.docker.version} (运行中)`, colors.green));
    } else {
      console.log(color(`⚠️  Docker: ${checks.docker.version} (未运行，请启动 Docker Desktop)`, colors.yellow));
    }
  } else {
    console.log(color('❌ Docker: 未安装', colors.red));
  }

  // Git
  if (checks.git.installed) {
    console.log(color(`✅ Git: ${checks.git.version}`, colors.green));
  } else {
    console.log(color('❌ Git: 未安装', colors.red));
  }

  console.log('');

  // 判断是否就绪
  const allReady = checks.node.installed && checks.node.valid &&
                   checks.docker.installed && checks.docker.running &&
                   checks.git.installed;

  if (allReady) {
    console.log(color('✅ 环境就绪！可以开始创建项目。\n', colors.green + colors.bold));
    return true;
  } else {
    console.log(color('❌ 环境未就绪\n', colors.red + colors.bold));
    return false;
  }
}

/**
 * 自动安装缺失的工具
 */
async function autoInstall(checks, osInfo) {
  console.log(color('\n🚀 开始自动安装缺失的工具...\n', colors.cyan + colors.bold));

  let anyInstalled = false;

  // 检查 Homebrew (macOS 必需)
  if (osInfo.os === 'macos' && osInfo.pkg === 'brew') {
    const brewCheck = runCommand('brew --version', { silent: true });
    if (!brewCheck.success) {
      console.log(color('⚠️  macOS 需要先安装 Homebrew', colors.yellow));
      const shouldInstall = true; // 在实际使用中可以询问用户
      if (shouldInstall && installHomebrew()) {
        anyInstalled = true;
      }
    }
  }

  // 安装 Git
  if (!checks.git.installed) {
    if (installGit(osInfo)) {
      anyInstalled = true;
    }
  }

  // 安装 Node.js
  if (!checks.node.installed || !checks.node.valid) {
    if (installNode(osInfo)) {
      anyInstalled = true;
    }
  }

  // 安装 Docker
  if (!checks.docker.installed) {
    if (installDocker(osInfo)) {
      anyInstalled = true;
    }
  }

  if (anyInstalled) {
    console.log(color('\n✅ 安装完成！重新检查环境...\n', colors.green + colors.bold));
    return true;
  } else {
    console.log(color('\n⚠️  没有成功安装任何工具\n', colors.yellow));
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');
  const forceInstall = args.includes('--install');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法: node executor.mjs [OPTIONS]');
    console.log('');
    console.log('选项:');
    console.log('  (无参数)       检查环境，如有缺失则自动安装');
    console.log('  --check-only   仅检查，不安装');
    console.log('  --install      强制重新安装所有工具');
    console.log('  --help, -h     显示帮助');
    process.exit(0);
  }

  // 检测操作系统
  const osInfo = detectOS();

  if (osInfo.os === 'unknown') {
    console.error(color('❌ 不支持的操作系统', colors.red));
    process.exit(1);
  }

  // 首次检查
  let checks = {
    node: checkNode(),
    docker: checkDocker(),
    git: checkGit()
  };

  const firstCheck = printReport(checks, osInfo);

  if (checkOnly) {
    process.exit(firstCheck ? 0 : 1);
  }

  // 如果环境未就绪，自动安装
  if (!firstCheck || forceInstall) {
    const installed = await autoInstall(checks, osInfo);

    if (installed) {
      // 重新检查
      checks = {
        node: checkNode(),
        docker: checkDocker(),
        git: checkGit()
      };

      const secondCheck = printReport(checks, osInfo);
      process.exit(secondCheck ? 0 : 1);
    } else {
      console.log(color('请手动安装缺失的工具后重新运行此脚本', colors.yellow));
      process.exit(1);
    }
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error(color(`错误: ${err.message}`, colors.red));
  process.exit(1);
});
