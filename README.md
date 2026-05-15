# ACE Engine

**AI Coding Engine** — 知识驱动的 AI 辅助开发引擎。

---

## 核心理念

- **辩证思考**: 先思后行，拒绝反射式编码
- **知识驱动**: 代码是副产品，文档和 Skills 是资产
- **工具中立**: 不绑定特定 IDE，纯 Markdown/YAML 存储

详见 [ETHOS.md](ETHOS.md)

## 架构

三层架构：**Orchestrator → Agents → Skills**

- **Orchestrator** — 理解意图、路由 agent、直接处理 archive/retro
- **Agent** (12个) — 自包含的 workflow 阶段，含 SOP、Gate、技能引用
- **Skill** (6个) — 纯知识文档，定义方法论、模式、检查清单

详见 [AGENTS.md](AGENTS.md)

## 项目结构

```
AI-Coding-Engine/
├── .claude/skills/            # 5 个注册 skill（workflow 入口）
├── agents/                    # 12 个 agent（4 核心 + 8 子 agent）
├── skills/capabilities/       # 6 个 knowledge skill
├── rules/                     # 编码和系统规则
├── docs/                      # 经验文档和参考
├── domains/todo-app/          # 示例项目
├── AGENTS.md                  # AI 协作入口
└── ETHOS.md                   # 核心哲学
```

## 工作流

```
ace-planner → ace-applier → ace-reviewer → ace-archive → ace-retro
  探索+规划     逐任务实现     审查+验证       归档         复盘
```

## 许可证

MIT
