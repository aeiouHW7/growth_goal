## Why

经过4年大厂产品经理的自我成长系统 build 阶段，self-growth-analyst 项目存在4类根本性问题：** cron未配置**（周考月考无法自动触发）、**probe缺乏进化机制**（用死的题库测活的人）、**洞悉能力未验证**（skill和agent的调用链未打通）、**系统是骨架没有血管**（文件齐全但没有自动运行的管道）。这个系统看起来完整，但跑不起来。

## What Changes

### 系统缺失补齐（Task 1）
- 配置周考cron：每周日21:00自动触发，从probe库抽题发给用户
- 配置月考cron：每月最后一天20:00，生成20维评分报告
- 配置碎碎念提醒：21:30未分享则提醒一次
- 补齐cron调度与skill触发之间的桥接逻辑（cron event → 生成周考题目 → 发送消息 → 记录回答）

### Probe动态进化机制（Task 2）
- 为19个probe文件建立"用户回答质量评估"后的进化触发机制
- 定义触发时机：用户回答"太水"（一句话回答/回避）连续2次 → 升级问题难度或换题
- 定义进化维度：问题变锋利 / 场景更具体 / 去掉被回避的问题 / 增加矛盾探测深度
- 新增 `evolution_triggers.md` 规范进化规则

### 洞悉能力验证与补齐（Task 3）
- 验证SKILL.md中的碎碎念处理流程是否完整覆盖"记录→洞察→追踪"全链路
- 补齐缺失的自动洞察生成逻辑（每次碎碎念后自动产出洞察，而不是靠人工）
- 补齐"每周从probe库抽题生成周考卷"的自动化逻辑
- 验证20维评分在真实对话中的运行效果

### Agent/Skill调用链检查与补齐（Task 4）
- 确认skill在OpenClaw中的注册状态（是否能被正确触发）
- 确认cron到skill之间的调用链（cron触发 → skill执行 → 消息发送 → 记忆更新）
- 补齐缺失的调用环节

## Capabilities

### New Capabilities

- `cron-scheduler`: 配置和管理所有定时任务（周考/月考/提醒），包括cron到skill的桥接
- `probe-evolution`: 建立probe问题的动态评估和进化机制，定义触发条件和进化方向
- `auto-insight`: 每次碎碎念后自动生成"他没意识到的东西"洞察，无需人工
- `weekly-exam-generator`: 每周自动从probe库抽题生成周考卷，包含综合题
- `skill-health-check`: 验证skill和cron调用链是否完整，建立自检机制

### Modified Capabilities

- `碎碎念处理流程`（修改）：现有流程只有"记录"有自动化，"洞察生成"和"追踪标记"需要补自动化逻辑
- `周考触发`（修改）：现有exam_scheduler.md只有规则描述，没有cron配置和自动发题逻辑

## Impact

- 需要在OpenClaw中配置3个新的cron job（周考、月考、提醒）
- `skills_library/*.md` 19个probe文件在达到特定条件后会触发进化更新
- 新增 `evolution_triggers.md` 规范文件
- 新增 `auto_insight_generator.md` 规范自动洞察生成逻辑
- SKILL.md可能需要小幅更新以对齐新的自动化流程
