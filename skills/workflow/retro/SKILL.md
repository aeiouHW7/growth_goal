---
name: retro
description: 变更复盘和经验总结 - 从已完成的变更中提取经验、识别模式、优化流程。Use after completing changes to extract lessons learned and improve processes.
license: MIT
compatibility: Requires ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
---

# retro - 变更复盘和经验总结

从已完成的变更中提取经验、识别模式、沉淀最佳实践，持续优化开发流程。

## 触发条件

- 用户说"复盘 XX 变更"、"总结经验"
- 重要变更完成后（复杂度：复杂）
- 发现反复出现的问题
- 里程碑节点（版本发布前）

## 前置检查

**建议**：变更已归档（openspec/archive/ 中存在）

**可选**：正在进行的变更也可复盘（阶段性总结）

---

## 执行流程

### 1. 选择复盘对象

确定复盘范围：

| 范围 | 输入 | 典型场景 |
|------|------|---------|
| **单个变更** | 变更名 | 复杂功能完成后 |
| **多个变更** | 标签/时间段 | 版本发布前 |
| **项目整体** | 无 | 项目里程碑 |

**输出示例**：
```
🔍 复盘对象：单个变更
- 变更名：add-user-auth
- 状态：已归档（2026-05-10）
- 复杂度：复杂
- 耗时：5 天
```

### 2. 收集数据

**变更元数据**（从 openspec/archive/）：
```bash
# 1. 读取归档的 artifacts
ls openspec/archive/*/

# 2. 提取关键信息
cat openspec/archive/<date>-<name>/proposal.md  # 目标和范围
cat openspec/archive/<date>-<name>/tasks.md     # 实际工作量
cat openspec/archive/<date>-<name>/design.md    # 技术决策
```

**状态日志**（从 .claude/state/）：
```bash
# 3. 提取流程数据
jq 'select(.change=="<name>")' .claude/state/*.jsonl
```

**Git 历史**：
```bash
# 4. 变更的提交历史
git log --all --grep="<name>" --oneline
git diff <start-commit>..<end-commit> --stat
```

**度量数据**（可选）：
- 代码行数变化
- 文件数
- 测试覆盖率变化
- 实际耗时 vs 预估耗时

### 3. 四维分析

**W.W.L.D 框架**（What Went Well / What Went Wrong / Lessons / Decisions）

#### 3.1 What Went Well ✅

识别成功因素：

**问题**：
- 哪些做得好？为什么？
- 哪些预测准确？
- 哪些工具/方法有效？

**输出示例**：
```
✅ What Went Well

**规划阶段**：
- 提前识别了复杂度（复杂变更）
- design.md 中的 JWT 设计清晰，实现时无返工

**实现阶段**：
- 单例模式（utils/prisma.ts）避免重复实例化
- review 自动发现并修复了 3 个潜在问题

**流程工具**：
- ace-propose 的复杂度评估准确（实际耗时 5 天，预估 4-6 天）
- verify 强制运行测试，覆盖率达 85%（要求 80%）
```

#### 3.2 What Went Wrong ❌

识别问题和瓶颈：

**问题**：
- 哪里卡住了？为什么？
- 哪些预测失误？
- 哪些返工了？

**输出示例**：
```
❌ What Went Wrong

**规划阶段**：
- proposal.md 未明确第三方登录优先级（GitHub OAuth 后补）
- 低估了 JWT 刷新机制的复杂度（预估 1 天，实际 2 天）

**实现阶段**：
- 首次 apply 时忘记添加 .env 环境变量，导致测试失败
- review 发现密码哈希算法不符合 OWASP 标准（返工 0.5 天）

**工具问题**：
- verify 阶段 jest 配置冲突，浪费 1 小时调试
```

#### 3.3 Lessons Learned 📚

提炼经验和模式：

**问题**：
- 这次学到了什么？
- 有哪些可复用的模式？
- 如何避免类似问题？

**输出示例**：
```
📚 Lessons Learned

**技术经验**：
- JWT 刷新令牌需要考虑并发场景（多设备登录）
- Prisma 单例模式是必需的（避免连接池耗尽）
- 密码哈希：bcrypt + 10 轮（OWASP 标准）

**流程经验**：
- 复杂变更必须完整流程（propose → apply → review → verify → archive）
- 环境变量应在 proposal 阶段明确（.env.example 同步更新）
- review 自动修复能力强，但需人工确认（单例模式自动创建很准确）

**可复用模式**：
- 单例工具类：utils/prisma.ts、utils/redis.ts（模板）
- JWT 中间件：可作为 10_DOCS/patterns/ 沉淀
```

#### 3.4 Decisions to Make 🎯

识别待改进点：

**问题**：
- 哪些流程需要调整？
- 哪些规范需要补充？
- 哪些工具需要优化？

**输出示例**：
```
🎯 Decisions to Make

**流程改进**：
- [ ] proposal.md 模板添加"环境变量"章节
- [ ] 复杂变更强制要求 design.md 包含状态图

**规范补充**：
- [ ] 沉淀 JWT 最佳实践到 10_DOCS/patterns/jwt-auth.md
- [ ] 更新 domain.yaml coding_standards（添加密码哈希规范）

**工具优化**：
- [ ] 改进 ace-propose 提示：复杂变更提醒预留缓冲时间
- [ ] verify Skill 添加 jest 配置检查（自动修复 ESM 冲突）
```

### 4. 沉淀最佳实践

根据 Lessons 沉淀可复用知识：

**目标目录**：`10_DOCS/patterns/` 或 `10_DOCS/retrospectives/`

**沉淀类型**：

| 类型 | 沉淀位置 | 典型内容 |
|------|---------|---------|
| **技术模式** | 10_DOCS/patterns/ | 单例、中间件、错误处理 |
| **流程经验** | 10_DOCS/retrospectives/ | 复盘报告、经验总结 |
| **规范更新** | domain.yaml | 编码规范、测试标准 |

**输出示例**：
```bash
# 1. 沉淀 JWT 模式
cat > 10_DOCS/patterns/jwt-auth.md <<EOF
# JWT 认证最佳实践

**变更来源**：add-user-auth（2026-05-10）

## 核心模式

**Access Token + Refresh Token**：
- Access Token：短期（15分钟），携带用户信息
- Refresh Token：长期（7天），仅用于刷新

## 实现要点

**1. 密码哈希**：
\`\`\`typescript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10); // 10 轮
\`\`\`

**2. JWT 签名**：
\`\`\`typescript
const token = jwt.sign({ userId }, secret, { expiresIn: '15m' });
\`\`\`

**3. 并发刷新**：使用 Redis 锁避免重复刷新

## 避坑指南

- ❌ 不要在 JWT 中存储敏感信息（密码、权限细节）
- ✅ 使用 HTTPS 传输
- ✅ Refresh Token 存储在 HttpOnly Cookie
EOF

# 2. 沉淀复盘报告
cat > 10_DOCS/retrospectives/2026-05-12-add-user-auth.md <<EOF
# 变更复盘：add-user-auth

**日期**：2026-05-12
**变更**：add-user-auth
**复杂度**：复杂
**耗时**：5 天（预估 4-6 天）

## ✅ What Went Well
[...]

## ❌ What Went Wrong
[...]

## 📚 Lessons Learned
[...]

## 🎯 Decisions to Make
[...]
EOF
```

### 5. 更新规范和流程

根据 Decisions 更新配置：

**domain.yaml**：
```yaml
# 添加新的编码规范
coding_standards:
  security:
    - "密码哈希：bcrypt + 10 轮（OWASP）"
    - "JWT：Access Token 15分钟，Refresh Token 7天"
```

**模板更新**：
```bash
# 更新 proposal 模板（如果有）
# 添加"环境变量"章节提示
```

### 6. 输出复盘总结

生成简洁的复盘摘要：

```
## Retro: add-user-auth

**变更**：add-user-auth（2026-05-10）
**复杂度**：复杂
**耗时**：5 天（预估 4-6 天，准确度 ±20%）

### ✅ 亮点
- 复杂度评估准确
- review 自动修复 Prisma 单例
- 测试覆盖率 85%（高于要求）

### ❌ 问题
- 低估 JWT 刷新机制（+1 天）
- 密码哈希不符合标准（返工 0.5 天）

### 📚 经验
- JWT 模式已沉淀：10_DOCS/patterns/jwt-auth.md
- 单例模式模板可复用

### 🎯 改进
- [x] 沉淀 JWT 最佳实践
- [ ] 更新 domain.yaml（密码规范）
- [ ] proposal 模板添加环境变量提示

---

💡 下一步：
1. 应用改进措施（更新配置）
2. 分享给团队（如果有）
```

---

## 复盘模板

### 单个变更复盘

```markdown
# 变更复盘：<变更名>

**日期**：<复盘日期>
**变更**：<变更名>
**状态**：已归档 / 进行中
**复杂度**：简单 / 中等 / 复杂
**耗时**：<实际> 天（预估 <预估> 天）

---

## 📊 基础数据

| 指标 | 数值 |
|------|------|
| 提交数 | N |
| 文件变更 | +X -Y |
| 代码行数 | +A -B |
| 测试覆盖率 | X% |
| 流程阶段 | propose → apply → review → verify → archive |

---

## ✅ What Went Well

**规划阶段**：
- [成功点 1]
- [成功点 2]

**实现阶段**：
- [成功点 3]

**工具流程**：
- [成功点 4]

---

## ❌ What Went Wrong

**规划阶段**：
- [问题 1]

**实现阶段**：
- [问题 2]

**工具问题**：
- [问题 3]

---

## 📚 Lessons Learned

**技术经验**：
- [经验 1]
- [经验 2]

**流程经验**：
- [经验 3]

**可复用模式**：
- [模式 1] → 已沉淀到 10_DOCS/patterns/

---

## 🎯 Decisions to Make

**流程改进**：
- [ ] [改进 1]
- [ ] [改进 2]

**规范补充**：
- [ ] [规范 1]

**工具优化**：
- [ ] [优化 1]

---

## 📝 沉淀清单

- [x] 10_DOCS/patterns/<pattern>.md
- [x] 10_DOCS/retrospectives/<retro>.md
- [ ] domain.yaml 更新
- [ ] 模板更新
```

### 多个变更复盘（里程碑）

```markdown
# 里程碑复盘：v1.0 发布

**时间段**：2026-04-01 ~ 2026-05-12
**变更数**：15 个
**总耗时**：42 天

---

## 📊 统计

| 复杂度 | 变更数 | 平均耗时 | 流程完整率 |
|--------|--------|---------|-----------|
| 简单   | 5      | 0.5 天  | 80% (无 review) |
| 中等   | 7      | 2 天    | 100% |
| 复杂   | 3      | 5 天    | 100% |

---

## 🎯 目标达成

- ✅ 用户认证系统
- ✅ TODO CRUD
- ✅ 健康检查
- ⏳ 第三方登录（延后到 v1.1）

---

## 🔍 问题模式

**反复出现**：
1. 环境变量遗漏（3 次）→ 已添加到 proposal 模板
2. jest 配置冲突（2 次）→ verify 已增强检查

**流程优化**：
- 复杂变更的 verify 强制执行效果好（0 次生产故障）
- review 自动修复节省时间（平均 0.5 天/变更）

---

## 📚 沉淀成果

- 10_DOCS/patterns/：5 个模式
- domain.yaml：编码规范更新 3 次
- 测试覆盖率：60% → 85%

---

## 🎯 v1.1 改进

- [ ] proposal 模板强化（环境变量、依赖检查）
- [ ] verify 自动修复 jest 配置
- [ ] 增加 investigate Skill 使用（问题定位更快）
```

---

## 护栏

- 基于数据，不主观臆断
- 区分"问题"和"改进机会"（不是所有 Went Wrong 都需要立即修复）
- 沉淀可复用模式，不是流水账
- 改进措施要具体可执行
- 不在复盘阶段实现改进（记录到 Decisions，后续 propose）

---

## 与其他 Skills 的关系

```
retro（变更复盘）
  ├─ 提取经验 → 沉淀到 10_DOCS/patterns/
  ├─ 识别改进 → propose（创建优化提案）
  └─ 更新规范 → domain.yaml、模板
```

**何时使用 retro**：
- 复杂变更完成后（单个）
- 版本发布前（多个）
- 发现反复问题（模式识别）

**何时跳过 retro**：
- 简单变更（不值得复盘）
- 时间紧迫（快速迭代阶段）

---

## 复盘频率建议

| 节点 | 复盘范围 | 频率 |
|------|---------|------|
| 复杂变更完成 | 单个变更 | 每次 |
| 中等变更完成 | 单个变更 | 可选 |
| 简单变更完成 | 不复盘 | - |
| 版本发布 | 里程碑 | 每次 |
| 季度回顾 | 项目整体 | 每季度 |
