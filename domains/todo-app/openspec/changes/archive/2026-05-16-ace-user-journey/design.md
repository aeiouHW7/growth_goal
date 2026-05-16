## Context

ACE 的 workflow 流程链（planner → applier → reviewer → archiver → retro）和项目协议层（domain.yaml → CLAUDE.md）已落地。但以用户视角走完整旅程，仍有 5 个环节是断的：

1. **环境引导** — ace-init 建了目录但不检测 node/docker 是否可用
2. **服务状态** — 用户不知道前端/后端/数据库哪个在跑
3. **TDD 模式** — 复杂 task 缺少测试先行的结构化流程
4. **服务启动** — 实现完毕后没有"看效果"的最后一步
5. **会话交接** — 会话中断后下次无法接续

参考来源：
- **Matt Pocock skills**（`.tmp/references/mattpocock-skills/`）：tdd、diagnose、grill-with-docs、prototype、zoom-out
- **ECC**（`.tmp/references/everything-claude-code/`）：hooks.json、RULES.md、SOUL.md

约束：只改 .md 文件和 settings.json，不引入新的运行时依赖。

## Goals / Non-Goals

**Goals:**
- 用户从"创建项目"到"看到效果"全程无断点
- 拿来主义：Matt/ECC 的方法论通过 adapter pattern 融入，不 copy-paste
- Hooks 硬约束覆盖 AI 已知失败模式（盲改、改配置、跳 hooks、前台卡死）
- 会话可交接，知识不丢失

**Non-Goals:**
- Cross-IDE 适配（只支持 Claude Code）
- Plugin 打包（当前 domains/ 模式够用）
- Cost tracker / metrics bridge
- Caveman 模式（token 压缩）
- 知识图谱（grep + wiki index 够用）

## Decisions

### D1: Agent 增强方式 — 追加而非重构

**选定**：在现有 agent .md 文件末尾追加新 Step，不改变现有结构。

**备选**：重构 agent 文件为模块化片段（每个能力独立文件）。

**理由**：现有 agent 文件结构稳定，各阶段 skill 已经能正确触发。追加是增量操作，风险最低。重构可以作为未来独立变更。

### D2: Matt Pocock 集成 — Adapter Pattern

**选定**：在 agent .md 中声明式引用 Matt 方法论，不复制其 SKILL.md 内容。

示例（ace-applier 增加 TDD 分支）：
```
复杂 task 判断:
├── 简单 → 现有模式（写代码 → 验证）
└── 复杂（新实体/核心逻辑） → 参考 Matt Pocock TDD 方法论
    ├── 垂直切片：一个测试 → 一个实现 → 循环
    ├── 测试验证行为而非实现细节
    └── 重构在 GREEN 之后，从不在 RED 时重构
```

来源映射：
| Matt Skill | ACE 对应 | 融入方式 |
|-----------|---------|---------|
| tdd | ace-applier Step 2 | TDD 分支决策树 |
| diagnose Phase 1 | ace-investigator Step 0 | "建立反馈循环"前置步骤 |
| grill-with-docs | ace-planner Phase 1 | Grill 已集成，增强术语表实时更新 |
| prototype | ace-planner Phase 1 | 探索阶段可选 prototype 验证 |
| zoom-out | ace-retro Step 3.5 | 架构深度检查（deletion test） |

**备选**：直接复制 Matt SKILL.md 内容到 agent .md 中。

**理由**：Adapter pattern 可以随 Matt 仓库更新而免费获益，避免内容漂移。

### D3: Hooks 系统 — Claude Code settings.json 原生格式

**选定**：使用 Claude Code 的 `.claude/settings.json` hooks 配置，脚本放 `scripts/hooks/`。

ECC 参考提炼（拿来主义，只取 ESSENTIAL）：

| ACE Hook | ECC 对应 | 类型 | 作用 |
|----------|---------|------|------|
| read-before-write | — | PreToolUse(Edit\|Write) | 编辑前强制先 Read |
| config-protection | pre:config-protection | PreToolUse(Edit\|Write) | 阻止改 eslint/tsconfig/prettier |
| no-skip-hooks | pre:bash:dispatcher | PreToolUse(Bash) | 阻止 --no-verify |
| foreground-server-block | pre:bash:dispatcher | PreToolUse(Bash) | 阻止非 tmux 的 npm run dev |
| post-edit-typecheck | — | PostToolUse(Edit\|Write) | .ts/.tsx 编辑后 tsc --noEmit |
| post-edit-format | — | PostToolUse(Edit\|Write) | 编辑后 prettier 格式化 |
| pre-commit-quality | pre:bash:dispatcher | PreToolUse(Bash) | commit 前检查 console.log/secrets |
| workflow-guard | — | PreToolUse(Edit\|Write) | 直接写业务代码时提醒先走 planner |

**备选**：自建 hook 框架（如 ECC 的 run-with-flags.js dispatcher 模式）。

**理由**：ACE 规模远小于 ECC（8 hooks vs 30+ hooks），不需要 dispatcher 架构。每个 hook 独立脚本，简单直接。如果未来 hooks 超过 15 个再考虑 dispatcher。

### D4: Commands — .claude/commands/ 原生格式

**选定**：`ace-status` 和 `ace-handoff` 作为 `.claude/commands/` 下的 markdown 命令。

```
.claude/commands/
├── ace-status.md    — 读 domain.yaml services，检测各端口状态
└── ace-handoff.md   — 会话交接文档生成
```

**备选**：作为 skills 实现。

**理由**：这两个是用户主动触发的一次性操作，command 比 skill 更合适（skill 适合 AI 自动触发的工作流）。

### D5: 术语表 — 复用现有 glossary，不引入 CONTEXT.md

**选定**：继续使用 `docs/wiki/glossary.md`，planner 的 Grill 过程中实时追加新术语。

**备选**：引入 Matt 的 CONTEXT.md 格式（glossary + relationships + flagged ambiguities）。

**理由**：CONTEXT.md 格式更强大，但 glossary.md 已经在用且与 wiki 体系一致。可以将 CONTEXT.md 的 relationships 和 flagged ambiguities 部分作为 glossary.md 的增强，不另起文件。

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hooks API 可能随 Claude Code 版本变化 | hooks 失效 | 只用 PreToolUse/PostToolUse 标准事件，不用实验性 API |
| Agent .md 文件变长影响 AI 指令遵从率 | 新增内容被忽略 | 每次追加控制在 10-15 行内，用 checkbox 格式提高可扫描性 |
| post-edit-typecheck hook 拖慢编辑速度 | 开发体验变差 | 设为 async hook + 5s 超时，不阻塞编辑操作 |
| workflow-guard 误报率 | 打断正常编辑 | 只在检测到"新建业务文件"时触发（不对已有文件修改触发） |
| ace-handoff 信息不够接续 | 下次会话仍需重新理解 | handoff 文档引用已有 artifacts 路径，不重复内容 |

## Migration Plan

本次变更全部是增量操作，无需迁移：
- Agent .md：追加 Step，不改已有内容
- Hooks：新建 settings.json 和脚本，不影响现有工作流
- Commands：新增文件，不改已有命令
- Rollback：删除新增文件即可完全回退

## Open Questions

1. **post-edit-typecheck 的 scope**：是否只检查被编辑的文件（快但可能漏），还是全量 tsc --noEmit（慢但准确）？建议先用全量，如果太慢再降级。
2. **ace-handoff 的格式**：用 markdown 还是 JSON？markdown 对人类可读，JSON 对 AI 可解析。建议 markdown，因为下次会话的 AI 可以直接读 .md。
