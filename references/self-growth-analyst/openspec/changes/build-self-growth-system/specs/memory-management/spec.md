# memory-management

## ADDED Requirements

### Requirement: 每次对话前必须加载三层记忆

系统 SHALL 在每次对话开始时按顺序加载以下内容：

**第一层：最近7天的碎碎念**
- 读取 `memories/daily_raw/` 中最近7个文件
- 提取【内容】和【我的洞察】字段
- 若总字数超过2000 tokens（约1500汉字），优先裁剪"内容"，保留"洞察"

**第二层：上次未解决的"待追踪"**
- 从最新的 `weekly_summaries/` 或 `monthly_reports/` 中扫描 `## 待追踪` 段落
- 按时间排序（最久的在前）

**第三层：最低分三维度**
- 读取 `config/capability_baseline.json` 中的 `lowest_three_dimensions`
- 作为本次重点关注维度

#### Scenario: 正常对话前的记忆加载
- **WHEN** 用户发送任何内容
- **THEN** 系统首先加载上述三层内容作为上下文注入
- **AND** 自检：近7天记忆、待追踪问题、能力短板是否全部加载
- **IF** 任何一层缺失，THEN 记录警告但不阻断对话

#### Scenario: 记忆超长时的压缩
- **WHEN** 近7天记忆总字数超过2000 tokens
- **THEN** 系统执行压缩：
  - 每条碎碎念压缩为一句话摘要+洞察
  - 同维度合并
  - 重复出现的只保留最新一条（标记出现次数）
- **AND** 压缩后仍保留足够判断上下文

### Requirement: 碎碎念记录格式标准化

每次收到碎碎念后，系统 SHALL 立即保存到 `memories/daily_raw/YYYY-MM-DD.md`，格式：

```markdown
# [日期] 碎碎念记录

## 内容
（用户原文，不做任何修改）

## 维度标签
- 涉及的维度：认知，执行，决策

## 立即洞察
- 他自己没意识到的东西：...
- 什么模式：...
- 什么缺失：...

## 待追踪
- 下次追问：...
```

#### Scenario: 新碎碎念到达时的记录流程
- **WHEN** 用户发送碎碎念
- **THEN** 系统立即保存原始内容到当日文件
- **AND** 自动打维度标签
- **AND** 写下"立即洞察"（2-4条）
- **AND** 判断是否需要加入 `[待追踪]` 标记

### Requirement: 检索索引实时更新

每次碎碎念记录后，系统 SHALL 更新 `memories/retrieval_index.json`：
- 按维度标记出现日期
- 记录模式出现次数
- 标记待追踪问题

#### Scenario: 索引更新
- **WHEN** 新的碎碎念被记录
- **THEN** 更新 `retrieval_index.json` 的 dimensions、patterns、pending_tracking 字段
- **AND** 确保索引与实际文件内容一致

### Requirement: 模式档案长期存储

跨时间发现的模式必须永久写入 `memories/long_term/pattern_<简述>.md`，格式：

```markdown
# 模式名称：[描述]

## 首次发现：YYYY-MM-DD
## 证据链接：XXXX碎碎念、XXXX周考回答
## 后续验证：YYYY-MM-DD再次出现
## 当前状态：仍在重复 / 已改善（YYYY-MM-DD）
```

#### Scenario: 新模式写入
- **WHEN** pattern_triggers 识别到新的模式
- **THEN** 将模式写入 `memories/long_term/pattern_<简述>.md`
- **AND** 不覆盖已有模式，追加写入
- **AND** 每个文件只记录一个跨月模式

---

## REMOVED Requirements

### Requirement: 临时笔记不过滤

**Reason**: 新架构中所有内容都必须结构化存储，不允许临时笔记存在