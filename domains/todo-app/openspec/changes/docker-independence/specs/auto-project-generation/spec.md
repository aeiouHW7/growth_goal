## ADDED Requirements

### Requirement: 一句话自动生成完整项目
用户对 AI 说一句话（如 "创建项目 my-app"），AI SHALL 自动生成包含所有必要文件的完整子项目，无需用户手动操作。

#### Scenario: 自动生成项目结构
- **WHEN** 用户对 AI 说："创建一个新项目叫 my-app"
- **THEN** AI 调用 `ace-create-project` Skill
- **THEN** 在 `domains/my-app/` 生成完整目录结构
- **THEN** 包含 `10_DOCS/`, `frontend/`, `backend/`, `90_PLANNING/` 等目录

#### Scenario: 自动配置项目文件
- **WHEN** 项目生成完成
- **THEN** `domain.yaml` 中的项目名称已替换为 "my-app"
- **THEN** `docker-compose.yml` 中的服务名称包含 "my-app"（如 `my-app-db`）
- **THEN** `start.sh` 脚本中的项目名称已更新

#### Scenario: 生成独立的 Docker 配置
- **WHEN** 检查生成的项目
- **THEN** 项目根目录存在 `docker-compose.yml` 文件
- **THEN** 该文件使用项目特定的端口和凭据
- **THEN** 该文件从模板的参数化配置生成

### Requirement: Executor 实现自动化流程
`ace-create-project` 的 `executor.mjs` SHALL 实现完整的自动化流程，包括复制模板、替换变量、生成配置。

#### Scenario: Executor 接受项目名参数
- **WHEN** AI 调用 `node skills/system/ace-create-project/executor.mjs my-app`
- **THEN** Executor 读取 `my-app` 作为项目名称
- **THEN** Executor 验证项目名格式（小写字母、数字、连字符）

#### Scenario: Executor 复制模板
- **WHEN** Executor 执行
- **THEN** 复制 `templates/domain-react-ts/` 的所有文件到 `domains/my-app/`
- **THEN** 保留目录结构和文件权限

#### Scenario: Executor 替换变量
- **WHEN** Executor 处理模板文件
- **THEN** 将 `{{PROJECT_NAME}}` 替换为实际项目名
- **THEN** 将 `{{DB_PORT}}` 替换为自动分配的端口（如 5433）
- **THEN** 更新所有配置文件中的占位符

#### Scenario: Executor 输出清晰反馈
- **WHEN** Executor 执行完成
- **THEN** 输出包含成功信息："✅ 项目创建成功！"
- **THEN** 输出包含项目位置："📂 位置: domains/my-app"
- **THEN** 输出包含下一步操作指引（如何启动项目）

### Requirement: 项目模板完整性
`templates/domain-react-ts/` 模板 SHALL 包含所有必要文件，确保生成的项目可立即启动运行。

#### Scenario: 模板包含核心文件
- **WHEN** 检查模板目录
- **THEN** 包含 `domain.yaml.template`
- **THEN** 包含 `docker-compose.yml.template`
- **THEN** 包含 `start.sh.template`
- **THEN** 包含 `frontend/` 和 `backend/` 目录结构

#### Scenario: 模板文件使用占位符
- **WHEN** 检查 `docker-compose.yml.template`
- **THEN** 服务名称使用 `{{PROJECT_NAME}}-db` 格式
- **THEN** 端口使用 `{{DB_PORT}}` 占位符
- **THEN** 数据库名称使用 `{{PROJECT_NAME}}_db` 格式

#### Scenario: 生成的项目可立即运行
- **WHEN** 用户 cd 到生成的项目目录
- **WHEN** 用户执行 `./start.sh`
- **THEN** 脚本成功启动 Docker、后端、前端
- **THEN** 用户可以访问 http://localhost:5173 查看应用
