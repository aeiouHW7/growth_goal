# 库存管理 API

## 概述

库存管理模块提供库存查询、调整、锁定等核心功能，支持实时库存、可用库存、锁定库存的管理。

## 接口列表

### 查询库存

- 路径: `GET /api/v1/inventory/query`
- 描述: 根据条件查询库存信息
- 权限: `inventory:query`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| warehouseId | Long | 否 | 仓库 ID |
| locationId | Long | 否 | 货位 ID |
| skuCode | String | 否 | 商品编码 |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 20 |

#### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1001,
        "warehouseId": 1,
        "warehouseName": "主仓库",
        "locationId": 101,
        "locationCode": "A-01-01",
        "skuCode": "SKU001",
        "skuName": "商品A",
        "totalQty": 1000,
        "availableQty": 800,
        "lockedQty": 200,
        "updateTime": "2026-03-13 10:30:00"
      }
    ]
  }
}
```

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 403 | 无权限访问 |
| 500 | 服务器内部错误 |

---

### 调整库存

- 路径: `POST /api/v1/inventory/adjust`
- 描述: 手动调整库存数量（盘点、损耗等场景）
- 权限: `inventory:adjust`

#### 请求体

```json
{
  "warehouseId": 1,
  "locationId": 101,
  "skuCode": "SKU001",
  "adjustType": "ADD",
  "quantity": 50,
  "reason": "盘点盈余",
  "remark": "年度盘点发现多出 50 件"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| warehouseId | Long | 是 | 仓库 ID |
| locationId | Long | 是 | 货位 ID |
| skuCode | String | 是 | 商品编码 |
| adjustType | String | 是 | 调整类型：ADD（增加）、SUBTRACT（减少） |
| quantity | Integer | 是 | 调整数量，必须 > 0 |
| reason | String | 是 | 调整原因 |
| remark | String | 否 | 备注说明 |

#### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "adjustId": 5001,
    "beforeQty": 1000,
    "afterQty": 1050,
    "adjustTime": "2026-03-13 10:35:00"
  }
}
```

#### 业务规则

1. 减少库存时，不能超过当前可用库存
2. 调整原因必须从预定义的原因列表中选择
3. 调整操作会记录操作日志，包含操作人、时间、原因

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 403 | 无权限操作 |
| 4001 | 库存不足，无法减少 |
| 4002 | 货位不存在 |
| 4003 | 商品不存在 |
| 500 | 服务器内部错误 |

---

### 锁定库存

- 路径: `POST /api/v1/inventory/lock`
- 描述: 锁定指定数量的库存（用于订单占用）
- 权限: `inventory:lock`

#### 请求体

```json
{
  "warehouseId": 1,
  "skuCode": "SKU001",
  "quantity": 10,
  "bizType": "ORDER",
  "bizId": "SO202603130001",
  "expireTime": "2026-03-14 10:00:00"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| warehouseId | Long | 是 | 仓库 ID |
| skuCode | String | 是 | 商品编码 |
| quantity | Integer | 是 | 锁定数量 |
| bizType | String | 是 | 业务类型：ORDER（订单）、TRANSFER（调拨） |
| bizId | String | 是 | 业务单号 |
| expireTime | String | 否 | 锁定过期时间，超时自动释放 |

#### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "lockId": 8001,
    "lockedQty": 10,
    "availableQty": 790,
    "lockTime": "2026-03-13 10:40:00"
  }
}
```

#### 业务规则

1. 锁定数量不能超过可用库存
2. 同一业务单号可以多次锁定，累计锁定量
3. 锁定记录会关联业务单号，用于追溯
4. 如果设置了过期时间，超时后自动释放锁定

#### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 403 | 无权限操作 |
| 4001 | 可用库存不足 |
| 4002 | 仓库不存在 |
| 4003 | 商品不存在 |
| 500 | 服务器内部错误 |

---

## 数据字典

### 调整类型（AdjustType）

| 值 | 说明 |
|----|------|
| ADD | 增加库存 |
| SUBTRACT | 减少库存 |

### 业务类型（BizType）

| 值 | 说明 |
|----|------|
| ORDER | 订单占用 |
| TRANSFER | 调拨占用 |
| PRODUCTION | 生产占用 |

### 调整原因（AdjustReason）

| 值 | 说明 |
|----|------|
| STOCKTAKING_SURPLUS | 盘点盈余 |
| STOCKTAKING_LOSS | 盘点亏损 |
| DAMAGE | 商品损坏 |
| EXPIRE | 商品过期 |
| MANUAL | 手动调整 |

---

## 相关文档

- [库存业务流程](../../business/inventory-flow.md)
- [库存数据模型](../../technical/inventory-model.md)
