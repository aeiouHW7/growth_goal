# ace-init-env

## 描述

初始化 ACE Engine 开发环境，**自动检查并安装**必要的工具。

**核心能力**:
- ✅ 自动检测操作系统（macOS/Ubuntu/CentOS）
- ✅ 检查 Node.js (>= 18.0.0)、Docker、Git
- ✅ **自动安装缺失的工具**
- ✅ 跨平台支持（brew/apt/yum）

**区别于手动指引**: 本 Skill 不仅检查环境，还能**自动安装**缺失的工具，无需用户手动操作。

## 触发场景

**重要**: 这是 AI 调用的 Skill，不是用户在终端输入的命令。

用户对 AI（Claude Code/Cursor）说：
- "初始化开发环境"
- "帮我配置环境"
- "检查我的环境"
- "我是新电脑，第一次使用"
- "Initialize environment"
- "Check my development environment"

AI 会自动调用此 Skill，用户无需手动输入任何命令。

## 执行流程

1. 检测操作系统和包管理器：
   - macOS → Homebrew
   - Ubuntu/Debian → apt
   - CentOS/RHEL → yum

2. 检查必备工具：
   - Node.js >= 18.0.0
   - Docker（及其运行状态）
   - Git

3. **自动安装缺失的工具**：
   - Git 缺失 → `brew/apt/yum install git`
   - Node.js 缺失 → 使用 NodeSource 仓库安装 Node 20
   - Docker 缺失 → 使用官方脚本安装（Linux）或提示下载（macOS）

4. 输出环境状态报告

**注意**: macOS 需要手动安装 Docker Desktop，脚本会提供下载链接。

## 使用方式

**AI 自动调用**（用户不需要手动执行）:
```bash
# 检查并自动安装（默认）
node skills/system/ace-init-env/executor.mjs

# 仅检查，不安装
node skills/system/ace-init-env/executor.mjs --check-only

# 强制重新安装
node skills/system/ace-init-env/executor.mjs --install
```

当用户对 AI 说 "初始化环境" 时，AI 会自动执行上述命令。

## 示例输出

### 场景 1: 环境已就绪

```
🔍 检查开发环境...
   系统: macOS (brew)

【必备工具】
✅ Node.js: v22.22.2
✅ Docker: 29.4.1 (运行中)
✅ Git: 2.50.1

✅ 环境就绪！可以开始创建项目。
```

### 场景 2: 缺失 Node.js，自动安装

```
🔍 检查开发环境...
   系统: Ubuntu/Debian (apt)

【必备工具】
❌ Node.js: 未安装
✅ Docker: 24.0.0 (运行中)
✅ Git: 2.40.0

❌ 环境未就绪

🚀 开始自动安装缺失的工具...

📦 安装 Node.js...
   使用 NodeSource 仓库安装 Node.js 20...
   ✅ Node.js 安装完成

✅ 安装完成！重新检查环境...

🔍 检查开发环境...
   系统: Ubuntu/Debian (apt)

【必备工具】
✅ Node.js: v20.11.0
✅ Docker: 24.0.0 (运行中)
✅ Git: 2.40.0

✅ 环境就绪！可以开始创建项目。
```

### 场景 3: macOS 需要手动安装 Docker

```
🔍 检查开发环境...
   系统: macOS (brew)

【必备工具】
✅ Node.js: v20.11.0
❌ Docker: 未安装
✅ Git: 2.50.1

❌ 环境未就绪

🚀 开始自动安装缺失的工具...

📦 安装 Docker...
   macOS 需要手动下载 Docker Desktop
   下载地址: https://www.docker.com/products/docker-desktop/
   安装后请重新运行此脚本
```
