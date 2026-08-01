# Retro: ai-analysis-enhancement

**复杂度**: 复杂
**耗时**: 约 2-3 天（规划 0.5 + 实现 1.5 + 对齐/审查 0.5）
**日期**: 2026-08-01

## What Went Well

- **Grill 决策树高效**：10 个决策一次一问带推荐，快速收敛（写入策略/摘要范围/日拆解取舍都一次拍板）
- **现场勘察纠正认知**：规划时误判"复盘分析未注入 summary"，被 decision-interrogator 侦察纠正（日复盘早已注入）—— 避免了一次错误的实现
- **技术债系统性修复**：从"最小变更"转为"系统完善"后，后端 tsc 10→0、前端 tsc 22→0、lint 15→0，build 恢复
- **审查发现 CRITICAL**：code-reviewer 独立审查发现 `aIReflection` 跨用户泄露（无 userId 过滤），及时修复
- **原型 pin 联动**：把原型的"导航器+联动"模型落地到 React，交互符合预期

## What Went Wrong

- **grep 误判**：规划阶段用 grep 判断 summary 注入，漏了 `analysis-runner.service.ts`（应直接读代码而非依赖搜索）
- **原型整合早期 bug**：ace-designer 整合时漏定义 `renderAll`，页面空白（node --check 不查运行时未定义）
- **前端 build 长期红**：19 个 pre-existing TS 错误累积，导致实现期 build 不可用，只能靠 `tsc --noEmit`
- **context 压力**：变更跨 30+ 文件 + 多轮对话，部分对齐项（总览两列）后补

## Lessons Learned

1. **单用户系统也要防跨用户数据泄露**：即使无多用户认证，写查询也要按 userId 过滤。适用：所有数据查询；边界：无共享数据时可简化，但默认应加。
2. **React 19 的 `set-state-in-effect` 是硬规则**：`useEffect(load)` + load 内同步 setState 会报错。模式：effect 用 async IIFE + `await Promise.resolve()` 或 setState 移 await 后。
3. **关键判断直接读代码，不用 grep 推断**：grep 易漏（大小写/路径/head 截断）。适用于验证"某功能是否存在"。
4. **前端 build 应作为实现期持续门禁**：不等到收尾才跑 build。

## Decisions（待后续）

- [ ] AnalysisRunner 的 Claude 输出加 JSON schema 校验（防畸形报告入库）
- [ ] 前端引入 CI/pre-commit 跑 tsc + build（防技术债再累积）
- [ ] 日计划 toggleTask 的双重调用（PENDING→IN_PROGRESS→COMPLETED）评估是否放宽后端状态机

## 架构健康

- AnalysisRunner：接口 `run(reviewId)` 简单、内部处理 DAILY/WEEKLY/MONTHLY 三类型 —— deep module 合理
- PlansPage pin 机制：逻辑集中在页面组件，边界清晰，无跨层调用
