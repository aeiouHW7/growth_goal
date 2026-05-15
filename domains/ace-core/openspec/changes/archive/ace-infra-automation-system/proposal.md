## Why

ACE Engine 目前虽然有了基础的变更管理底座，但仍缺乏类似原 `ai-drive-engine` 的“一键环境部署”和“全自动交付流”能力。本变更旨在通过“声明式环境”和“自愈式 Skill”，补齐 ACE 的自动化拼图，实现从需求到本地运行环境的完整闭环。

<!-- Dialectical Analysis -->
### 方案对比 (Dialectical Analysis)
- **方案 A: 沿用原有的 Shell 脚本堆砌 (`local-dev.sh`)**
  - *利*: 逻辑直接，针对性强。
  - *弊*: 跨项目复用极差，维护成本高，AI 难以通过参数动态控制。
- **方案 B (ACE 推荐): 声明式架构 + 自适应巡检 (Adaptable Infra)**
  - *利*: 极简配置（`domain.yaml`），引擎自动匹配 Skill，具备环境自愈能力（Doctor）。
  - *弊*: 初次构建引擎 Skill 的工作量较大。
- **决策**: 选择方案 B。通过构建 `ace-infra` 和 `ace-doctor` 两个核心 Skill，实现“把复杂留给引擎，把简单留给用户”。

## What Changes

1.  **基础设施自动化 (Infra as Code)**: 开发 `ace-infra` 技能，支持读取 `domain.yaml` 的 `infrastructure` 声明并拉起 Docker 环境。
2.  **环境诊断与自愈 (Self-Healing)**: 开发 `ace-doctor` 技能，实现对端口、连通性、配置的自动巡检。
3.  **全流程引导 (Autopilot)**: 实现 `ace-flow` 技能，串联 OpenSpec 各个阶段，引导非技术人员完成交付。
4.  **配置同步 (Config Sync)**: 实现自动导入 Nacos 或 DB 初始配置的机制。

## Capabilities

### New Capabilities
- `ace-infra-manager`: 声明式基础设施拉起与停止。
- `ace-env-doctor`: 环境健康度实时诊断。
- `ace-flow-guide`: 引导式开发全流程闭环。

## Impact

- **Affected Path**: `skills/common/`, `domains/ace-core/`, `rules/`。
- **Dependencies**: 需安装 Docker & Docker-Compose。
