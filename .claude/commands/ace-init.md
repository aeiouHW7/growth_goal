# ace-init

在 `domains/` 下创建新项目，生成标准目录结构和 domain.yaml。

## 用法

```
/ace-init <project-name>
```

## 执行流程

### Step 1: 收集项目信息

向用户询问（一次一问，给推荐选项）：

1. **项目描述** — 一句话说明项目做什么
2. **技术栈** — 前端 / 后端 / 数据库各用什么（推荐：react-ts / node-ts-prisma / postgresql）
3. **是否需要 Docker** — 默认 yes

不需要的信息跳过，用默认值。

### Step 2: 创建目录结构

```bash
PROJECT_DIR="domains/{project-name}"

mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/docs/wiki"
mkdir -p "$PROJECT_DIR/planning/v0.1"
mkdir -p "$PROJECT_DIR/openspec/changes"
mkdir -p "$PROJECT_DIR/openspec/archive"
mkdir -p "$PROJECT_DIR/.claude/state"
```

### Step 3: 生成 domain.yaml

根据用户回答填充模板：

```yaml
name: {project-name}
description: {用户输入的描述}
version: 0.1.0

tech_stack:
  frontend: {用户选择}
  backend: {用户选择}
  database: {用户选择}

scripts:
  dev: "{根据技术栈生成}"
  test: "{根据技术栈生成}"
  build: "{根据技术栈生成}"

coding_standards:
  backend:
    - "{根据技术栈生成通用规范}"
  frontend:
    - "{根据技术栈生成通用规范}"

testing:
  unit_test_coverage: 80
  e2e_test_required: false
  test_framework: "{根据技术栈选择}"
  test_commands:
    unit: "{根据技术栈生成}"

knowledge:
  always_load:
    - path: docs/wiki/index.md
      desc: 项目知识库导航入口
  on_demand:
    - path: docs/wiki/
      trigger: "涉及项目知识、技术方案、业务规则时"

planning:
  current_version: v0.1
```

### Step 4: 生成知识库骨架

写入 `docs/wiki/index.md`：

```markdown
# {project-name} 知识库

> 由 ACE workflow 自动维护。archiver 归档时写入知识，retro 复盘时沉淀模式。

## 页面导航

（暂无知识页面，完成第一个变更归档后自动生成）

## 模式与最佳实践

- [patterns.md](patterns.md) — 技术模式与最佳实践（待创建）
```

### Step 5: 生成 openspec config

写入 `openspec/config.yaml`：

```yaml
version: "1.0"
change_dir: changes
archive_dir: archive
```

### Step 6: 调用 ace-generate

在项目目录下运行 `/ace-generate` 生成 CLAUDE.md。

### Step 7: 可选 — 生成 Docker 环境

如果用户选择需要 Docker，根据技术栈生成：
- `docker-compose.yml`
- `start.sh`（一键启动脚本）
- `.env`（环境变量模板）

### Step 8: 输出摘要

```
✓ 项目 {project-name} 创建完成

目录结构：
  domains/{project-name}/
  ├── domain.yaml          ← 项目配置
  ├── CLAUDE.md            ← AI 协作指令（已生成）
  ├── openspec/            ← 变更追踪
  ├── docs/wiki/index.md   ← 知识库
  └── planning/v0.1/       ← 版本规划

下一步：
  cd domains/{project-name}
  告诉我你想做什么功能，我会走 ACE 工作流帮你实现。
```
