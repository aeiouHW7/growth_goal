## Context

v3.0架构审查发现5个问题，按优先级分两批实施。本设计针对P0+P1+P2问题（P3 OCEAN映射需要90天数据，本次不实施）。

## Goals / Non-Goals

**Goals:**
- P0: 创建bootstrap_sequence让系统从零数据激活
- P1: 创建tiered_loading策略，防止上下文溢出
- P1: 修复SKILL.md和orchestrator_prompt.md的版本不一致
- P2: 创建financial_metrics数据结构（但不要求用户立即填真实数据）
- P2: 创建wealth_engine.md月度财富健康度报告

**Non-Goals:**
- 不实施P3 OCEAN映射（需要90天数据积累，本次只写映射表规格，实际计算等数据够了再做）
- 不做插件化架构重写（保持在文本prompt系统，插件化是后续Phase 2）

## Decisions

### D1: bootstrap_sequence 放在 scripts/ 而不是 core/

**决策**: 创建 `scripts/bootstrap_system.md` 而不是 `core/bootstrap.md`

**原因**: bootstrap是一次性执行序列，不是常驻引擎。放在scripts/更符合语义。

**触发时机**: 
- 系统首次激活时（.orchestrator_state.json 中无 data_accumulation_start 时）
- 可以手动触发（用户说"跑一下系统健康检查"）

### D2: 分级加载在 orchestrator_prompt.md 中实现，不在 SKILL.md

**决策**: 分级加载策略写入 `core/orchestrator_prompt.md` 的新增章节

**原因**: 
- SKILL.md是高位描述，不需要精确到引擎加载级别
- orchestrator_prompt.md是执行规格，更适合放技术细节
- SKILL.md保持7步结构（用户视角），orchestrator_prompt.md内部用分级加载（系统视角）

**实现**: 每个引擎的调用增加条件判断：
```
IF engine_type == "L1" THEN always_load()
IF engine_type == "L2" AND keyword_triggered THEN load()
IF engine_type == "L3" THEN only_load_if(cron_triggered OR exam_mode)
```

### D3: 两文件一致性通过"互指注释"解决，不合并文件

**决策**: SKILL.md和orchestrator_prompt.md各自增加引用注释，保持独立

**原因**:
- SKILL.md有Step 7保护模式（orchestrator_prompt.md没有），所以SKILL.md不能简化成6步
- 用户需要SKILL.md的高位描述，执行者需要orchestrator_prompt.md的精确规格
- 两个文件服务不同目的，合并反而降低可读性

**实现**:
```
SKILL.md 开头: <!-- 执行规格见 core/orchestrator_prompt.md，本文件为高位描述 -->
orchestrator_prompt.md 开头: <!-- 高位描述见 SKILL.md，本文件为精确执行规格 -->
```

### D4: financial_metrics.json 用户自愿填写，不强制

**决策**: financial_metrics.json创建结构但initial_current=null，要求用户主动提供数据

**原因**:
- 用户是31岁PM，真实财务数据敏感（不想让系统知道具体数字）
- 系统不能强制用户填写真实数字
- 但当用户提到财务相关碎碎念（买了什么/投资了什么），系统可以从碎碎念提取补充

**实现**: 
- 初始状态全部为null
- 用户可以主动更新financial_metrics.json
- 碎碎念中出现投资/收入相关关键词时，wealth_engine可以推断填充

### D5: wealth_engine 作为月度cron触发引擎，不随碎碎念加载

**决策**: wealth_engine是L3周期引擎，只在每月cron时运行

**原因**:
- 财富健康度报告需要完整月份数据，不适合实时
- L3引擎不占用日常碎碎念的上下文空间

## Risks / Trade-offs

[风险] 用户没有碎碎念数据，bootstrap_sequence 无数据可跑 → 缓解：直接进入"待数据积累"状态，不报错

[风险] financial_metrics用户不填，变成摆设 → 缓解：在碎碎念中提取关键词补充，不需要用户主动

[风险] 分级加载增加调度复杂度 → 缓解：分级逻辑写死在orchestrator_prompt.md，调度器只需按规则执行

## Migration Plan

**本轮（P0+P1+P2）：**
1. 创建 scripts/bootstrap_system.md
2. 更新 core/orchestrator_prompt.md（分级加载章节 + 互指注释）
3. 更新 SKILL.md（互指注释）
4. 创建 config/financial_metrics.json
5. 创建 core/wealth_engine.md
6. 更新 core/big_five_ocean.md（写映射表规格，但不启用计算）

**后续（P3 OCEAN映射）：**
- 等90天数据积累够了，再启用big_five_ocean的映射计算