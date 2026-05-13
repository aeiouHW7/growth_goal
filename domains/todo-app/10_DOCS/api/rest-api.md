# TODO App - REST API 文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **API Version**: v1

---

## Endpoints

### 1. 获取所有待办事项

获取待办列表，按创建时间倒序排列。

**Endpoint**: `GET /api/todos`

**请求参数**: 无

**响应**:

```json
[
  {
    "id": 1,
    "title": "Learn ACE Engine",
    "completed": false,
    "createdAt": "2026-05-11T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Build a TODO app",
    "completed": true,
    "createdAt": "2026-05-11T09:00:00.000Z"
  }
]
```

**状态码**:
- `200 OK`: 成功

**cURL 示例**:
```bash
curl http://localhost:3000/api/todos
```

---

### 2. 创建待办事项

创建新的待办事项。

**Endpoint**: `POST /api/todos`

**请求体**:
```json
{
  "title": "Learn ACE Engine"
}
```

**字段验证**:
- `title`: 必需，字符串，1-200 字符

**成功响应**:
```json
{
  "id": 1,
  "title": "Learn ACE Engine",
  "completed": false,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

**错误响应**:
```json
{
  "error": "Title is required and must be 1-200 characters"
}
```

**状态码**:
- `201 Created`: 成功创建
- `400 Bad Request`: 验证失败

**cURL 示例**:
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn ACE Engine"}'
```

---

### 3. 更新待办事项

更新待办事项的完成状态。

**Endpoint**: `PUT /api/todos/:id`

**路径参数**:
- `id`: 待办事项 ID（整数）

**请求体**:
```json
{
  "completed": true
}
```

**字段说明**:
- `completed`: 必需，布尔值

**成功响应**:
```json
{
  "id": 1,
  "title": "Learn ACE Engine",
  "completed": true,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

**错误响应**:
```json
{
  "error": "Todo not found"
}
```

**状态码**:
- `200 OK`: 成功更新
- `400 Bad Request`: 无效请求
- `404 Not Found`: 待办事项不存在

**cURL 示例**:
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

---

### 4. 删除待办事项

删除指定的待办事项。

**Endpoint**: `DELETE /api/todos/:id`

**路径参数**:
- `id`: 待办事项 ID（整数）

**请求体**: 无

**成功响应**:
```json
{
  "message": "Todo deleted successfully"
}
```

**错误响应**:
```json
{
  "error": "Todo not found"
}
```

**状态码**:
- `200 OK`: 成功删除
- `404 Not Found`: 待办事项不存在

**cURL 示例**:
```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

---

## 错误处理

### 通用错误格式

所有错误响应遵循统一格式：

```json
{
  "error": "错误描述信息"
}
```

### 常见错误码

| 状态码 | 说明               | 示例                              |
|--------|-------------------|-----------------------------------|
| 400    | 请求参数错误       | 缺少必需字段、字段类型错误        |
| 404    | 资源不存在         | 待办事项 ID 不存在                |
| 500    | 服务器内部错误     | 数据库连接失败                    |

---

## 数据模型

### Todo 对象

| 字段      | 类型    | 必需 | 说明                      |
|-----------|---------|------|---------------------------|
| id        | number  | 是   | 唯一标识符（自动生成）    |
| title     | string  | 是   | 待办事项标题（1-200字符） |
| completed | boolean | 是   | 完成状态（默认 false）    |
| createdAt | string  | 是   | 创建时间（ISO 8601格式）  |

### 示例

```json
{
  "id": 1,
  "title": "Learn ACE Engine",
  "completed": false,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

---

## 请求示例

### 完整工作流

```bash
# 1. 创建待办事项
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn React"}'

# 响应:
# {"id":1,"title":"Learn React","completed":false,"createdAt":"..."}

# 2. 获取所有待办
curl http://localhost:3000/api/todos

# 响应:
# [{"id":1,"title":"Learn React","completed":false,"createdAt":"..."}]

# 3. 标记为完成
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# 响应:
# {"id":1,"title":"Learn React","completed":true,"createdAt":"..."}

# 4. 删除待办
curl -X DELETE http://localhost:3000/api/todos/1

# 响应:
# {"message":"Todo deleted successfully"}
```

---

## CORS 配置

开发环境允许所有来源访问：

```javascript
app.use(cors({
  origin: '*', // 开发环境
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

生产环境应限制来源：

```javascript
app.use(cors({
  origin: 'https://your-domain.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

---

## 速率限制

**MVP 版本**: 无速率限制

**生产环境建议**:
- 每 IP 每分钟 60 次请求
- 使用 `express-rate-limit` 中间件

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分钟
  max: 60 // 60 次请求
});

app.use('/api/', limiter);
```

---

## Postman Collection

可以导入以下 JSON 到 Postman：

```json
{
  "info": {
    "name": "TODO App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get all todos",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/todos"
      }
    },
    {
      "name": "Create todo",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/todos",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Learn ACE Engine\"}"
        }
      }
    },
    {
      "name": "Update todo",
      "request": {
        "method": "PUT",
        "url": "http://localhost:3000/api/todos/1",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"completed\":true}"
        }
      }
    },
    {
      "name": "Delete todo",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:3000/api/todos/1"
      }
    }
  ]
}
```

---

**更新时间**: 2026-05-11  
**版本**: 0.1.0
