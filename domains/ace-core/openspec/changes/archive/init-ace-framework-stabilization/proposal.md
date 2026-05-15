## Why

ACE (AI Coding Engine) 需要从原有的私有、高度耦合的架构，演进为一套通用、可扩展且符合 OpenSpec 官方标准的 AI 协作引擎。本次变更旨在确立 ACE 2.0 的核心底座，确保引擎能够“既简洁、又全都要”。

<!-- Dialectical Analysis -->
### 方案对比 (Dialectical Analysis)
- **方案 A: 继承原 ai-drive-engine 架构**
  - *利*: 脚本丰富。
  - *弊*: 复杂度高，与特定公司业务深度绑定，难以开源和个人使用。
- **方案 B: 纯官方 OpenSpec 架构**
  - *利*: 标准化、生态好。
  - *弊*: 缺乏业务文档治理 (10_DOCS) 和环境自适应能力。
- **方案 C (ACE 2.0): 官方底座 + 动态领域隔离 + 资产注入**
  - *利*: 深度兼容官方规范的同时，保留了业务资产化和辩证思考的灵魂。

## What Changes

1.  **架构脱敏**：彻底剥离特定公司业务逻辑，建立通用的 `domains/` 工作空间。
2.  **双层混合配置**：根目录物理保留 `.claude`/`.cursor`，动态软链接 `openspec/`。
3.  **标准对齐**：全量镜像 OpenSpec 官方 `spec-driven` schema 及模板。
4.  **规范建立**：确立 `ETHOS.md`, `AGENTS.md` 及 `domain-init-protocol.md`。

## Capabilities

### New Capabilities
- `dynamic-domain-linking`: 根目录 `openspec/` 动态指向活跃领域的软链接机制。
- `asset-driven-docs`: 强制要求 `10_DOCS/` 与代码变更同步更新的规范。
- `dialectical-thinking-plugin`: 强制 AI 在提案中进行方案对比与风险对冲。

## Impact

- **Affected Path**: 根目录, `domains/ace-core/`, `rules/`, `skills/`。
- **Dependencies**: 需要全局安装 `openspec` CLI。
