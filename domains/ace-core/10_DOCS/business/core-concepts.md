# 核心概念与术语

## 1. 域 (Domain)
ACE 中的基本组织单位。一个 Domain 代表一个完整的业务系统或工程项目。
*   **ACE Core**：引擎自身所属的域。
*   **Business Domain**：实际的业务项目（如 WMS, ERP）。

## 2. 技能 (Skill)
可复用的原子化能力，位于 `skills/`。
*   **Workflow Skill**：管理开发生命周期的技能（如 `openspec`）。
*   **Tool Skill**：执行具体技术动作的技能（如 `env-up`, `db-migrate`）。

## 3. 知识资产 (10_DOCS)
存放于每个 Domain 内部的结构化文档，分为：
*   **Business**：业务规则、用户故事。
*   **Technical**：架构决策、环境要求。
*   **API**：系统契约。

## 4. 变更规范 (OpenSpec)
所有代码变动的“唯一法律”。它强制要求变更必须包含：**探索 -> 提案 -> 实施 -> 验证** 的闭环。

## 5. 辩证思考 (Dialectical Thinking)
ACE 的行为准则。AI 在给出结论前必须进行：**分析 -> 质疑 -> 对比 -> 决策** 的心理过程。
