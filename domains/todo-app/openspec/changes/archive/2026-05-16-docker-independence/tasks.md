## 1. 模板准备

- [ ] 1.1 在 `templates/domain-react-ts/` 创建 `docker-compose.yml.template`，使用 `{{PROJECT_NAME}}` 占位符
- [ ] 1.2 为 `docker-compose.yml.template` 添加参数化配置（`{{DB_PORT}}`、`{{PROJECT_NAME}}_user`）
- [ ] 1.3 创建 `start.sh.template`，添加 Docker 检查和启动逻辑
- [ ] 1.4 创建 `.env.template`，定义 `DB_PORT` 等环境变量
- [ ] 1.5 更新 `domain.yaml.template`，确保所有项目特定字段使用占位符

## 2. Executor 实现 - ace-init-env

- [ ] 2.1 创建 `skills/system/ace-init-env/executor.mjs`
- [ ] 2.2 实现 Node.js 版本检查（>= 18.0.0）
- [ ] 2.3 实现 Docker 检查（`docker --version` 和 `docker ps`）
- [ ] 2.4 实现 Git 检查（`git --version`）
- [ ] 2.5 添加缺失工具的安装指引输出
- [ ] 2.6 输出环境状态报告（表格格式）

## 3. Executor 实现 - ace-create-project

- [ ] 3.1 创建 `skills/system/ace-create-project/executor.mjs`
- [ ] 3.2 实现项目名称验证（小写字母、数字、连字符）
- [ ] 3.3 实现模板复制逻辑（`templates/domain-react-ts/` → `domains/{projectName}/`）
- [ ] 3.4 实现变量替换函数（读取文件 → 替换占位符 → 写回）
- [ ] 3.5 实现端口自动分配（扫描现有项目 → 找到最大端口 → +1）
- [ ] 3.6 生成 `.env` 文件，填充分配的端口和项目名
- [ ] 3.7 处理 `start.sh` 权限（`chmod +x`）
- [ ] 3.8 输出成功信息和下一步指引

## 4. Skills 文档更新

- [ ] 4.1 在 `ace-init-env/SKILL.md` 添加 "触发场景" 章节（中英文示例）
- [ ] 4.2 在 `ace-create-project/SKILL.md` 添加 "触发场景" 章节
- [ ] 4.3 在 `ace-init-env/SKILL.md` 明确说明这是 AI 调用，非用户手动命令
- [ ] 4.4 在 `ace-create-project/SKILL.md` 添加 "示例输出" 章节

## 5. 根目录文档更新

- [ ] 5.1 更新根 `README.md`：删除 "方式 3: 手动安装" 中的 `npm run ace:up` 步骤
- [ ] 5.2 在 `README.md` 添加 "## 交互模型" 章节，说明 AI domain vs User domain
- [ ] 5.3 更新 "快速开始" 章节，强调 "对 AI 说话" 创建项目
- [ ] 5.4 添加示例对话："我：初始化环境" → "AI：调用 ace-init-env"
- [ ] 5.5 创建 `docs/INTERACTION_MODEL.md` 详细说明交互边界

## 6. 根目录代码清理

- [ ] 6.1 备份根目录 `docker-compose.yml` 为 `docker-compose.yml.backup`
- [ ] 6.2 删除根目录 `docker-compose.yml`
- [ ] 6.3 从 `package.json` 删除 `ace:up`、`ace:down`、`ace:restart` 脚本
- [ ] 6.4 删除 `skills/system/ace-flow/` 目录
- [ ] 6.5 删除 `skills/system/ace-select/` 目录
- [ ] 6.6 删除 `skills/system/ace-sync/` 目录
- [ ] 6.7 删除 `skills/system/ace-infra/` 目录（如果存在）

## 7. 现有项目迁移 - todo-app

- [x] 7.1 复制根目录 `docker-compose.yml.backup` 到 `domains/todo-app/docker-compose.yml`
- [x] 7.2 更新 `todo-app/docker-compose.yml`：服务名改为 `todo-app-db`
- [x] 7.3 更新 `todo-app/docker-compose.yml`：添加 `DB_PORT` 环境变量支持
- [x] 7.4 创建 `todo-app/.env` 文件，设置 `DB_PORT=5432`
- [x] 7.5 更新 `todo-app/start.sh`：在第 17 行之前添加 Docker 启动逻辑（由 lifecycle-scripts 变更覆盖）
- [x] 7.6 测试 `todo-app/start.sh` 可成功启动（Docker + 后端 + 前端）（由 lifecycle-scripts 变更覆盖）

## 8. 测试和验证

- [ ] 8.1 测试 `ace-init-env` Executor：运行并验证输出正确
- [ ] 8.2 测试 `ace-create-project` Executor：生成测试项目 `test-app`
- [ ] 8.3 验证生成的 `test-app/docker-compose.yml` 端口为 5433
- [ ] 8.4 验证 `test-app/start.sh` 可成功启动
- [ ] 8.5 同时运行 `todo-app` 和 `test-app`，确认无端口冲突
- [ ] 8.6 删除测试项目 `test-app`

## 9. 最终文档完善

- [ ] 9.1 更新根 `README.md` 的 "## Skills 列表" 表格，删除过时 Skills
- [ ] 9.2 在 `templates/domain/README.md` 更新模板使用说明
- [ ] 9.3 为 `CONTRIBUTING.md` 添加 "创建新 Skill" 指南
- [ ] 9.4 更新 `QUICKSTART.md`（如果存在），移除 `ace:up` 相关内容
- [ ] 9.5 在变更目录创建 `MIGRATION_GUIDE.md`，记录手动迁移步骤（给老项目参考）
