## Context

self-growth-analyst 是一个"每周主动考用户"的成长系统。目标是比用户更了解他自己。

**当前状态：**
- 文件齐全（SKILL.md、19个probe、评分系统、规则文件）
- 但cron未配置 → 周考月考无法自动运行
- probe是静态文件库 → 无法根据用户回答动态调整
- 缺乏自动洞察生成 → 全靠人工每次手写
- skill调用链未验证 → 可能存在"cron触发→skill执行→消息发送"的断点

**约束：**
- OpenClaw cron 只支持 systemEvent 和 agentTurn 两种 payload
- Feishu 消息通过 message tool 发送
- Skill 执行在主 session 内，不支持独立进程

---

## Goals / Non-Goals

**Goals:**
- 让系统真正跑起来：cron → skill → 消息 → 记忆 完整链路
- 建立probe动态进化机制，不用手工维护题库
- 自动洞察生成，减少人工干预
- 可验证的调用链，每步都可检查

**Non-Goals:**
- 不改动SKILL.md的核心身份定义（犀利直接）
- 不做多agent并行（单session顺序执行足够）
- 不做外部API集成（纯本地文件+OpenClaw能力）

---

## Decisions

### Decision 1: Cron 到 Skill 的桥接方式

**选择：cron payload=agentTurn，sessionTarget=isolated**

| 方案 | pros | cons |
|------|------|------|
| systemEvent → 主session | 共享上下文 | 主session可能正忙，消息顺序混乱 |
| agentTurn → isolated | 独立运行，不干扰主session | 需要消息传递协议 |
| **agentTurn → isolated（最终）** | 解耦，不丢消息 | 需要处理消息发送 |

每次cron触发：
1. isolated session 启动
2. 加载SKILL.md和必要的memory文件
3. 生成内容（周考题/月报/提醒）
4. 通过message tool发送到Feishu
5. 更新memory文件
6. session结束

**注意：** OpenClaw cron 的 agentTurn 默认 delivery=announce，会自动发送到 chat。但周考/月考需要格式化内容而不是简单 announce。需要设置 delivery.mode=none，然后手动调用 message tool 发送。

---

### Decision 2: Probe 进化触发机制

**触发条件（满足任一）：**
1. 用户在某维度连续2次回答"假阳性"（一句话回答/明显回避）
2. 用户主动说"这个问题没意思"或类似反馈
3. 周考/月考中某维度得分连续2次无变化且处于danger zone（<6分）

**进化方向：**
- 难度升级：问题更直接/更具体
- 场景替换：换成用户实际遇到的场景
- 角度转换：从"问行为"改为"问动机"或"问后果"
- 矛盾升级：增加矛盾探测的层次

**不自动进化的情况：**
- 用户只是回答简短（可能是思考中）
- 只有1次回避（可能是偶然）
- 涉及情绪低谷（保护模式期间不触发进化）

**进化后的probe文件如何更新：**
- 原始版本保留在 `skills_library/archive/`
- 新版本覆盖原文件
- 在文件头部添加 `<!-- 进化记录：YYYY-MM-DD 原因：... -->`

---

### Decision 3: 自动洞察生成逻辑

**每次碎碎念后的洞察生成规则：**

```
输入：用户碎碎念文本
输出：3段式洞察（他没意识到的 / 什么模式 / 什么缺失）

规则：
1. "他没意识到的" → 找言外之意（说了A但可能在想B）
2. "什么模式" → 找重复信号（7天内是否出现过类似话题）
3. "什么缺失" → 找与目标/能力的差距（他说想成富人但没提商业行动）

限制：
- 每个洞察不超过3句话
- 不做预测，只做观察
- 保护模式期间洞察只记录不外化
```

**自动化实现：**
- 每次主session收到碎碎念 → 自动调用洞察生成
- 不需要cron，嵌入在skill的碎碎念处理流程中
- 生成结果写入当日碎碎念记录的 `## 立即洞察` 字段

---

### Decision 4: Skill 调用链验证机制

**完整调用链：**
```
[用户碎碎念] 
  → 主session接收 
  → 加载memory三层（近7天/待追踪/最低分/长期模式）
  → 按SKILL.md规则判断（记录 vs 回应 vs 打断）
  → 执行对应动作（记录到文件 / 调用message发送 / 触发挑战模式）
  → 更新retrieval_index.json

[周考cron: 每周日21:00]
  → cron触发isolated session
  → 加载本周所有碎碎念 + 上次评分
  → 生成周考题（3维度×1题 + 1综合题）
  → message tool发送
  → 等待用户回答（24h超时）
  → 更新周考记录

[月考cron: 每月最后一天20:00]
  → cron触发isolated session
  → 汇总本月所有数据
  → 运行评分引擎
  → 生成月报 + 下月重点
  → message tool发送

[提醒: 每日21:30]
  → cron触发isolated session
  → 检查今日是否有碎碎念
  → 无 → 发送一条提醒（简短，一条）
  → 有 → 不发
```

**自检机制：**
- 每次cron运行后，在cron job的state里记录执行状态
- 连续3次cron失败 → 触发告警，通知用户skill需要检查

---

## Risks / Trade-offs

**[Risk] isolated session 没有主session的完整上下文**
→ Mitigation：isolated session 启动时明确加载必要文件（SKILL.md + 近7天memory + 当前评分）

**[Risk] 周考生成的问题质量不稳定**
→ Mitigation：先用规则生成（固定抽题逻辑），暂不用LLM自由发挥，后续迭代

**[Risk] probe进化可能让问题越来越难导致用户流失**
→ Mitigation：进化有下界（最基础的问题不能删），且需要用户连续2次假阳性才触发

**[Risk] 每日提醒变成骚扰**
→ Mitigation：每天只发一条，且22:10后不再发；用户已读未回不重发

**[Risk] cron时间用户可能不在中国时区**
→ Mitigation：cron tz=Asia/Shanghai，remind_time=22:10(UTC+8)，与用户timezone一致

---

## Open Questions

1. **周考题是固定抽题还是LLM生成？**
   当前 decision：规则抽题（从对应维度probe文件随机抽1题）+ 1道综合题（规则生成模板）
   后续可根据效果迭代

2. **月考评分的证据不足时怎么办？**
   规则：证据不足的维度标注 `[待验证]`，用户可在月考前补充碎碎念

3. **probe进化后是否需要用户确认？**
   当前 decision：自动进化，不打扰用户。进化结果在月报里向用户汇报
