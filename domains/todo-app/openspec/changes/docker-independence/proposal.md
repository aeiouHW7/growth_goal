## Why

当前架构下，所有子项目共享根目录的 Docker 服务，导致端口冲突、数据隔离不足，且不符合 Domain 独立性原则。同时，用户需要记忆多个命令行指令（`npm run ace:up`），与 AI-first 的设计理念相悖。我们需要重构为：子项目完全独立（包含自己的 Docker），用户仅通过对 AI 说话来操作根目录能力，终端仅用于子项目运行。

## What Changes

- **BREAKING**: 移除根目录的 `docker-compose.yml` 和 `npm run ace:up` 命令
- 为每个子项目模板添加独立的 `docker-compose.yml`，支持参数化（项目名、端口）
- 增强 `start.sh` 模板，自动检查并启动项目自己的 Docker 服务
- 实现 `ace-init-env` 和 `ace-create-project` 的 executor（AI 调用，非用户手动）
- 更新所有文档，明确 "对 AI 说话" vs "终端操作" 的边界
- 删除过时的 Skills（`ace-flow`, `ace-select`, `ace-sync`, `ace-infra`）

## Capabilities

### New Capabilities
- `docker-per-project`: 每个子项目拥有独立的 Docker Compose 配置，包含参数化的服务定义、端口管理、数据卷隔离
- `ai-invoked-skills`: Skills 通过 AI 语音/文本触发（如 "初始化环境"），而非用户在终端输入命令
- `auto-project-generation`: 通过 `ace-create-project` Skill 自动生成完整子项目（包含 Docker 配置、start.sh、domain.yaml）

### Modified Capabilities
- `project-startup`: start.sh 从依赖根目录 Docker 改为自主启动项目的 Docker 服务

## Impact

**代码影响**:
- 根目录: 删除 `docker-compose.yml`，清理 `package.json` 中的 `ace:up/down/restart` 脚本
- 模板: `templates/domain-react-ts/` 新增 `docker-compose.yml.template`，增强 `start.sh.template`
- Skills: 新增 `executor.mjs` 文件到 `ace-init-env/` 和 `ace-create-project/`

**用户影响**:
- **BREAKING**: 现有项目（如 `todo-app`）需要手动迁移 Docker 配置到项目目录
- 用户不再需要记忆任何根目录命令，所有初始化/创建操作通过对 AI 说话完成
- 新项目可独立分发（包含自己的 Docker），无需依赖根目录环境

**文档影响**:
- 根 `README.md`: 删除 "方式 3: 手动安装" 中的 `npm run ace:up` 步骤
- 各 Skill 的 `SKILL.md`: 添加 "触发场景"（用户对 AI 说的话）
- 新增 "交互模型" 说明文档（AI domain vs User domain）
