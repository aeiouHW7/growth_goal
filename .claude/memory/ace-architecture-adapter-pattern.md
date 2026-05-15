---
name: ace-architecture-adapter-pattern
description: ACE 采用 Adapter Pattern — .claude/ 是注册表（stub），agents/ 是实现，不复制内容
metadata:
  type: project
---

ACE 的 .claude/ 目录是注册表，不是实现层。

**Why:** 用户问"什么时候需要编译到 .claude/ 里"— 答案是只有需要被 Claude Code 自动发现的东西才放进去（skill stub、commands、settings），实现内容放在 agents/、skills/capabilities/、scripts/hooks/。

**How to apply:**
- `.claude/skills/{name}/SKILL.md` → 短 stub，指向 `agents/*.md`
- `.claude/commands/{name}.md` → 自包含的 slash command
- `.claude/settings.json` → hooks 注册
- 不要把完整 agent 实现或知识文档复制到 .claude/ 里
