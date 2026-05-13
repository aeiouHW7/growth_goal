#!/usr/bin/env node

/**
 * ACE Create Project Executor
 * 从模板自动生成完整的 Domain 项目
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 简单的颜色输出（无需外部依赖）
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function color(text, colorCode) {
  return `${colorCode}${text}${colors.reset}`;
}

/**
 * 验证项目名称
 */
function validateProjectName(name) {
  const regex = /^[a-z0-9-]+$/;
  if (!regex.test(name)) {
    console.error(color('❌ 项目名称只能包含小写字母、数字和连字符', colors.red));
    console.error(color('   示例: my-app, todo-app, user-service', colors.yellow));
    return false;
  }
  return true;
}

/**
 * 扫描现有项目使用的端口
 */
function scanExistingPorts() {
  const domainsDir = path.join(__dirname, '../../../domains');
  const ports = [5432]; // 默认端口

  if (!fs.existsSync(domainsDir)) {
    return ports;
  }

  const projects = fs.readdirSync(domainsDir);

  for (const project of projects) {
    const envPath = path.join(domainsDir, project, 'backend', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/DB_PORT=(\d+)/);
      if (match) {
        ports.push(parseInt(match[1]));
      }
    }
  }

  return ports;
}

/**
 * 分配下一个可用端口
 */
function allocatePort() {
  const existingPorts = scanExistingPorts();
  return Math.max(...existingPorts) + 1;
}

/**
 * 复制目录
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 替换文件中的占位符
 */
function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 生成项目标题（首字母大写）
 */
function generateProjectTitle(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 主函数
 */
function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error(color('❌ 缺少项目名称', colors.red));
    console.error(color('\n用法: node executor.mjs <project-name>', colors.yellow));
    console.error(color('示例: node executor.mjs my-app', colors.yellow));
    process.exit(1);
  }

  if (!validateProjectName(projectName)) {
    process.exit(1);
  }

  console.log(color(`\n🚀 创建项目: ${projectName}\n`, colors.cyan));

  // 路径定义
  const templateDir = path.join(__dirname, '../../../templates/domain-react-ts');
  const domainsDir = path.join(__dirname, '../../../domains');
  const projectDir = path.join(domainsDir, projectName);

  // 检查项目是否已存在
  if (fs.existsSync(projectDir)) {
    console.error(color(`❌ 项目已存在: domains/${projectName}`, colors.red));
    process.exit(1);
  }

  // 检查模板是否存在
  if (!fs.existsSync(templateDir)) {
    console.error(color(`❌ 模板不存在: templates/domain-react-ts`, colors.red));
    process.exit(1);
  }

  // 分配端口
  const dbPort = allocatePort();
  const projectTitle = generateProjectTitle(projectName);

  console.log(color(`   项目名: ${projectName}`, colors.gray));
  console.log(color(`   标题: ${projectTitle}`, colors.gray));
  console.log(color(`   数据库端口: ${dbPort}\n`, colors.gray));

  // 复制模板
  console.log(color('1️⃣ 复制模板...', colors.blue));

  // 创建基础目录结构
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, '10_DOCS', 'business'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, '10_DOCS', 'technical'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, '10_DOCS', 'api'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, '90_PLANNING'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'frontend'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'backend'), { recursive: true });

  console.log(color('   ✅ 目录结构创建完成', colors.green));

  // 替换配置
  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{PROJECT_TITLE}}': projectTitle,
    '{{OWNER}}': 'ACE Team',
    '{{DB_PORT}}': dbPort.toString()
  };

  // 处理 domain.yaml
  console.log(color('\n2️⃣ 配置 domain.yaml...', colors.blue));
  const domainYamlSrc = path.join(templateDir, 'domain.yaml.template');
  const domainYamlDest = path.join(projectDir, 'domain.yaml');

  if (fs.existsSync(domainYamlSrc)) {
    fs.copyFileSync(domainYamlSrc, domainYamlDest);
    replaceInFile(domainYamlDest, replacements);
    console.log(color('   ✅ domain.yaml 配置完成', colors.green));
  }

  // 处理 docker-compose.yml
  console.log(color('\n3️⃣ 生成 docker-compose.yml...', colors.blue));
  const dockerComposeSrc = path.join(templateDir, 'docker-compose.yml.template');
  const dockerComposeDest = path.join(projectDir, 'docker-compose.yml');

  if (fs.existsSync(dockerComposeSrc)) {
    fs.copyFileSync(dockerComposeSrc, dockerComposeDest);
    replaceInFile(dockerComposeDest, replacements);
    console.log(color('   ✅ docker-compose.yml 生成完成', colors.green));
  }

  // 处理 start.sh
  console.log(color('\n4️⃣ 生成 start.sh...', colors.blue));
  const startShSrc = path.join(templateDir, 'start.sh.template');
  const startShDest = path.join(projectDir, 'start.sh');

  if (fs.existsSync(startShSrc)) {
    fs.copyFileSync(startShSrc, startShDest);
    replaceInFile(startShDest, replacements);
    fs.chmodSync(startShDest, '755'); // 添加执行权限
    console.log(color('   ✅ start.sh 生成完成', colors.green));
  }

  // 生成 .env
  console.log(color('\n5️⃣ 生成 .env...', colors.blue));
  const envSrc = path.join(templateDir, '.env.template');
  const envDest = path.join(projectDir, 'backend', '.env');

  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
    replaceInFile(envDest, replacements);
    console.log(color('   ✅ backend/.env 生成完成', colors.green));
  }

  // 创建 README
  const readmeContent = `# ${projectTitle}

基于 ACE Engine 创建的全栈应用项目。

## 技术栈

- **后端**: Node.js + Express + TypeScript + Prisma
- **前端**: React 18 + TypeScript + Vite
- **数据库**: PostgreSQL 15

## 快速开始

\`\`\`bash
# 一键启动
./start.sh

# 然后分别启动前后端（需要两个终端）
cd backend && npm run dev
cd frontend && npm run dev
\`\`\`

访问 http://localhost:5173

## 数据库

- 端口: ${dbPort}
- 数据库名: ${projectName}_db
- 用户名: ${projectName}_user

## 目录结构

\`\`\`
${projectName}/
├── 10_DOCS/          # 文档
├── frontend/         # React 前端
├── backend/          # Node.js 后端
├── 90_PLANNING/      # 规划文档
├── domain.yaml       # 项目配置
├── docker-compose.yml # Docker 服务
└── start.sh          # 启动脚本
\`\`\`
`;

  fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent, 'utf-8');

  // 完成
  console.log(color('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green + colors.bold));
  console.log(color('✅ 项目创建成功！', colors.green + colors.bold));
  console.log(color('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.green + colors.bold));

  console.log(color('📂 位置:', colors.cyan), `domains/${projectName}`);
  console.log(color('📝 数据库端口:', colors.cyan), dbPort);
  console.log('');
  console.log(color('📌 下一步:', colors.bold));
  console.log(color(`  1. cd domains/${projectName}`, colors.yellow));
  console.log(color('  2. 添加前后端代码（或从模板复制）', colors.yellow));
  console.log(color('  3. ./start.sh', colors.yellow));
  console.log('');
  console.log(color('💡 提示: 你现在需要手动添加 frontend 和 backend 的代码', colors.gray));
  console.log(color('   可以参考 domains/todo-app 的结构\n', colors.gray));
}

main();
