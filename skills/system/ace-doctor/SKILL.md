# ace-doctor

## 描述

ACE Engine 环境健康检查与依赖诊断，**只检查不安装**。

**核心能力**:
- ✅ 检查基础开发工具（Node.js、npm、Git）
- ✅ 检查 Docker 环境及运行状态
- ✅ 检查运行中的容器
- ✅ 检查常见端口占用（3306、6379、8080、3000）
- ✅ 检查 ACE 项目配置状态
- ✅ 跨平台支持（macOS/Linux/Windows）
- ✅ 问题分类汇总（error/warning）及安装指引

**区别于 ace-init-env**: ace-doctor **只检查不安装**，适合快速诊断环境状态。
ace-init-env 在检查后还会自动安装缺失工具。

## 触发场景

用户对 AI（Claude Code/Cursor）说：
- "检查系统健康"
- "诊断环境"
- "看看环境有没有问题"
- "检查我的开发环境"
- "Health check"
- "What's wrong with my environment"

AI 会自动调用此 Skill。

## 执行流程

```bash
node skills/system/ace-doctor/executor.mjs
```

1. **基础工具检查** — Node.js (>= 18.0.0)、npm、Git
2. **Docker 环境** — Docker 安装状态、服务运行状态、Docker Compose 可用性
3. **运行容器** — `docker ps` 当前运行列表
4. **端口占用** — 检查 MySQL(3306)、Redis(6379)、Backend(8080)、Frontend(3000) 端口
5. **ACE 项目状态** — Active Domain 配置、package.json 存在性

## 输出格式

### 全部通过

```
╔════════════════════════════════════════╗
║  ✅ 环境检查通过！                   ║
╚════════════════════════════════════════╝
```

### 发现问题

```
╔════════════════════════════════════════╗
║  ⚠️  发现问题，需要处理               ║
╚════════════════════════════════════════╝

【必须修复】
1. Docker: 未安装（必需）
   安装方法:
   下载 Docker Desktop ...
```

## 使用方式

**AI 自动调用**（用户不需要手动执行）:

```bash
# 标准检查
node skills/system/ace-doctor/executor.mjs

# 仅检查特定项（由 AI 按需调用）
node skills/system/ace-doctor/executor.mjs --quick
```
