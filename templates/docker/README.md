# Docker 服务模板

这个目录包含各种基础设施服务的 Docker Compose 模板。

## 📦 可用模板

### 数据库

- **mysql.yml** - MySQL 8.0 数据库
- **postgres.yml** - PostgreSQL 数据库

### 缓存

- **redis.yml** - Redis 缓存服务
- **memcached.yml** - Memcached 缓存服务

### 消息队列

- **rabbitmq.yml** - RabbitMQ 消息队列
- **kafka.yml** - Apache Kafka

### 其他服务

- **nginx.yml** - Nginx 反向代理
- **mongodb.yml** - MongoDB 文档数据库
- **elasticsearch.yml** - Elasticsearch 搜索引擎

## 🚀 使用方法

这些模板会被 `ace-infra` 技能自动使用。当你在 `domain.yaml` 中声明需要某个服务时：

```yaml
infrastructure:
  db: mysql
  cache: redis
```

`ace-infra` 会自动：
1. 读取对应的模板文件
2. 替换环境变量（如 DOMAIN_NAME）
3. 合并到 `docker-compose.generated.yml`
4. 启动容器

## 🔧 自定义模板

你可以修改这些模板或添加新的服务模板：

1. 复制现有模板
2. 修改配置（端口、环境变量等）
3. 保存为 `service-name.yml`
4. 在 `domain.yaml` 中使用 `infrastructure.service-name: true`

## 📝 模板变量

所有模板支持以下环境变量：

- `${DOMAIN_NAME}` - 当前 Domain 名称
- `${DB_PORT}` - 数据库端口（默认值会在模板中定义）
- `${DB_ROOT_PASSWORD}` - 数据库 root 密码
- `${DB_NAME}` - 数据库名称
- `${REDIS_PORT}` - Redis 端口

添加新变量时，在 `ace-infra/executor.mjs` 中配置默认值。
