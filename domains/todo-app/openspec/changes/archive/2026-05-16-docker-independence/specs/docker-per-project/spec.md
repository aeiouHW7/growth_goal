## ADDED Requirements

### Requirement: 每个子项目拥有独立的 Docker Compose 配置
每个子项目 SHALL 在其根目录包含独立的 `docker-compose.yml` 文件，定义该项目所需的所有服务（如 PostgreSQL、Redis 等），不依赖根目录的共享 Docker 配置。

#### Scenario: 项目包含独立 Docker 配置
- **WHEN** 使用模板创建新项目
- **THEN** 项目目录下存在 `docker-compose.yml` 文件
- **THEN** 该文件定义了项目所需的所有数据库和服务

#### Scenario: Docker 配置参数化
- **WHEN** 查看子项目的 `docker-compose.yml`
- **THEN** 服务名称包含项目名称变量（如 `${PROJECT_NAME}-db`）
- **THEN** 端口映射使用环境变量（如 `${DB_PORT:-5432}`）
- **THEN** 数据库凭据使用项目特定的值（如 `${PROJECT_NAME}_user`）

#### Scenario: 多项目并行运行无端口冲突
- **WHEN** 同时启动两个不同的子项目
- **THEN** 每个项目的 PostgreSQL 容器使用不同的宿主机端口
- **THEN** 两个项目可以同时运行而不会发生端口冲突

### Requirement: 项目独立启动时自动管理 Docker
子项目的 `start.sh` 脚本 SHALL 自动检查并启动项目自己的 Docker 服务，无需用户手动操作 Docker。

#### Scenario: 自动启动 Docker 服务
- **WHEN** 用户在子项目目录执行 `./start.sh`
- **THEN** 脚本自动执行 `docker-compose up -d`
- **THEN** 脚本等待数据库就绪后继续后续步骤

#### Scenario: Docker 守护进程未运行时提示
- **WHEN** Docker Desktop 未启动时执行 `./start.sh`
- **THEN** 脚本显示错误提示："❌ Docker 未运行，请先启动 Docker Desktop"
- **THEN** 脚本退出并返回非零状态码

#### Scenario: Docker 服务已运行时幂等性
- **WHEN** 项目的 Docker 服务已经运行时再次执行 `./start.sh`
- **THEN** `docker-compose up -d` 检测到服务已启动，不重复创建
- **THEN** 脚本继续执行后续步骤

### Requirement: 数据隔离
每个子项目的数据库容器 SHALL 使用独立的数据卷，确保不同项目的数据完全隔离。

#### Scenario: 独立数据卷
- **WHEN** 两个子项目分别启动 PostgreSQL 容器
- **THEN** 每个容器使用以项目名称命名的数据卷（如 `todo-app-db-data`）
- **THEN** 删除一个项目的数据不影响另一个项目

#### Scenario: 数据持久化
- **WHEN** 停止并删除项目的 Docker 容器
- **THEN** 数据卷仍然保留
- **WHEN** 再次启动项目
- **THEN** 数据库数据完整恢复
