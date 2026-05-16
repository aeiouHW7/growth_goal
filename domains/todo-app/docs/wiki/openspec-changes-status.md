# OpenSpec Changes 状态总览

> 2026-05-16 快照，各 change 的进度与关联关系

## 活跃 Changes

### 1. docker-independence（Docker 独立化）

**状态**：proposal + design + specs + tasks 全齐，未开始实现

**范围**：
- 子项目独立 Docker Compose（参数化端口/容器名/数据卷）
- ace-create-project executor 实现（模板复制 + 变量替换）
- ace-init-env executor 实现（环境检测）
- 根目录清理（删共享 docker-compose.yml + 过时 skills）
- todo-app 迁移（已有独立 docker-compose.yml）

**Tasks 9 组，53 项，0 完成**

**关键决策**：
- D1: Docker 配置在子项目内（非根目录共享）
- D2: Skills 通过 AI 自然语言触发（非用户命令）
- D3: 模板复制 + 变量替换（非代码生成器）
- D4: 端口自动递增分配 + .env 覆盖

### 2. ace-user-journey（ACE 用户旅程补全）

**状态**：proposal + design + tasks 全齐，**全部完成**

**范围**：
- Phase A: 5 个 agent 增强（planner/applier/investigator/reviewer/retro）— done
- Phase B: ace-status + ace-handoff commands — done
- Phase C: 8 个 hooks 系统 — done

**Tasks 3 组，27 项，27 完成** — 可归档

### 3. add-todo-priority-t（Todo 优先级功能）

**状态**：**全部完成**

**范围**：Prisma schema + controller + tests
**Tasks 3 项，3 完成** — 可归档

## 关联分析

```
docker-independence
├── start.sh 三件套      ← 本次重点
├── ace-create-project   ← 依赖三件套模板
└── 根目录清理           ← 独立可做

ace-user-journey (done)
├── ace-status command   ← 与 status.sh 功能重叠，需协调
└── hooks 系统           ← 已落地

add-todo-priority-t (done)
└── 独立，无关联
```

## 待决定

1. ace-user-journey 和 add-todo-priority-t 应该归档
2. docker-independence 的 tasks 需要重新审视——53 项太多，部分可能已过时
3. start.sh 三件套是 docker-independence Task 7 的子集，但现有 tasks 只覆盖了 start.sh 增强，缺 stop.sh
