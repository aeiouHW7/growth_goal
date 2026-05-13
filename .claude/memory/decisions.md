# 技术决策记录

## 已确认的架构决策

### 1. 目录分类（2026-05-11）

**决策**: 采用语义化分类，而非平铺
- rules/ → rules/system/ + rules/coding/
- skills/ → skills/system/ + skills/workflow/
- templates/ → templates/domain/ + templates/skill/ + templates/docker/

**原因**:
- 更清晰的职责划分
- 方便扩展
- 降低认知负担

---

### 2. 环境启动模式（2026-05-11）

**决策**: 双模式支持
- 开发模式: 基础设施 Docker 化 + 前后端手动启动（热重载）
- 生产模式: 全部 Docker 化

**原因**:
- 开发效率（热重载）
- 部署一致性（Docker）
- 灵活性

---

### 3. ace-core 定位（2026-05-11）

**决策**: ace-core 是元项目（meta-project）

**作用**:
- 记录 ACE Engine 框架本身的设计
- openspec 记录对引擎的改进
- 不包含业务代码

---

## 已解决的问题

### 1. Domain 目录结构（2026-05-11 解决）

**决策**: 选项 C - 混合方式（核心保留数字）

**最终结构**:
```
domain-name/
├── 10_DOCS/        # 保留数字（强调文档优先，符合 ETHOS）
├── frontend/       # 语义化（开发目录）
├── backend/        # 语义化
├── openspec/       # 语义化（OpenSpec 工作流）
└── 90_PLANNING/    # 保留数字（强调规划阶段）
```

**理由**:
- 10_DOCS: 体现"知识驱动"的 ETHOS 核心，文档优先
- frontend/backend: 开发目录语义化，专业且清晰
- 90_PLANNING: 强调规划的重要性
- 平衡了优先级提示和专业形象

**参考**: dialectical-thinking/references/examples.md 案例 1

---

### 2. 前后端启动方式（2026-05-11 解决）

**决策**: 选项 C - 双模式脚本

**实施方案**:
- `npm run ace:up`: 启动基础设施（PostgreSQL, Redis 等）
- `npm run dev:frontend`: 本地启动前端（热重载）
- `npm run dev:backend`: 本地启动后端（热重载）
- `npm run prod:up`: Docker Compose 全部服务（未来）

**理由**:
- 开发模式优先热重载（开发效率）
- 生产模式保证一致性（Docker 化）
- 简单清晰，不需要复杂的智能编排

**参考**: dialectical-thinking/references/examples.md 案例 2

---

### 3. Domain 模板丰富度（2026-05-11 解决）

**决策**: 选项 C（增强版）- 可选模板 + 默认最佳实践

**实施方案**:
- 默认模板: React + TypeScript + Prisma + PostgreSQL
  - 原因: AI 训练数据最多，生成代码质量最高，类型安全
- ace-init-domain 支持 `--template` 参数
  - `--template react-ts` (默认)
  - `--template vue-ts` (可选)
  - `--template minimal` (只创建目录)

**理由**:
- 基于 AI 效率优先（用户不需要阅读代码，AI 是主要开发者）
- React + TS 训练数据最多，AI 出错率最低
- 仍保留灵活性（可选其他模板）

**对比之前的假设**: 
- ❌ 旧假设: 用户会阅读代码 → 选择简单的 Vue + JS
- ✅ 新假设: AI 是主要开发者 → 选择 AI 最擅长的 React + TS

---

### 4. 辩证思考 Skill 设计（2026-05-11）

**决策**: 采用工具箱模式（Toolbox Mode）+ 渐进式披露

**核心设计**:
- 四阶段工作流: Question → Explore → Compare → Decide
- 提供工作流但允许用户拒绝（灵活，不强迫）
- 参考资料独立文件，按需加载（principles, patterns, examples）
- 激进描述（aggressive description）确保自动触发

**触发策略**:
- 自动触发: 检测到复杂决策、架构设计、技术选型时主动 offer
- 手动触发: 用户可以随时调用"使用辩证思考"
- OpenSpec 集成: 在 Explore 和 Plan 阶段更积极，Apply 阶段避免打断

**文件结构**:
```
skills/coding/dialectical-thinking/
├── SKILL.md                     # 核心工作流（~350 行）
└── references/
    ├── principles.md            # 7 条辩证原则
    ├── patterns.md              # 5 种思考模式
    └── examples.md              # 3 个真实案例
```

**原因**:
- 参考 Anthropic 官方 `doc-coauthoring` 的灵活工作流模式
- 符合 ACE ETHOS 的"辩证思考"核心原则
- 避免 AI 的"执行者模式"，促进多方案探索
- 渐进式披露控制 token 消耗

**影响**:
- 所有复杂决策场景将受益于结构化思考流程
- 可能降低"过度服从"和"单一路径依赖"问题
- 为其他 Skills 提供了设计参考（工具箱模式 + 渐进披露）

### 5. 阶段 2 任务优先级（2026-05-11）

**决策**: 按 P0 → P1 → P2 → P3 顺序执行

**P0（核心质量）** - ✅ 已完成:
- ✅ Error Boundary
- ✅ .gitignore
- ✅ README 文档
- ✅ Prettier 配置

**P1（开发体验）** - ✅ 已完成:
- ✅ ESLint 配置（前后端）
- ✅ Winston 日志系统
- ✅ 环境变量验证
- ✅ .env.example 文件

**P2（功能完善）** - ✅ 已完成:
- ✅ 基础测试（Jest + Supertest, 13 个测试用例）
- ✅ 性能优化（node-cache 响应缓存）
- ✅ 文档补充（CONTRIBUTING.md）

**P3（扩展功能）** - 待定:
- 更多示例
- CI/CD
- 监控

**原因**: 
- P0 确保基础质量
- P1 提升开发体验
- P2 完善功能和性能
- P3 可根据需要灵活调整

---

### 6. 响应缓存策略（2026-05-12）

**决策**: 使用 node-cache 实现内存缓存

**实施方案**:
- GET 请求自动缓存 60 秒
- 写操作（POST/PUT/DELETE）自动清除相关缓存
- 支持模式匹配清除缓存
- DEBUG 日志记录缓存命中/未命中

**技术选择对比**:
- ✅ node-cache: 轻量、简单、无外部依赖
- ⚠️ Redis: 过度设计，需要额外服务
- ⚠️ memory-cache: 功能较少

**理由**:
- MVP 阶段优先简单可靠
- 内存缓存足够满足单实例需求
- 自动过期机制避免脏数据
- 未来可平滑升级到 Redis（分布式场景）

---

**更新时间**: 2026-05-12  
**状态**: P0 + P1 + P2 完成 ✅
