---
name: db-schema-manager
description: 数据库表结构管理与版本 SQL 收集。从 init SQL 生成表结构基线文档，在变更稳定后收集 DDL/DML 到版本目录。Use when the user wants to initialize database schema docs, collect version SQL, generate DDL/DML for a release, update schema baseline, or manage database migration scripts. Keywords: 数据库, 表结构, DDL, DML, schema, init, 版本SQL, 收集SQL, 基线, migration, 建表, ALTER, 数据库文档, db-schema, collect sql, version sql.
version: "1.0"
  source: Adapted from ai-drive-engine
---

# 数据库表结构管理

管理 project database的表结构基线文档和版本增量 SQL。

## 核心理念

**基线即文档，变更即版本。** 全量表结构以 md 文档形式沉淀，供 AI 和开发者参考；每个版本的 DDL/DML 变更按版本目录收集，发版时直接交付。

## 规范依赖

所有 SQL 生成和审查必须遵循：`10_DOCS/technical/database-standards.md`

## 适用场景

| 场景 | 触发方式 | 说明 |
|------|----------|------|
| init | 手动触发 | 从 init SQL 文件生成表结构基线文档 |
| update-baseline | 版本发布后手动触发 | 从本地 MySQL 导出全量 DDL 并更新基线文档 |

> 版本 SQL 收集（DDL.sql / DML.sql）由 release skill 在发版时自动完成，不在本 skill 中处理。

## 文件结构

```
{agent}/
├── 10_DOCS/technical/
│   ├── database-standards.md    # SQL 规范（已有）
│   └── database-schema.md             # 表结构基线文档（init 生成）
└── local-dev/init-sql/
    ├── project_INIT.sql             # 全量 DDL（数据库导出，人工维护）
    ├── 02-wms-schema.sql        # 旧基线（保留兼容）
    ├── 03-wms-mvp-data.sql      # MVP 数据
    └── versions/                # 版本增量 SQL
        ├── 0.6.0/
        │   ├── DDL.sql          # 该版本所有表结构变更
        │   └── DML.sql          # 该版本所有数据变更
        └── 0.7.0/
            ├── DDL.sql
            └── DML.sql
```

---

## 场景 1：init — 生成表结构基线文档

### 触发

用户说"初始化数据库文档"、"生成表结构基线"、"init db schema"等。

### 输入

- init SQL 文件路径（默认：`local-dev/init-sql/project_INIT.sql`，如不存在则用 `02-wms-schema.sql`）

### 流程

1. 读取 init SQL 文件，解析所有 `CREATE TABLE` 语句
2. 按业务模块分组（根据表名前缀和 COMMENT 推断）
3. 生成 `10_DOCS/technical/database-schema.md`，格式：
   - 头部：数据库名、表数量、基线时间
   - 模块总览表（模块名、表数量、说明）
   - 每个模块下按表列出：表名、COMMENT、核心业务字段（类型+注释）、索引、唯一约束
   - 公共字段统一说明，不逐表重复
4. 更新 `10_DOCS/technical/README.md` 索引

### 分组规则

| 表名前缀/关键词 | 模块 |
|-----------------|------|
| base_warehouse*, base_material*, base_vendor*, base_car_model*, base_shipper*, base_document*, base_shelf_strategy*, owner_info, material_procurement_info, package_type | 基础数据 |
| inventory_* | 库存管理 |
| receipt_order* | 入库管理 |
| shipment_order* | 出库管理 |
| backflush_* | 倒冲管理 |
| repack_* | 翻包管理 |
| pull_order*, replenishment_*, shipment_apply_* | 拉动/备货/发货 |
| put_on_shelf_* | 上架任务 |
| pda_user*, platform_pda_user, role*, permission_*, base_user_warehouse*, mbp_*, org_system_config, tenant_config, user_timezone_config, value_set, sys_param | 系统/权限 |
| api_*, event_fail_record, failed_event, outside_system_config, voucher_retransmission_queue | 接口/集成 |
| sys_i18n* | 多语言 |
| box_label_*, flipped_package_label | 标签 |
| business_operation_record | 业务记录 |

### 输出

`10_DOCS/technical/database-schema.md` — 结构化的表结构基线文档

---

---

## 场景 2：update-baseline — 更新基线文档

### 触发

版本发布后，或 init SQL 需要同步时，用户说"更新基线"、"同步 schema"、"导出表结构"等。

### 流程

1. **导出全量 DDL**（从本地 MySQL 容器）

   ```bash
   bash skills/common/db-schema-manager/scripts/export_schema.sh {agent}
   ```

   脚本自动完成：
   - 从 Docker 容器 `wms-mysql` 导出全量 DDL
   - 清理 `AUTO_INCREMENT=N`、mysqldump 噪音注释
   - 每个 CREATE TABLE 前加表名注释
   - 写入 `local-dev/init-sql/project_INIT.sql`

   前置条件：本地 MySQL 容器需运行（`bash local-dev.sh infra`）

2. **重新生成基线文档**

   执行场景 1 的 init 流程，用新导出的 project_INIT.sql 重新生成 `database-schema.md`

3. **输出变更摘要**

   对比新旧基线，输出：新增了哪些表、哪些表有字段变更

---

## 与其他 Skill 的关系

```
propose（设计数据模型）
    ↓ 参考 database-standards.md + database-schema.md
apply（实施，写代码和 SQL）
    ↓ 涉及 DDL/DML 时自动执行到本地 MySQL（见下方说明）
review（检查 SQL 规范）
    ↓
verify（构建验证）
    ↓
archive（归档变更）
    ↓
release（发版清单 + 自动输出 versions/{version}/DDL.sql、DML.sql）  ← SQL 收集在此完成
    ↓
db-schema-manager update-baseline（导出 + 更新基线文档）
```

### apply 阶段的 SQL 执行

当 apply 过程中的 task 涉及数据库变更（新建表、加字段、加索引、插入值集等），应在写出 SQL 后立即执行到本地 MySQL，保持代码和数据库同步：

```bash
bash skills/common/db-schema-manager/scripts/execute_sql.sh "ALTER TABLE xxx ADD COLUMN yyy varchar(50) NOT NULL DEFAULT '' COMMENT 'zzz'"
```

或执行 SQL 文件：

```bash
bash skills/common/db-schema-manager/scripts/execute_sql.sh path/to/changes.sql
```

前置条件：本地 MySQL 容器需运行。如未运行，提示用户先启动：`cd wms-agent && bash local-dev.sh infra`

执行失败时停下来报告错误，不继续后续 task。

## 注意事项

- init SQL 文件（project_INIT.sql）由人工从数据库导出维护，本 skill 不修改它
- collect 只收集已稳定的变更（verify 通过后），不在 apply 过程中实时收集
- 版本 SQL 是增量的，不是全量的——只包含该版本的变更
- 如果 collect 发现 SQL 不符合规范，提示但不自动修改，由用户决定是否修正后重新收集
