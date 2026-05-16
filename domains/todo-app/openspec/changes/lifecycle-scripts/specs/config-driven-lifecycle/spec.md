## ADDED Requirements

### Requirement: 三件套从 domain.yaml 读取配置
start.sh / stop.sh / status.sh SHALL 从 domain.yaml 的 services 段读取端口、容器名、依赖关系，不硬编码。

#### Scenario: 读取服务端口
- **WHEN** 执行 `./start.sh`
- **THEN** 脚本从 domain.yaml 读取 database.port=5432, backend.port=3000, frontend.port=5173
- **THEN** 使用读取的端口进行健康检查和状态输出

#### Scenario: 端口变更后脚本自动适配
- **WHEN** 用户修改 domain.yaml 中 backend.port 为 3001
- **THEN** 三件套自动使用新端口，无需修改脚本

### Requirement: 依赖拓扑启动
start.sh SHALL 按 domain.yaml 的 dependencies 声明顺序启动服务。

#### Scenario: 正序启动
- **WHEN** 执行 `./start.sh`
- **THEN** 先启动 database（无依赖）
- **THEN** 再启动 backend（依赖 database）
- **THEN** 最后启动 frontend（依赖 backend）

#### Scenario: 数据库未就绪时等待
- **WHEN** database 启动后尚未就绪
- **THEN** 脚本轮询健康检查（pg_isready），最多等待 30 秒
- **THEN** 超时后报错退出，不继续启动 backend

### Requirement: PID 文件管理
start.sh SHALL 将后台进程 PID 写入 .pids/ 目录，stop.sh 读取 PID 文件停止服务。

#### Scenario: 启动时记录 PID
- **WHEN** start.sh 后台启动 backend
- **THEN** 将 PID 写入 `.pids/backend.pid`
- **THEN** 将 PID 写入 `.pids/frontend.pid`

#### Scenario: 停止时读取 PID
- **WHEN** 执行 `./stop.sh`
- **THEN** 从 `.pids/backend.pid` 读取 PID
- **THEN** 发送 SIGTERM 给该进程
- **THEN** 删除 PID 文件

#### Scenario: PID 文件过期
- **WHEN** PID 文件存在但进程已不存在
- **THEN** stop.sh 清理过期 PID 文件，不报错
- **THEN** 兜底通过端口查杀（lsof -ti :port）

### Requirement: 幂等性
三件套 SHALL 在重复执行时保持幂等。

#### Scenario: 已启动时再次启动
- **WHEN** 所有服务已运行时执行 `./start.sh`
- **THEN** 检测到服务已运行，跳过启动
- **THEN** 输出当前状态，正常退出

#### Scenario: 已停止时再次停止
- **WHEN** 所有服务已停止时执行 `./stop.sh`
- **THEN** 输出"服务未运行"，正常退出（exit 0）

### Requirement: 健康检查轮询
start.sh SHALL 使用真正的健康检查确认服务就绪，不使用 sleep 固定等待。

#### Scenario: 后端健康检查
- **WHEN** backend 启动后
- **THEN** 脚本轮询 http://localhost:{port}/health
- **THEN** 每 2 秒检查一次，最多 30 秒
- **THEN** 收到 200 响应后继续

### Requirement: stop.sh 反序停止
stop.sh SHALL 按启动的反序停止服务。

#### Scenario: 反序停止
- **WHEN** 执行 `./stop.sh`
- **THEN** 先停 frontend
- **THEN** 再停 backend
- **THEN** 最后停 database（docker compose down）

#### Scenario: 优雅停止
- **WHEN** 停止 backend 进程
- **THEN** 先发 SIGTERM，等待 5 秒
- **THEN** 进程仍存在则发 SIGKILL
