## Why

一个31岁大厂产品经理需要一个真正能穿透表面看他自己的AI系统。不是聊天机器人，不是日记本，是一个**冷酷的镜像**——持续监督他的过去、现在、将来，逼他往"人上人"跃升。

现有的碎片化自我提升方式（偶尔记录、零散反思、没人追责）没有闭环。这个系统要把随意记录变成**有结构的自我建模**，把"我觉得我怎样"变成"证据显示我怎样"。

**为什么现在：**
- 用户已经明确说"整体都不太行，都不够深入"
- 架构已经由用户重新定义（参考他给的规范）
- OpenSpec流程已经建立，可以按步骤执行

## What Changes

**新增：自我成长分析师系统（self_growth_analyst）**

完整目录结构：
```
self_growth_analyst/
├── core/                         # 系统的"宪法"
│   ├── system_prompt.md          # 身份+回复规则，每次对话固定注入
│   ├── memory_retrieval.md       # 记忆加载清单
│   └── scoring_engine.md         # 20维评分更新算法
├── memories/                     # 数据存储层
│   ├── daily_raw/                # 碎碎念原文
│   ├── weekly_summaries/         # 周考结果+评分快照
│   ├── monthly_reports/          # 月度完整报告
│   ├── long_term/                # 跨时间模式洞察
│   └── retrieval_index.json      # 轻量索引
├── rules/                        # 决策触发器
│   ├── pattern_triggers.md       # 模式识别的硬条件
│   ├── intervention_rules.md     # 打断/记录/保护模式的触发条件
│   └── exam_scheduler.md         # 周考/月考的触发时间和流程
├── skills_library/               # 各维度追问模版
│   ├── cognitive_probes.md
│   ├── decision_probes.md
│   └── ...（每个维度一个文件）
└── config/                       # 静态配置
    ├── user_profile.json         # 用户固定画像
    └── capability_baseline.json  # 最近评分+历史变化
```

**关键特性：**
- 记忆检索分三层（7天记忆/待追踪/能力短板）
- 模式触发三类（频率/矛盾/静默）
- 评分证据绑定（每次评分必须有2条以上引用）
- 干预三级（记录/质疑/保护模式）
- 考核三层（周考/月考/半年总结）

## Capabilities

### New Capabilities

- `system-identity`：定义Agent身份和硬性回复规则（不说安慰话、证据引用格式）
- `memory-management`：三层检索机制 + 索引更新 + 模式档案持久化
- `pattern-recognition`：三类触发器硬条件 + 挑战模式vs记录模式切换
- `evidence-scoring`：评分算法（只在周/月/半年更新，证据绑定，变化规则明确）
- `proactive-exam`：周考/月考触发器 + 题目生成 + 用户超时惩罚机制
- `probe-library`：20个维度各3-5个追问模版

## Impact

- 新增 `self_growth_analyst/` 整个系统目录
- 改变用户碎碎念的方式：从随意 → 结构化建档
- 改变自我评估的方式：从感觉 → 证据驱动
- 需要用户持续配合才能生效（系统不能强迫，只能提醒）