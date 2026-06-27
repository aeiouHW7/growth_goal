# Retro: core-goal-review-system

**复杂度**: 复杂（14 tasks, ~1,800 lines, 30 files, 12 models）
**耗时**: 2 天（完整实现 + review + 修复）

## What Went Well

1. **Backend-first 策略正确** — Phase 1 直接在 Claude 终端验证，无需前端 UI，0 浪费
2. **Prisma schema 一次性设计到位** — 12 个 model 建完没大改，只有关系补齐和 `@db(date)` 清理
3. **T1→T14 依赖链清晰** — 按依赖顺序推进，没有阻塞等待
4. **Prompt-as-code 模式** — `build*Prompt(ctx)` 带类型接口，AI prompt 可测试可追踪
5. **状态机校验** — `validateTransition` 模式在 Goal/Plan/Review 三处复用，简单可靠
6. **代码 review 把关有效** — 抓住了 `checkWeekly` userId 遗漏和日期未验证两个 bug

## What Went Wrong

1. **Import 路径初期混乱** — service 文件先引 `../index` 后拆到 `../prisma`，多一次重构
2. **`@db(date)` 兼容性踩坑** — Prisma schema 加了 `@db(date)` 但 PostgreSQL 不支持，全量删除
3. **Express 5 类型摩擦** — `req.params[key]` 在 Express 5 下 `string | string[]`，需要 `pv()` helper
4. **日期验证遗漏** — 8 个地方直接 `new Date(userInput)`，无效日期抛 Prisma 原生错误不利排查

## Lessons Learned

**技术模式 — 开箱即用：**
- Express 项目拆 3 文件：`app.ts`（config）+ `index.ts`（listen）+ `prisma.ts`（singleton） — 防测试端口冲突
- 所有用户日期输入先过 `validateDateString()` 再进 Prisma — 加一行函数防全线崩溃
- 状态机用 `Record<Status, Status[]>` + `validateTransition()` 模式 — 三处通用

**工程流程：**
- archiver 前跑完 review 是值得的 — 发现了不跑就进生产的问题
- 复杂变更建议一天内不要超过 5 个任务提交，commit message 信息密度更高

## Decisions to Make

- [ ] **鉴权** — 当前 `getUserId()` 单用户模式，Phase 2 需替换为真实用户上下文
- [ ] **分页** — 全部 list 端点缺 limit，数据积累后需加默认分页
- [ ] **状态机复用** — `goal.service.ts` 和 `plan.service.ts` 的 `GOAL_STATUS_TRANSITIONS` 重复，提前 `utils/status-machine.ts`
