---
name: docs-extractor
description: Extract and generate documentation from project source code into the 10_DOCS knowledge base, organized by four dimensions - api, business, components, technical. Use when the user wants to generate docs from code, extract API documentation, distill business logic, catalog components, or summarize technical patterns. Trigger on phrases like "extract docs", "generate documentation", "distill docs from code", "update knowledge base", "sync docs from code", "提炼文档", "生成文档", "从代码提取文档".
version: "1.0"
  source: Adapted from ai-drive-engine
---

# Docs Extractor

从项目源代码中提炼文档，按 api、business、components、technical 四个维度归档到 `10_DOCS/` 知识库。

## 核心理念

代码是最真实的文档来源。通过分析项目代码，自动提炼出结构化的知识文档，保持知识库与代码同步，减少文档腐化。

## 适用场景

- 项目初始化后，从已有代码生成知识库
- 代码变更后，同步更新相关文档
- 新成员入职，快速生成项目知识概览
- 定期维护，保持文档与代码一致

## 四个文档维度

### 1. api/ - 接口文档

从 Controller / Router 层代码提炼：

**提取内容**：
- 接口路径、请求方法、参数定义
- 请求体和响应体结构
- 权限注解、认证要求
- 接口分组和模块归属

**识别来源**：
- Java: `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping` 等注解
- React/Node: API 请求封装文件、services 目录
- OpenAPI/Swagger 注解: `@ApiOperation`, `@ApiModel`

**输出格式**：
```markdown
# {模块名} API

## 概述
{模块功能描述}

## 接口列表

### {接口名称}
- 路径: `{METHOD} /api/v1/{path}`
- 描述: {接口描述}
- 权限: {权限要求}

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| {name} | {type} | {required} | {description} |

#### 响应格式
```json
{响应示例}
```

#### 错误码
| 错误码 | 说明 |
|--------|------|
| {code} | {message} |
```

### 2. business/ - 业务文档

从 Service 层和领域模型代码提炼：

**提取内容**：
- 核心业务流程和状态流转
- 业务规则和校验逻辑
- 领域实体和关系
- 异常场景处理

**识别来源**：
- Service 类中的业务方法和注释
- 枚举类（状态、类型定义）
- 校验逻辑和业务异常
- 事务边界和流程编排

**输出格式**：
```markdown
# {业务模块名}

## 业务概述
{模块的业务目标和范围}

## 核心流程
{流程描述，使用文字或 mermaid 流程图}

## 业务规则
1. {规则描述}
2. {规则描述}

## 状态流转
{状态机描述}

## 领域模型
| 实体 | 说明 | 核心字段 |
|------|------|----------|
| {entity} | {description} | {fields} |

## 异常场景
| 场景 | 处理方式 |
|------|----------|
| {scenario} | {handling} |
```

### 3. components/ - 组件文档

从前端组件和后端工具类提炼：

**提取内容**：
- 通用 UI 组件的 Props 和用法
- 工具函数和 Hooks
- 中间件和拦截器
- 公共模块和 SDK

**识别来源**：
- 前端: `components/` 目录、自定义 Hooks、工具函数
- 后端: `utils/`、`common/`、`config/` 目录
- 共享: 内部 npm 包、Maven 模块

**输出格式**：
```markdown
# {组件/工具名}

## 功能说明
{组件用途}

## API

### Props / 参数
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| {prop} | {type} | {default} | {description} |

## 使用示例
```{language}
{代码示例}
```

## 注意事项
- {注意点}
```

### 4. technical/ - 技术文档

从项目配置和代码模式提炼：

**提取内容**：
- 技术架构和模块划分
- 编码模式和约定
- 配置管理和环境变量
- 依赖关系和版本信息

**识别来源**：
- 构建配置: `pom.xml`, `build.gradle`, `package.json`
- 框架配置: `application.yml`, `.eslintrc`, `tsconfig.json`
- 代码模式: 异常处理、日志、缓存等通用模式
- 项目结构: 目录组织和分层架构

**输出格式**：
```markdown
# {技术主题}

## 概述
{技术方案说明}

## 架构 / 规范
{具体内容}

## 代码示例
```{language}
{示例代码}
```

## 配置说明
| 配置项 | 值 | 说明 |
|--------|-----|------|
| {key} | {value} | {description} |
```

## 执行流程

### Step 1: 确认目标

确认提炼范围：

```
需要以下信息：
1. 目标业务域（如 wms-agent、oms-agent）
2. 提炼范围：全量 / 指定模块 / 指定维度
3. 是否覆盖已有文档（默认：仅新增和更新）
```

示例对话：
```
用户: "从 wms-agent 的代码提炼文档"
→ 全量提炼，四个维度都生成

用户: "提炼 wms-agent 库存模块的 API 文档"
→ 仅提炼库存模块的 api/ 维度

用户: "更新 wms-agent 的业务文档"
→ 仅更新 business/ 维度
```

### Step 2: 扫描代码结构

分析目标项目的代码结构：

**后端项目**：
1. 扫描 `30_BE/` 目录，识别模块划分
2. 定位 Controller、Service、Entity、Config 等层
3. 识别包结构和命名规范

**前端项目**：
1. 扫描 `20_FE/` 目录，识别项目结构
2. 定位 pages、components、services、utils 等目录
3. 识别路由配置和状态管理

**通用**：
1. 读取构建配置，提取依赖和版本信息
2. 识别项目的技术栈和框架

### Step 3: 按维度提炼

按优先级依次提炼四个维度：

**优先级顺序**：
1. **technical/** - 先提炼技术架构，为其他维度提供上下文
2. **api/** - 提炼接口文档，明确系统边界
3. **business/** - 提炼业务逻辑，理解核心流程
4. **components/** - 提炼组件文档，梳理复用能力

**每个维度的提炼步骤**：
1. 使用 `context-gatherer` 或手动扫描相关代码文件
2. 阅读代码，提取关键信息
3. 按输出格式组织文档内容
4. 写入对应的 `10_DOCS/{dimension}/` 目录

### Step 4: 文件命名规范

生成的文档文件命名规则：

```
10_DOCS/
├── api/
│   ├── README.md                    # 维度总览（已有则更新）
│   ├── {module-name}-api.md         # 按模块拆分
│   └── data-dictionary.md           # 数据字典（可选）
├── business/
│   ├── README.md
│   ├── {module-name}-flow.md        # 业务流程
│   └── {module-name}-rules.md       # 业务规则（可选）
├── components/
│   ├── README.md
│   ├── {component-name}.md          # 单个组件
│   └── utils.md                     # 工具函数汇总
├── technical/
│   ├── README.md
│   ├── architecture.md              # 系统架构
│   ├── tech-stack.md                # 技术栈说明
│   └── coding-patterns.md           # 编码模式
```

### Step 5: 验证和汇总

提炼完成后：

1. 检查生成的文档是否完整
2. 确认文档之间的交叉引用正确
3. 更新各维度的 README.md 索引
4. 输出提炼报告

**提炼报告格式**：
```
提炼完成：10_DOCS/

新增文档：
- api/{file}.md
- business/{file}.md
- ...

更新文档：
- technical/README.md
- ...

建议补充：
- {需要人工补充的内容}
```

## 提炼策略

### 代码注释优先

优先从代码注释中提取信息：
- JavaDoc / JSDoc 注释
- 类和方法的说明注释
- TODO / FIXME 标记
- 内联业务逻辑注释

### 命名推断

从命名中推断语义：
- 类名、方法名、变量名
- 包名和目录结构
- 枚举值和常量名

### 模式识别

识别代码中的通用模式：
- CRUD 操作模式
- 状态机模式
- 策略模式
- 事件驱动模式

### 增量更新

支持增量更新已有文档：
- 对比代码变更，仅更新受影响的文档
- 保留人工编辑的内容，仅更新自动生成的部分
- 在文档中标记自动生成和人工编辑的区域

## 注意事项

- 提炼的文档是代码的"翻译"，不要臆造不存在的功能
- 遇到无法确定的业务逻辑，标记为"待确认"
- 保持文档简洁，避免复制粘贴大段代码
- 敏感信息（密码、密钥、内部 IP）必须脱敏
- 生成的文档需要人工审查后才能作为正式知识库

## 示例

### 示例 1：全量提炼

```
用户: "从 wms-agent 的代码提炼文档到 10_DOCS"

执行步骤：
1. 确认范围：wms-agent 全量，四个维度
2. 扫描 wms-agent/30_BE/ 和 wms-agent/20_FE/
3. 提炼 technical/ → api/ → business/ → components/
4. 生成文档到 wms-agent/10_DOCS/
5. 输出提炼报告
```

### 示例 2：指定模块

```
用户: "提炼 wms-agent 库存模块的文档"

执行步骤：
1. 确认范围：库存模块，四个维度
2. 定位库存相关代码（inventory, stock 关键词）
3. 提炼库存模块的 API、业务流程、组件、技术方案
4. 生成对应文档
5. 输出提炼报告
```

### 示例 3：指定维度

```
用户: "更新 wms-agent 的 API 文档"

执行步骤：
1. 确认范围：全模块，仅 api/ 维度
2. 扫描所有 Controller 层代码
3. 提炼接口文档
4. 更新 wms-agent/10_DOCS/api/
5. 输出提炼报告
```
