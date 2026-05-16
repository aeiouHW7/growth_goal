# Proposal: lifecycle-scripts — 配置驱动的项目启停三件套

## Why

用户旅程中"看到效果"环节依赖 start/stop/status 三件套。当前状态：
- todo-app：有 start.sh（140 行硬编码）+ status.sh（130 行硬编码），**缺 stop.sh**
- 现有脚本完全不读 domain.yaml，端口/容器名/URL 全部写死
- start.sh 用 `&` 后台启动进程但不记录 PID，停服只能 `pkill -f`
- ace-status command（ace-user-journey 产出）和 status.sh 功能重叠
- docker-independence change 中 Task 7（todo-app 迁移）部分已完成但未标记

同时，ace-user-journey 和 add-todo-priority-t 两个 change 全部完成，应归档。

## What Changes

### 核心：todo-app 三件套重写

- **start.sh** — 从 domain.yaml 读配置，依赖拓扑启动（DB→Backend→Frontend），PID 文件管理，健康检查轮询
- **stop.sh（新增）** — 反序停止，读 PID 文件优雅关停，兜底端口查杀
- **status.sh** — 精简为从 domain.yaml 读配置的轻量检查，逻辑与 ace-status command 对齐

### 配套：domain.yaml 增强

```yaml
lifecycle:
  pid_dir: .pids
  log_dir: .logs
  health_check:
    backend: /health
    timeout: 30
```

### 收尾：归档已完成 changes

- 归档 ace-user-journey（27/27 tasks 完成）
- 归档 add-todo-priority-t（3/3 tasks 完成）
- 盘点 docker-independence tasks，标记 7.1~7.4 为已完成

## Capabilities

### New
- `config-driven-lifecycle`: 三件套从 domain.yaml 读取服务定义、端口、依赖关系，不硬编码

### Modified
- `project-startup`: start.sh 从硬编码升级为配置驱动 + PID 管理 + 健康检查轮询
- `project-status`: status.sh 精简，与 ace-status command 逻辑统一

## Impact

**代码影响**：
- `domains/todo-app/start.sh` — 重写
- `domains/todo-app/stop.sh` — 新建
- `domains/todo-app/status.sh` — 重写
- `domains/todo-app/domain.yaml` — 增加 lifecycle 字段

**用户影响**：
- 双模可用：`./start.sh` 终端直接跑，AI 也可通过 ace-start 调用
- 新增 `./stop.sh`，不再需要 `pkill -f`
- status.sh 输出更简洁，和 /ace-status 一致

**引擎影响**：
- domain.yaml 的 lifecycle 字段成为三件套的配置规范，未来 ace-generate 可据此自动生成
- 验证 ECC 进化路径：硬编码 → 配置驱动 → 模板化 → 自动生成

## 复杂度

**中等**。3 个脚本文件 + 1 个 yaml 字段 + 2 个归档操作。
