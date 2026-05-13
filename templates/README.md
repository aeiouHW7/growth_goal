# Templates 目录说明

这个目录包含 ACE Engine 的所有标准模板，用于快速创建 Domain、Skill 和 Docker 服务。

---

## 📁 目录结构

```
templates/
├── domain/              # Domain 项目模板
│   ├── README.md
│   ├── domain.yaml.template
│   └── directory-structure.txt
│
├── skill/               # Skill 技能模板
│   ├── README.md
│   ├── skill-template.md
│   ├── skill.yaml.template
│   └── executor.mjs.template
│
└── docker/              # Docker 服务模板
    ├── README.md
    ├── mysql.yml
    ├── redis.yml
    ├── postgres.yml
    ├── mongodb.yml
    └── nginx.yml
```

---

## 🎯 模板用途

### 1. Domain 模板 (templates/domain/)

**用途**: 创建新的 Domain 项目

**包含**:
- `domain.yaml.template` - Domain 配置文件模板
- `directory-structure.txt` - 标准目录结构说明
- `README.md` - 使用说明

**自动使用**:
- 运行 `npm run ace:init` 时自动应用

**手动使用**:
```bash
# 复制模板
cp templates/domain/domain.yaml.template domains/my-app/domain.yaml

# 编辑配置
vim domains/my-app/domain.yaml
```

---

### 2. Skill 模板 (templates/skill/)

**用途**: 创建新的自定义技能

**包含**:
- `skill.yaml.template` - Skill 配置模板
- `executor.mjs.template` - Skill 执行器代码模板
- `skill-template.md` - 文档模板
- `README.md` - 创建指南

**使用方法**:
```bash
# 1. 创建目录
mkdir -p skills/system/my-skill

# 2. 复制模板
cp templates/skill/skill.yaml.template skills/system/my-skill/skill.yaml
cp templates/skill/executor.mjs.template skills/system/my-skill/executor.mjs

# 3. 编辑并实现
vim skills/system/my-skill/skill.yaml
vim skills/system/my-skill/executor.mjs

# 4. 添加到 package.json
npm pkg set scripts.my-skill="node skills/system/my-skill/executor.mjs"
```

---

### 3. Docker 模板 (templates/docker/)

**用途**: 定义基础设施服务的 Docker Compose 配置

**可用服务**:
- `mysql.yml` - MySQL 8.0 数据库
- `redis.yml` - Redis 缓存
- `postgres.yml` - PostgreSQL 数据库
- `mongodb.yml` - MongoDB 文档数据库
- `nginx.yml` - Nginx 反向代理

**自动使用**:
- `ace-infra` 技能会根据 `domain.yaml` 中的配置自动加载对应模板

**声明方式** (在 domain.yaml 中):
```yaml
infrastructure:
  db: mysql      # 使用 mysql.yml
  cache: redis   # 使用 redis.yml
```

**手动使用**:
```bash
# 直接启动单个服务
docker compose -f templates/docker/mysql.yml up -d
```

---

## 🔧 自定义模板

所有模板都可以根据团队需求自定义：

### 修改 Domain 模板

```bash
# 1. 编辑模板
vim templates/domain/domain.yaml.template

# 2. 添加自定义字段或默认值

# 3. 保存后，下次运行 ace:init 会使用新模板
```

### 添加新的 Docker 服务模板

```bash
# 1. 创建新模板
vim templates/docker/elasticsearch.yml

# 2. 编写 docker-compose 配置
# 3. 在 ace-infra/executor.mjs 中添加对该服务的支持
```

### 创建新的 Skill 类型模板

```bash
# 为不同类型的 Skill 创建专门的模板
cp templates/skill/executor.mjs.template templates/skill/workflow-executor.mjs.template

# 编辑为工作流型 Skill 的特定结构
```

---

## 📋 模板变量说明

### Domain 模板变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{DOMAIN_NAME}}` | Domain 名称 | `my-app` |
| `{{PROJECT_TITLE}}` | 项目标题 | `My Application` |
| `{{OWNER}}` | 项目所有者 | `yangyanyu` |

### Skill 模板变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{SKILL_NAME}}` | 技能名称 | `ace-backup` |
| `{{SKILL_DESCRIPTION}}` | 技能描述 | `数据备份工具` |
| `{{CATEGORY}}` | 技能分类 | `system` / `workflow` |
| `{{AUTHOR}}` | 作者 | `ACE Team` |
| `{{TAG1}}`, `{{TAG2}}` | 标签 | `backup`, `automation` |

### Docker 模板变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `${DOMAIN_NAME}` | 当前 Domain | - |
| `${DB_PORT}` | 数据库端口 | `3306` (MySQL) |
| `${DB_ROOT_PASSWORD}` | 数据库密码 | `root123` |
| `${DB_NAME}` | 数据库名称 | `ace_db` |
| `${REDIS_PORT}` | Redis 端口 | `6379` |

---

## 🎨 最佳实践

### 1. 保持模板简洁

模板应该是"最小可用"的骨架，不要包含过多具体逻辑。

### 2. 使用占位符

用 `{{变量名}}` 标记需要替换的内容，方便自动化。

### 3. 提供注释

在模板中添加充分的注释，说明每个部分的作用。

### 4. 版本控制

修改模板时保留原版本，或在 Git 中打上标签。

### 5. 文档同步

修改模板后，同步更新相关文档（README.md）。

---

## 🚀 快速参考

### 创建新 Domain
```bash
npm run ace:init
```

### 创建新 Skill
```bash
mkdir -p skills/system/my-skill
cp templates/skill/*.template skills/system/my-skill/
# 编辑并实现
```

### 添加 Docker 服务
```yaml
# 在 domain.yaml 中声明
infrastructure:
  db: mysql
  cache: redis
```

---

## 📞 需要帮助？

- 查看各子目录的 README.md
- 参考现有的 Skill 实现 (`skills/system/*`)
- 参考现有的 Domain (`domains/ace-core`)

---

**版本**: v1.0.0  
**更新日期**: 2026-05-11
