## Context

系统存在执行断层。用户碎碎念有数据（retrieval_index记录了6个模式，working_context有评分），但daily_raw/为空，导致整个评分链断裂。这和用户高频模式"知道但不做"形成自检信号——系统自身也有同样的问题。

## Goals / Non-Goals

**Goals:**
- P0: 修复Archivist写入，逆向重建daily_raw
- P1: 让baseline脱离0状态，seeding working_context评分
- P1: 同步orchestrator_state真实状态
- P3: 补全big_five_ocean.md映射表

**Non-Goals:**
- 不改SKILL.md或orchestrator_prompt.md（已经是最新）
- 不做复杂的数据库迁移（保持文件系统的轻量）
- OCEAN计算暂不启用（需要90天数据），但映射表规格先写入

## Decisions

### D1: 逆向重建用"骨架+标注"而非完整回放

**决策**: 重建的daily_raw文件标记为[重建]，不试图还原完整碎碎念内容

**原因**:
- 真实碎碎念内容已经不可追溯（只留下了模式记录）
- 生成假数据会污染真实数据追踪
- 用骨架+标注，系统知道这是回填的，不会当作真实行为证据

**实现**:
```markdown
## [日期] 碎碎念 [重建]

来源: retrieval_index逆向重建
数据可信度: [骨架-待验证]

### 维度触发记录
- execution: 触发于"知道但不做"模式（频率7次）
- communication: 触发于"表达不清晰自知"模式（频率2次）
- political_wisdom: 触发于模式（频率1次）
```

### D2: scoring_engine seeding用"就高原则"

**决策**: working_context中的评分高于baseline时，将working_context的值seeding写入baseline

**原因**:
- working_context是近期对话中形成的评分，有上下文支撑
- baseline初始为0没有任何信息量
- seeding让系统从"有意义的起点"开始追踪

**实现**:
```
IF baseline.current_score == 0 AND working_context.current_score > 0:
    baseline.current_score = working_context.current_score
    baseline.history.append({"source": "working_context_seeding", "date": <today>})
```

### D3: orchestrator_state同步用"推断+确认"模式

**决策**: data_accumulation_weeks从retrieval_index最早日期推算，不强制要求精确值

**原因**:
- retrieval_index记录了最早和最晚模式出现日期
- 这个日期差可以推断数据积累周期
- 允许有±1周的误差（毕竟不是精确记录）

**实现**:
```
earliest_date = retrieval_index.patterns中最早日期
today = today
data_accumulation_weeks = (today - earliest_date).days / 7
```

### D4: 元一致自检信号

**决策**: 当系统检测到"知道但不做"模式时，主动检查自身执行链路

**原因**:
- 这是一个有价值的自检机会——用户的问题也是系统的问题
- 可以发现其他类似的"定义但未执行"模式
- 形成自我修复能力

**实现**:
```
IF 用户提到"知道但不做"模式:
    THEN 检查自身:
        - daily_raw有没有写入？
        - baseline有没有同步？
        - pending_actions有没有追踪？
    IF 发现断裂:
        THEN 触发自愈流程（调用bootstrap逆向重建）
```

## Risks / Trade-offs

[风险] 逆向重建的数据不是真实碎碎念 → 缓解：骨架+[重建]标注，不参与真实行为评分

[风险] seeding可能把不准确的working_context评分带入baseline → 缓解：标注[待行为证据验证]，后续真实碎碎念可以更新

[风险] 同步orchestrator_state可能遗漏边缘case → 缓解：bootstrap手动触发时可以二次确认

## Migration Plan

**执行顺序**:
1. 更新 scripts/bootstrap_system.md（逆向重建+状态同步）
2. 更新 core/scoring_engine.md（备选证据+seeding）
3. 更新 core/big_five_ocean.md（映射表）
4. 验证.orchestrator_state同步结果

**验证标准**:
- daily_raw/有骨架文件（标注[重建]）
- capability_baseline.json不再全0
- .orchestrator_state.json显示真实状态