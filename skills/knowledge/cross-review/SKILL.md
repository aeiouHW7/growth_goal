---
name: cross-review
description: 通用审核引擎 - 支持方案、代码、测试、文档的自审和交叉审核。Use when user asks for review, audit, or quality check.
version: "2.0"
license: MIT
compatibility: Requires ACE Engine project structure
metadata:
  author: ACE Engine

  source: Adapted from ai-drive-engine
---

# Cross-Review 通用审核引擎

提供两个独立入口，供其他 skill 按需调用。

| 入口 | 用途 | 轮次控制 |
|------|------|---------|
| `self_review` | 生成后的内部自审，AI 切换评审员角色 | 固定最多 3 轮 |
| `cross_review` | 外部交叉审核，独立视角 + 收敛检测 | 收敛检测 + 5 轮硬上限 |

审核 Prompt 模板见 `references/prompt-templates.md`。
检查清单见 `references/checklists.md`。

---

## 审核类型路由表

传入 `review_type` 后，自动选择对应的检查清单和 Prompt 模板，调用方无需手动指定：

| review_type | self_review 使用 | cross_review 使用 |
|-------------|-----------------|-------------------|
| `proposal` | `checklists.md` → 一、方案/提案检查清单 | `prompt-templates.md` → Prompt-Proposal |
| `code` | `checklists.md` → 二、代码检查清单 | `prompt-templates.md` → Prompt-Code |
| `test` | `checklists.md` → 三、测试检查清单 | `prompt-templates.md` → Prompt-Test |
| `general` | `checklists.md` → 四、通用检查清单 | `prompt-templates.md` → Prompt-General |
| 自定义值 | **调用方必须传 `checklist`** | **调用方必须传 `prompt_template`** |

**路由规则**：
1. `review_type` 命中上表前三行 → 自动读取对应的 references 文件，调用方只需传 `content` + `context`
2. `review_type` 为自定义值 → 调用方必须显式传入 `checklist`（self_review）或 `prompt_template`（cross_review），否则拒绝执行
3. 即使命中内置类型，调用方仍可传入 `checklist` / `prompt_template` 覆盖默认值（项目特定清单优先于通用清单）

---

## 入口一：self_review（自审循环）

### 调用参数

```
review_type: proposal | code | test | 自定义类型
content:     <待审核内容>
context:     <项目上下文>   # 可选，技术栈、业务领域等
checklist:   <检查清单>     # 可选，内置类型自动路由，自定义类型必填，传入则覆盖默认
```

### 执行规则

1. **切换角色**：AI 切换为"评审员"视角，与生成内容时的角色隔离
2. **逐项检查**：按 `checklist` 逐条执行，每项给出"通过 / 不通过 + 具体问题"
3. **发现问题则修改**：不通过的项自行修改后进入下一轮
4. **固定 3 轮上限**：3 轮内通过则结束；达到上限仍有问题，列出遗留问题继续后续步骤（不阻塞）
5. **每轮必须输出具体问题列表**，禁止只说"看起来没问题"

### 严重程度定义

| 级别 | 标记 | 含义 |
|------|------|------|
| 🔴 阻塞 | P0 | 必须修复才能通过，功能缺陷、数据安全、逻辑错误 |
| 🟡 建议 | P1 | 建议修复但不阻塞，性能、异常处理、代码质量 |
| 🟢 优化 | P2 | 可后续优化，命名、注释、代码风格 |

### 输出格式

```markdown
### 自审结果：第 N/3 轮

**审核对象**: {review_type}
**结论**: ✅ 通过 / ❌ 不通过

| # | 检查项 | 严重程度 | 结论 | 问题描述 |
|---|--------|---------|------|---------|
| 1 | ...    | —       | ✅   | —       |
| 2 | ...    | 🔴 P0  | ❌   | 具体问题，已修改：... |
| 3 | ...    | 🟡 P1  | ❌   | 具体问题，已修改：... |

**本轮修改摘要**：
- 修改了 xxx
- 新增了 xxx

**遗留问题**（达到上限时）: {列出未解决的问题}
```

**格式统一说明**：自审和交叉审核的输出格式不同（自审用表格，交叉审核用章节），但严重程度标记统一使用 P0/P1/P2。调用方汇总时按 P0/P1/P2 聚合即可，无需关心格式差异。

---

## 入口二：cross_review（交叉审核）

### 调用参数

```
review_type:      proposal | code | test | 自定义类型
content:          <待审核内容>
context:          <项目上下文>      # 项目背景、技术栈、业务领域、历史提案等
prompt_template:  <审核 Prompt>     # 可选，内置类型自动路由，自定义类型必填，传入则覆盖默认
```

**内置类型的 Prompt 组装**：自动读取 `prompt-templates.md` 对应骨架，用 `context` 中的信息填充占位符（`{项目背景}`、`{需求文档}` 等），`content` 填入 `{待审核方案/代码/测试}`。

### 首次使用自检

每次调用 `cross_review` 时，先读取 `config.yaml`。如果 `platform` 字段为空，说明从未初始化，执行自检：

```bash
bash skills/common/cross-review/scripts/setup.sh
```

脚本支持两种模式：
- **交互模式**（默认）：用户直接调用时，可选择模型和 MCP 工具
- **非交互模式**（`--auto`）：自动化流程中调用，使用默认值（haiku 模型，自动创建 agent）

```bash
# 交互模式
bash skills/common/cross-review/scripts/setup.sh

# 非交互模式（自动化流程中使用，不阻塞流程）
bash skills/common/cross-review/scripts/setup.sh --auto
```

脚本自动完成：
1. **探测平台**：通过进程名/PATH/目录特征判断 Kiro / Claude Code / unknown，写入 `platform`
2. **扫描 MCP**：读取 `.mcp.json`，过滤含 `review/audit/check/assistant` 关键词的工具，写入 `mcp_tool`（无则写 `none`）
3. **创建专用审核 agent**：询问用户是否创建 `cross-reviewer` agent
   - Kiro → 生成 `.kiro/agents/cross-reviewer.json`（默认 `model: claude-haiku-4`，交互模式可选 sonnet/opus）
   - Claude Code → 生成 `.claude/agents/cross-reviewer.md`（默认 `model: haiku`，交互模式可选 sonnet/opus）
   - 写入 `subagent_name: cross-reviewer`
4. 写入完整 `config.yaml`

自检完成后不再重复执行（`platform` 非空即跳过）。如需重新初始化，删除 `config.yaml` 后重新调用。

---

### Provider 路由（三级降级）

按优先级依次尝试，前一级不可用时自动降级：

**Level 1：MCP 工具**

读取 `config.yaml` 的 `mcp_tool`，调用对应 MCP 工具，将完整 Prompt 作为 Query 传入。

`mcp_tool: none` 或工具调用返回错误/超时 → 触发降级。

**Level 2：Subagent**

读取 `config.yaml` 的 `subagent_name`，通过 `use_subagent` 派发：
- `subagent_name` 非空 → 指定专用审核 agent（Kiro 用 `agent_name` 参数，Claude Code 用 `@agent-name` mention）
- `subagent_name` 为空 → 使用 default subagent

专用审核 agent 由 `setup.sh` 自动创建，配置了只读工具。`--auto` 模式默认使用 haiku（速度优先），交互模式可选择更强模型（sonnet/opus）。

```
query: |
  你是一位资深评审员，请执行以下审核任务。

  {prompt_template 完整内容}

  输出结构化审核报告，每条意见注明优先级（P0/P1/P2）、问题描述、修改建议，最后给出总体结论。
agent_name: {config.yaml 的 subagent_name，为空则不传}
```

Subagent 返回后，主 agent 按"独立分析规则"逐条处理。

**Level 3：自审（兜底）**

Subagent 不可用时，复用 `self_review` 逻辑执行，但标注缺少独立视角：

`⚠️ 交叉审核降级为自审（缺少独立视角，建议人工重点复核）`

**降级记录**：降级发生时在报告中记录 `📌 能力降级：{能力名} 从 {原provider} 降级到 {实际provider}，原因：{错误信息}`

### 收敛检测规则

| 条件 | 动作 |
|------|------|
| 本轮无 P0 阻塞项 | 直接通过，终止 |
| P0 数量比上轮减少 | 有进展，继续下一轮 |
| P0 数量连续 2 轮无变化 | ping_pong 僵局，强制终止 |
| 达到 5 轮硬上限 | 强制终止 |

终止时仍有争议：用 `⚠️ 争议未决` 标记，包含双方观点，由用户裁决。

### 独立分析规则

收到审核意见后**禁止直接采纳**，逐条给出：
- ✅ 认同 — 有项目事实支撑，执行修改
- ❌ 不认同 — 给出驳回理由（基于代码/规范/数据库事实）
- 🟡 部分认同 — 说明认同和不认同的部分

**防止妥协**：不得因"需要尽快达成一致"放弃基于项目事实的判断。

**驳回也需确认**：即使全部驳回，也必须将驳回理由提交审核者确认，不可跳过后续轮次。每轮的输出（无论是修改还是驳回）都必须回到审核者形成闭环。

### Token 优化规则

交叉审核多轮交互时，按以下规则控制 Prompt 大小：

**首轮**：完整输出 Prompt 模板 + 填充内容，确保审核者拥有完整上下文。

**补充信息轮**（审核者要求补充资料时）：
```
你正在审核《{审核对象名称}》（{审核类型}）。
上一轮你要求补充以下信息，现在提供如下：

## 补充信息
{逐项列出对方要求的信息及对应内容}

请基于首轮提供的完整上下文和本次补充信息，继续完成审核。输出格式同首轮要求。
```

**后续审核轮**（修改后重新提交审核）：
```
你正在审核《{审核对象名称}》的第 N 轮。

## 上轮审核问题状态
{列出上轮每个 P0/P1 项的状态：已关闭/已修改/仍保留，及修改摘要}

## 本轮修改内容
{只列出本轮修改的部分，而非完整内容}

## 需要你确认
1. 上轮的 P0 问题是否已解决？
2. 本轮修改是否引入新的 P0 问题？

输出格式：对每个上轮问题给出"✅已关闭 / ❌仍未解决 / ⚠️部分解决"，如有新问题另列。
```

**回退规则**：如果审核者的回复满足以下任一条件，判定为上下文丢失，下一轮回退到完整 Prompt：
- 回复中未引用任何上轮问题编号（如 P0-1、P1-2 等）
- 回复内容与审核对象的技术领域明显无关（如审核 Java 代码但回复讨论前端样式）
- 回复长度不足上轮的 1/3 且未给出"无新问题"的明确结论

### 测试数据标注规则

审核内容中可能包含从测试环境查询到的数据。生成审核请求时：
- **表结构信息（字段名、类型、索引）可作为审核依据** — 稳定的设计事实
- **测试库的具体数据值、数量、分布仅供参考** — 标注 `（测试库数据，仅供参考）`
- 如果设计决策依赖了测试数据的具体值，这本身就是审核问题

### 输出格式

```markdown
## 交叉审核报告（{审核类型}）

**Provider**: {MCP xxx | Subagent | 自审}
**轮次**: {N} 轮
**终止原因**: {无 P0 通过 | ping_pong 终止 | 达到上限}

### 📝 审核过程记录

#### 轮次 1 — {provider} 审核
- 发现问题数: X 个 P0, Y 个 P1, Z 个 P2
- 关键问题: {简要描述 1-2 个最重要的问题}

#### 轮次 2 — {provider} 审核（如有）
- 发现问题数: X 个 P0, Y 个 P1, Z 个 P2
- 上轮问题解决情况: {已解决/部分解决/新增问题}
- 收敛情况: {P0 减少/无变化/已收敛}

### ✅ 达成一致的修改项
{已采纳并修改的意见}

### ❌ 被驳回的意见
{基于项目事实驳回的意见及理由}

### ⚠️ 争议未决（如有）
{争议描述，包含双方观点和理由}

### ⚠️ 需用户关注的决策点（如有）
{超出技术范畴的业务决策}

### 📌 AI 自主决策（如有）
{决策描述}（依据：{依据来源}）

### 📋 修改摘要
{本次修改了哪些内容}

### 💡 知识沉淀（如有）
{从审核过程中发现的根因性问题或通用原则}

### 降级说明（如有）
📌 能力降级：{原provider} → {实际provider}，原因：{错误信息}
⚠️ {降级影响说明}
```

---

## 典型调用场景

| 调用方 | 入口 | 传参 | 说明 |
|--------|------|------|------|
| propose | `self_review` | `review_type=proposal`, `content=提案内容` | 自动用方案检查清单 |
| propose | `cross_review` | `review_type=proposal`, `content=提案内容`, `context={项目背景+需求文档+历史提案}` | 自动用方案审核 Prompt |
| apply | `self_review` | `review_type=code`, `content=代码变更` | 自动用代码检查清单 |
| review | `cross_review` | `review_type=code`, `content=git diff`, `context={项目背景+需求文档}` | 自动用代码审核 Prompt |
| verify | `self_review` | `review_type=test`, `content=测试用例` | 自动用测试检查清单 |
| verify | `cross_review` | `review_type=test`, `content=测试用例`, `context={项目背景+需求场景}` | 自动用测试审核 Prompt |
| 任意 skill | `self_review` | `review_type=custom`, `content=xxx`, `checklist=自定义清单` | 自定义类型必传 checklist |

---

## 持久化规则

调用方决定是否持久化，cross-review 只负责生成报告内容。

**建议持久化**：存在 `⚠️ 争议未决`、复杂驳回理由、`📌 AI 自主决策`。

**无需持久化**：所有意见达成一致，1 轮通过，无争议。
