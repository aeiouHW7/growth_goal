# 项目进度 — growth-miniprogram → 人生教练

> 本文件记录从"目标拆解与复盘系统"向"AI 人生教练"演进的完整进度。
> 每次工作结束时更新，每次工作开始时读取。

---

## 最终愿景

一个三层 AI 人生教练系统：

```
规划层：愿景 → 目标拆解
执行层：目标 → 具体行动建议
反思层：复盘 → 偏差分析 → 动态调整 → 再规划
```

核心差异：**主动推动，而非被动等待操作。**

---

## 当前状态评估（2026-06-13）

### 已有基础设施（✅）

| 模块 | 状态 | 说明 |
|------|------|------|
| 数据模型（Prisma 16 表） | ✅ | User → LifeGoal → YearlyGoal → MonthlyPlan → DailyPlan → 复盘链 |
| 后端 CRUD API | ✅ | 全部 Express RESTful 接口 |
| AI 分析服务 | ✅ | BiasDetection、Pattern、Capability、SignalDepth、Analysis |
| CLI 终端 | ✅ | 完整交互式 CRUD + 复盘流 |
| Web 前端（仪表盘） | ✅ | 基础版已实现（Overview/Goals/Plans 页） |
| Coach 方法论文档 | ✅ | review-analysis.md、goal-decompose.md、intervention.md |
| 复盘系统 | ✅ | 自由碎碎念 → AI 结构化分析 |

### 核心差距（❌）

| 差距 | 优先级 | 说明 |
|------|--------|------|
| **人生档案（长期记忆）** | P0 | 价值观、限制条件、偏好、历史决策 — AI 每次对话的必读上下文 |
| **结构化复盘模板** | P0 | 预设字段模板替代纯自由文本，提高分析准确性 |
| **偏差检测 → 主动干预** | P1 | 连续 N 天无进展 → 自动检测 → 诊断(目标太高/方法不对/动力不足) → 3 种修正选项 |
| **AI 主动行动建议** | P1 | 每天根据目标和历史数据生成 Today Top 3 |
| **自动化周/月回顾** | P2 | 到期自动聚合 → 生成草案 → 用户确认 |
| **Coach Agent 与 API 集成** | P2 | 教练方法论落地为可调用服务 |

---

## 优化路线图

### P0 — 基础设施（立即可做）

- [ ] **P0-1：人生档案表 + API**
  - 新增 `LifeArchive` model：values, vision, constraints, decisions, preferences, summary
  - 新增 CRUD API
  - AI 每次对话前加载 summary
- [ ] **P0-2：结构化复盘模板**
  - 预设字段：完成/未完成/阻碍/学到/明日Top1/精力状态
  - 前端/CLI 提供模板输入
  - AI 基于模板分析，自由文本作为补充

### P1 — 主动能力（3-5天）

- [ ] **P1-1：偏差检测 + 主动干预服务**
  - 检测连续 N 天某目标无进展
  - 诊断根因（Fogg 模型：动机/能力/提示）
  - 生成 3 种修正选项并写入 suggestion
- [ ] **P1-2：AI 主动行动建议**
  - 基于目标 + 历史完成率 + 精力模式 → Today Top 3

### P2 — 完整闭环（1-2周）

- [ ] **P2-1：自动化周/月回顾**
  - 到期自动触发 → 聚合 → 草案 → 用户确认 → 写入
- [ ] **P2-2：Coach Agent 集成**
  - 方法论落地为后端 service
  - 对话式交互 + API 数据层

---

## 每日进度日志

### 2026-06-27 — 前端档案页 + 真实数据恢复 + Apple 风格 + 复盘链路修复

**做了什么：**

**前端档案页（LifeArchive）**
- 新增 `ArchivePage.tsx` 三子标签页面（核心特质/资源能力/未来蓝图）
- 新增 `archive.css` Apple 风格样式
- App.tsx 导航栏增加「档案」Tab
- API 增加 LifeArchive 类型 + `ARCHIVE_API` 客户端（初版用 POST 有 bug，后修复为 PATCH）
- 表单改为始终可编辑 + 常驻保存按钮

**真实数据恢复**
- 从备份 JSON (growth-2026-05-22T16-05-13-638Z) 恢复 lmh 完整数据
- 1 个用户、1 个人生目标、15 个年度目标、7 个月度计划、2 条复盘、6 个行为模式
- 修复 PostgreSQL → SQLite 迁移中的 `String[]` → JSON 字符串类型转换
- 修复 Prisma 数据库文件路径问题（实际位置 `prisma/dev.db`）

**Apple 风格样式**
- 主题色从 indigo `#6366f1` 改为 Apple blue `#0071e3`
- 字体改为 SF Pro 系列
- 颜色系统对齐 Apple 设计语言
- 全局字体抗锯齿优化

**复盘链路修复**
- 走通了真实 AI 分析链路：复盘提交 → Claude CLI 分析 → 回写全部服务
- 行为模式追踪（6 条更新）、偏误记录（3 条）、能力评分（4 个维度）
- 后续不允许跳流程

**待办**
- 档案页 3年/1年愿景待用户补充
- 档案摘要待刷新
- 充沛率 4/100 可能偏低，待用户确认调整

### 2026-06-27 — PostgreSQL → SQLite 数据库迁移

**做了什么：**
- 🔄 完成 PostgreSQL → SQLite 数据库迁移（去除 Docker 依赖）
- 核心改动：
  - `backend/prisma/schema.prisma` — provider 改为 sqlite
  - `backend/.env` — `DATABASE_URL` 改为 `file:./dev.db`
  - `docker-compose.yml` — 标记为已弃用（注释掉，留作参考）
  - `scripts/startup.sh` — 去掉 Docker 启动和等待步骤
  - `scripts/shutdown.sh` — 去掉 PostgreSQL 保留提示
  - `scripts/db-backup.sh` / `db-restore.sh` — 改为 SQLite 文件拷贝模式
  - `backend/prisma/seed.ts` — 去掉 `docker exec pg_dump` 备份
  - `backend/package.json` — 去掉依赖 Docker 的 `predev` 备份
  - `README.md` — 更新技术栈、快速开始、架构图
  - `docs/wiki/deployment.md` — 重写为 SQLite 本地部署指南
  - `domain.yaml` — 更新数据库类型

**效果：**
- ✅ 不再需要 Docker Desktop 或任何容器运行时
- ✅ 启动简化：`cd backend && npx prisma db push && npm run dev`
- ✅ 换电脑迁移：拷 `backend/dev.db` 一个文件即可
- ✅ 备份简化：`bash scripts/db-backup.sh` → 直接拷贝 .db 文件
- ✅ 个人电脑资源占用大幅降低（无 Docker 开销）
- ⚠️ SQLite 不支持原生 `String[]`，`goalDomains` 和 `keywords` 改为 JSON 字符串存储，Service 层自动序列化/反序列化

### 2026-06-14

**做了什么：**
上午 — 需求梳理 + 文档：
- 重新梳理了 LifeArchive 完整四层设计（人格特质 / 能力资源 / 历史行为 / 未来蓝图）
- 明确了每层每个模块的录入方式、AI 权限、更新频率、版本保留规则
- 补充了 AI 目标拆解需求（愿景→年度→月度→日计划，AI 建议 → 用户确认）
- 新增了复盘流程改造方案（分析前加载摘要 + 分析后写回三层数据）
- 新增了 AI 提示词工程需求（第一层人格特征 + summary 融入分析 Prompt）
- 新增了 AI 摘要机制（自动生成 + 刷新 API）
- 新增了 User 表合并方案（7 个字段迁移到 LifeArchive，双写→切换→清理）
- 产出了完整需求文档 `planning/life-archive-requirements.md`
- 产出了功能架构图、系统架构图、用户旅程图

下午 — 后端实现（Phase 1-2）：
- ✅ Prisma Schema — LifeArchive 四层 JSON 模型
- ✅ LifeArchive Service — CRUD / 分层更新 / 摘要刷新 / User 迁移
- ✅ LifeArchive Controller + Routes — 10 个 API 端点
- ✅ Claude 调用工具 `utils/claude.ts`
- ✅ AI 目标拆解 Prompt（愿景→年度→月度）
- ✅ 目标拆解 API 端点（suggest + confirm）
- ❌ 未运行 `npx prisma db push`（Docker 不可用，需手动执行）

下午 — 前端原型（Phase 3-4 部分）：
- ✅ `planning/life-archive-prototype.html` — 全站原型（4 个 Tab 页）
- 总览页：新增档案摘要卡片
- 目标页：AI 建议区（咨询 AI → 展示 → 采纳）
- 计划页：Web 端计划编辑 + AI 咨询入口
- 档案页：4 个子标签完整表单

**待确认的前端交互问题：**
- 档案页：MBTI 是四个下拉拼合还是直接选完整类型？
- 档案页：大五人格用滑条还是数字输入？
- 档案页：盖洛普标签式 vs 文本输入？
- 档案页：能力技能用卡片追加还是弹窗？
- 档案页：每个子 Tab 单独保存还是整体保存？
- AI 建议：采纳后直接写入 ACTIVE 还是先 PENDING？
- AI 建议：建议结果如何推送到页面（轮询/WebSocket/手动刷新）？
- 摘要卡片：自动刷新还是每次加载时拉取？

**当前焦点：** 前端交互方式待确认，确认后进入前端开发。

**下一步：**
1. 确认前端各模块交互方式
2. 按确认结果更新原型
3. 写前端代码（ArchivePage + App.tsx 改造 + 总览/目标/计划适配）
4. Prompt 工程 + Bridge 改造（Phase 5-6）
5. User 表合并双写（Phase 7）
6. 测试 + 文档

---

## 相关文档

- [PRD（教练版）](../../planning/v0.1/PRD.md) — 人生教练产品需求
- [Coach Agent](../../../../agents/coach.md) — 教练 agent 定义
- [复盘分析引擎](../../../../agents/coach/core/review-analysis.md) — 分析方法论
- [目标拆解引擎](../../../../agents/coach/core/goal-decompose.md) — 拆解方法论
- [Phase 1 复盘](retros/growth-miniprogram-v0.1-phase1.md) — 上一阶段回顾
