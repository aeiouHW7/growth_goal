# Retro: growth-miniprogram v0.1 Phase 1（含飞书 CLI）

**复盘日期**: 2026-05-25
**范围**: growth-miniprogram v0.1 Phase 1 完整实现 — Backend + Bridge(飞书) + CLI + Frontend + Planning
**复杂度**: 高（14+ commits, ~8,500 lines, 30+ files, 12 Prisma models, 6+ 新 services）
**耗时**: ~8 天（2026-05-16 ~ 2026-05-24）

## What Went Well

### 1. 架构分层的延续性和正确性

- **Backend-first 策略沿袭** — Phase 1 在 Claude 终端 + 飞书双渠道验证，无需 Web 前端即可完成核心闭环
- **Bridge 作为独立层** 解耦清晰 — `auto-processor.cjs` 作为飞书消息处理的后台进程，不依赖后端框架，通过 HTTP 对接，方便独立测试和重启
- **frontend/ 提前入局但不阻塞** — Taro + Vite 脚手架已搭好，Phase 2 可直接开发

### 2. 分析框架的质感提升

- **self-growth-analyst 成功整合** — 8 步分析框架从独立仓库落地到实际 service，而且不是简单搬运，做了工程适配
- **4 个新分析服务独立职责**：
  - `BiasDetectionService` — 7 类认知偏误词典 + 正则触发 + 数据库持久化，**偏误可追踪可回溯**
  - `CapabilityService` — 20 维能力框架 + delta 自动计算，形成能力基线
  - `PatternService` — bigram Jaccard 语义去重 + 频率统计 + 自动衰减（14 天未更新→inactive），**反复障碍可量化**
  - `SignalDepthService` — 8 维信号厚度评分 + 防御机制扣分 + 缺口定位，**追问有依据**
- `bigramJaccard` 工具函数在 `PatternService` 和 `AnalysisService` 两处复用，中文短文本匹配效果合理

### 3. Bridge 飞书集成的实用性

- **持久化消息监听** — 后台进程 + `.processed_ids` 去重 + 会话隔离（`sessions/` 目录），**消息不会漏也不会重复处理**
- **动态 Prompt 获取** — Bridge 启动时从 `/api/prompt/daily-review` 拉取最新分析指令，Prompt 更新不影响 Bridge
- **USER_FEISHU_ID 硬编码但不失灵活** — 当前单用户模式，未来改为多用户只需查表

### 4. Prompt-as-code 体系成熟

- `daily-review.prompt.ts` 是**单一真相来源** — Bridge + Backend 都依赖它，变更只需改一处
- Prompt 结构清晰：三段式洞察 → 偏误分析 → 四层分析 → 建议生成 → 能力评分，每步都有输出字段绑定的类型定义（`StructuredReport`）

### 5. CLI 的交互设计

- `growth-cli.ts` 完整实现了终端交互：彩色输出 + 输入校验 + 选择器 + 完整 CRUD + 复盘分析流
- 不依赖任何外部 CLI 框架，`readline` + `fetch` 原生实现，零依赖

## What Went Wrong

### 1. 工作成果散落在 committed 和 uncommitted 之间

- **核心 commit（`746a49e`）是中期快照而非完成态**
- 4 个新 service + Bridge + CLI + Frontend + `prompt.ts` route + `string-sim.ts` + `types/` 全部是**未跟踪文件**
- `analysis.service.ts`、`analysis.controller.ts` 等已 commit 的文件又有后续修改未提交
- → **风险：如果此时回滚或切换分支，大量工作丢失且难以恢复**

### 2. Bridge 代码质量参差不齐

- `auto-processor.cjs` 主体功能完整，但遗留了大量临时文件（`.diag-test.cjs`、`.diag-test2.cjs`、`.card-tmp.json`、`.raw-trace.log`、`events.ndjson` 等），说明开发过程的诊断文件没有及时清理
- `events/`、`sessions/` 目录在 repo 内但没有 `.gitignore`，可能会意外提交大量噪音
- 用 `require('http')` 手写 HTTP 请求而非 `fetch`（Node 18+ 内置）或 `axios`，代码冗余且缺少超时重试

### 3. 测试覆盖率缺口

- 新 service（BiasDetection、Capability、Pattern、SignalDepth）的**单元测试全部缺失**
- `bigramJaccard` 在 utils 中但没有独立测试
- Bridge 完全无测试，依赖手动验证

### 4. Express 5 类型兼容问题（从上一轮遗留）

- `req.params[key]` 返回 `string | string[]` 的问题依然需要 `pv()` helper，增加了样板代码
- 未统一封装到 middleware 层

### 5. Prisma schema 变更与已提交状态的冲突

- `schema.prisma` 有修改（已 staged），`prisma/seed.ts` 也有修改
- 如果新加字段涉及迁移，需要处理与已提交版本的兼容

## Lessons Learned

### 工程流程 — 立即生效

| 规则 | 说明 |
|------|------|
| **commit early, commit often** | Phase 1 这种大变更应分多次 commit，每完成一个独立功能就提交，避免大量工作在 uncommitted 状态 |
| **开发诊断文件即用即删** | `.diag-test*.cjs`、`.raw-*.log` 等用完应立即 `.gitignore` 或清理，不留在工作区 |
| **新 service 必配测试** | SignalDepthService 是纯函数、BiasDetection 也是纯函数，非常容易写单元测试，不写是亏的 |
| **Bridge 目录加 .gitignore** | `sessions/`、`events/`、`*.log`、`*.ndjson` 应全部忽略 |

### 技术模式 — 开箱即用

- **Bridge 架构**：后台进程 + HTTP 轮询 + 去重 ID 持久化 → 适合飞书/钉钉等 IM 集成场景
- **SignalDepth 评分器**：8 维评分 + 防御扣分 + 缺口定位 → 适合任何需要评估用户输入质量的场景，可直接复用
- **Bigram Jaccard 中文匹配**：去除非中文/字母/数字字符后算 bigram 交集/并集 → 中文短文本去重的低成本方案
- **Pattern 自动衰减**：`lastDetected + PATTERN_DECAY_DAYS` 自动 inactive → 避免历史模式永久占据活跃列表

### 设计决策

- **Prompt route 的 READ-only 设计**：`GET /api/prompt/daily-review` 只读返回，Bridge 只消费不修改 → 符合 CQRS 原则
- **BiasDetection 的双入口**：`detect()` 纯函数 + `logBiases()` 副作用分离 → 可测试性更好
- **CapabilityService.delta 自动计算**：`getDelta()` 对比上次评分，`logFromAnalysis()` 批量写入 → 能力变化自动追踪无需业务关心

## Decisions to Make

- [ ] **提交策略** — 当前 uncommitted 的工作（Bridge + CLI + Frontend + 4 services + 类型）是直接 commit 还是 squash 到 Phase 1 commit
- [ ] **Frontend 优先级** — Taro 前端已建但未使用，Phase 2 才真正需要。需要决定是继续完善还是等 Phase 2 启动再弄
- [ ] **Bridge 多用户** — 当前 `USER_FEISHU_ID` 硬编码，多用户需要引入 `User` 表的飞书 ID 映射
- [ ] **Prompt 版本化** — `daily-review.prompt.ts` 变更后不会通知已运行的 Bridge，需要设计版本协商或热更新机制
- [ ] **Backup 目录** — `backend/backups/` 出现了但用途不明，需要确认是自动备份还是手动操作
- [ ] **Schema 迁移** — Prisma schema 的后续修改需要生成正式的 migration 文件
