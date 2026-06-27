## Why

系统发现了执行断层的元问题——架构定义了完整数据写入流程（知道），但执行层没跑（不做）。这恰好和用户高频模式"知道但不做"一致，形成自检信号。

三个具体问题：
1. **P0 Archivist未执行**：daily_raw/为空，但retrieval_index有6个模式、working_context有真实评分。证据链断了 → scoring_engine死循环 → baseline永远是0。
2. **P1 baseline不同步**：working_context显示执行力7→5、沟通6→5、政治智慧5→7，但baseline全为0。两条数据路径没有汇合。
3. **P1 orchestrator_state不同步**：last_cycle:null、data_accumulation_weeks:0，但实际已有2周数据。
4. **P3 OCEAN映射未写入**：design写了规格但big_five_ocean.md没更新。

## What Changes

**P0: bootstrap逆向重建 + Archivist修复**
- 在bootstrap_system.md Step 3中增加「逆向重建」步骤
- 当daily_raw/空但retrieval_index有patterns时，从patterns和dimensions反推日期，生成骨架文件
- 标注[重建]标记，数据来源追溯到retrieval_index

**P1: scoring_engine增加备选证据规则**
- 增加备选证据来源优先级：daily_raw > working_context > retrieval_index
- 将working_context中已有评分seeding写入baseline
- 标注[待行为证据验证]的记录可以和后续碎碎念对齐时更新

**P1: bootstrap增加状态同步步骤**
- Step 3.7同步.orchestrator_state.json
- 从retrieval_index最早日期推算data_accumulation_weeks
- 从pending_actions.json同步pending_actions

**P3: big_five_ocean.md写入映射表**
- 追加人格→能力映射表章节
- 5个OCEAN维度×能力维度的正向影响和负向风险

## Capabilities

### Modified Capabilities

- `bootstrap-sequence`: 增加逆向重建+状态同步步骤
- `scoring-engine`: 增加备选证据规则和seeding逻辑
- `archivist`: 确保Step 4写入daily_raw是强制步骤
- `big-five-ocean`: 追加映射表章节

### New Capabilities

- `system-self-heal`: 当检测到"模块检测到模式但无对应归档"时，自动触发自愈流程

## Impact

- `scripts/bootstrap_system.md` — 增加Step 3.1逆向重建、Step 3.7状态同步
- `core/scoring_engine.md` — 增加备选证据规则、seeding逻辑
- `core/big_five_ocean.md` — 追加人格→能力映射表
- `memories/.orchestrator_state.json` — 同步真实状态
- 元问题：系统自检信号——"知道但不做"模式出现时，检查自身执行链路