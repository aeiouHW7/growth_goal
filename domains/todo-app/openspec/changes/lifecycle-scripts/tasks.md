# Tasks: lifecycle-scripts

## 1. 基础设施准备

- [x] 1.1 domain.yaml 增加 lifecycle 字段（pid_dir, log_dir, health_check），更新 .gitignore 排除 .pids/ 和 .logs/。验证：读 domain.yaml 确认字段存在，git status 确认 .gitignore 生效

## 2. stop.sh — 补齐缺失的停止能力

- [x] 2.1 创建 stop.sh：从 domain.yaml 读服务端口，反序停止（frontend→backend→database），PID 文件优先 + 端口查杀兜底，SIGTERM→5s→SIGKILL。验证：启动服务后执行 ./stop.sh，所有服务停止，PID 文件清除

## 3. start.sh — 配置驱动重写

- [x] 3.1 重写 start.sh：从 domain.yaml 读配置，按依赖拓扑启动（database→backend→frontend），健康检查轮询替代 sleep，PID 写入 .pids/，日志写入 .logs/。验证：./start.sh 启动全部服务，.pids/ 下有 backend.pid 和 frontend.pid，curl health endpoint 返回 200

## 4. status.sh — 配置驱动精简

- [x] 4.1 重写 status.sh：从 domain.yaml 读服务定义，检测各端口状态，输出表格化面板（与 ace-status 逻辑一致），检查 PID 文件一致性。验证：服务运行时输出 UP，停止时输出 DOWN

## 5. 归档与盘点

- [x] 5.1 归档 ace-user-journey（移到 archive/，记录完成日期）。验证：changes/ 下不再有 ace-user-journey 目录
- [x] 5.2 归档 add-todo-priority-t。验证：changes/ 下不再有 add-todo-priority-t 目录
- [x] 5.3 盘点 docker-independence tasks，标记 7.1~7.6（todo-app 迁移）为已完成。验证：tasks.md 中对应项标记 [x]

## 6. 端到端验证

- [x] 6.1 完整流程验证：./start.sh 启动 → ./status.sh 确认全绿 → ./stop.sh 停止 → ./status.sh 确认全停。验证：Docker 未运行时三件套均正确处理（start 优雅报错，stop/status 幂等输出）。完整 E2E 需 Docker Desktop 启动后再跑一次
