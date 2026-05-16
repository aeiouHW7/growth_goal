# Retro: lifecycle-scripts

**复杂度**: 中等
**Commits**: 2（feat + reviewer fix）
**代码变更**: +314 / -206，最终 378 行（3 个脚本）
**Tasks**: 8/8 完成（6 组）
**ACE 流程**: planner → applier → reviewer(R1 Block) → applier(fix) → reviewer(R2 Approve) → archiver → retro

## What Went Well

**配置驱动设计一次到位**。从 domain.yaml 读取配置、兜底默认值的模式干净利落，三个脚本共享同一套 parse 函数，改端口只需改 domain.yaml。

**E2E 验证扎实**。start→status(全绿)→stop→status(全停) 完整跑通，Docker 未启动时的优雅报错也验证了。发现并修复了 Docker 容器端口未绑定 host 的隐藏问题（4 天老容器）。

**ACE 流程 applier↔reviewer 修复循环有效**。Reviewer R1 发现 1 Block + 2 Warning，applier 修复后 R2 通过。修复 commit 只改了 20 行，精准。

**知识沉淀及时**。npm 进程树和 bash local 陷阱两个经验同时写入了 Claude memory 和项目 wiki，不同层次的持久化都覆盖了。

## What Went Wrong

**bash `local` 陷阱重复犯**。start.sh 的 `wait_for_url` 先修好了，但 status.sh 的 `check_service` 同样问题在 applier 阶段没发现，直到 reviewer 才抓住。说明 applier 缺乏"同类检查"意识——修了一处应该全局扫描同一模式。

**stop.sh 策略首次实现反了**。最初用 PID-first + port-fallback，但 `stopped=true` 标记导致 port fallback 永远不执行。需要通过 `bash -x` 调试才找到根因。进程管理的心智模型（谁占端口 vs 谁是 PID 文件记录的）一开始就该想清楚。

**Docker 容器状态是隐藏依赖**。4 天前创建的容器端口映射丢失，`docker compose up -d` 认为容器已在运行不会重建。必须 `docker compose down && up -d` 才能修复。这类"环境污染"问题不在 tasks 考虑范围内但实际消耗了调试时间。

## Lessons Learned

1. **端口清扫优先于 PID 清理**——npm/node 的进程树模型决定了 stop 策略。这个模式可泛化到任何 `npm run dev &` 的项目。

2. **修一处 bug，全局搜同类**——bash local 陷阱在两个文件重复出现。applier 修复时应 `grep -rn 'local.*\$' *.sh` 扫描所有同类用法。

3. **`set -e` vs `set +e` 的选择取决于脚本语义**——start.sh 失败应立即停止（`set -e`），stop.sh 必须尽力清理到底（`set +e`）。

4. **Docker 容器"存在但配置过期"是常见陷阱**——健康检查通过不代表配置正确。端口映射、环境变量等可能和 compose 文件不一致。

## Decisions to Make

- [ ] **applier 增加"同类扫描"步骤**：修复一个 pattern 后，自动 grep 全项目搜索同类 pattern。可作为 ace-applier agent 的流程优化。
- [ ] **docker-independence 剩余 47 tasks 审视**：部分可能已被 lifecycle-scripts 覆盖或因架构演进而过时，建议下次 planner 会话中重新评估。

## Architecture Check

**新模块引入**：无新模块，三个脚本是已有能力的升级。

**Deletion test**：如果删掉 lifecycle 字段，脚本回退到硬编码默认值（兜底机制生效）。复杂度没有被转移，是真正被消除了——配置集中在一处。

**接口 vs 实现**：三件套的接口极简（`./start.sh`、`./stop.sh`、`./status.sh`，无参数），内部处理了配置解析、进程树、健康检查等复杂性。符合 deep module 特征。

**模块边界**：domain.yaml 是唯一的配置源，三个脚本是唯一的消费者。边界清晰，无跨层调用。
