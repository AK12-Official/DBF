# 数据库同步系统 API 接口文档

## 基础信息

- **Base URL**: `http://your-domain.com/api/v1`
- **认证方式**: JWT Token（Bearer Token）
- **请求格式**: JSON
- **响应格式**: JSON

## 认证说明

大部分接口需要在请求头中携带JWT Token：

```
Authorization: Bearer <token>
```

Token通过登录接口获取，有效期为24小时（可在配置中修改）。

---

## 1. 用户管理

### 1.1 用户注册

**接口地址**: `POST /api/v1/register`

**请求头**: 无需认证

**请求体**:
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名，唯一 |
| password | string | 是 | 密码 |
| email | string | 是 | 邮箱地址，需符合邮箱格式 |

**响应示例**:
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**状态码**:
- 200: 注册成功
- 400: 请求参数错误
- 409: 用户名已存在
- 500: 服务器内部错误

---

### 1.2 用户登录

**接口地址**: `POST /api/v1/login`

**请求头**: 无需认证

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应示例**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**状态码**:
- 200: 登录成功
- 400: 请求参数错误
- 401: 用户名或密码错误
- 403: 用户已被禁用

---

### 1.3 获取当前用户信息

**接口地址**: `GET /api/v1/profile`

**请求头**: 需要认证

**请求体**: 无

**响应示例**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active"
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 用户不存在

---

## 2. 数据库连接管理

### 2.1 创建数据库连接

**接口地址**: `POST /api/v1/connections`

**请求头**: 需要认证

**请求体**:
```json
{
  "name": "生产MySQL数据库",
  "type": "mysql",
  "host": "192.168.1.100",
  "port": "3306",
  "username": "root",
  "password": "password123",
  "database": "testdb",
  "description": "生产环境MySQL数据库"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 连接名称 |
| type | string | 是 | 数据库类型：mysql, oracle, postgres |
| host | string | 是 | 数据库主机地址 |
| port | string | 是 | 数据库端口 |
| username | string | 是 | 数据库用户名 |
| password | string | 是 | 数据库密码 |
| database | string | 是 | 数据库名称 |
| description | string | 否 | 连接描述 |

**响应示例**:
```json
{
  "message": "数据库连接创建成功",
  "data": {
    "id": 1,
    "name": "生产MySQL数据库",
    "type": "mysql",
    "host": "192.168.1.100",
    "port": "3306",
    "username": "root",
    "database": "testdb",
    "description": "生产环境MySQL数据库",
    "status": "active",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**状态码**:
- 200: 创建成功
- 400: 请求参数错误或连接测试失败
- 401: 未认证
- 500: 服务器内部错误

---

### 2.2 列出所有数据库连接

**接口地址**: `GET /api/v1/connections`

**请求头**: 需要认证

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "生产MySQL数据库",
      "type": "mysql",
      "host": "192.168.1.100",
      "port": "3306",
      "username": "root",
      "database": "testdb",
      "status": "active"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 500: 服务器内部错误

---

### 2.3 获取单个数据库连接

**接口地址**: `GET /api/v1/connections/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 连接ID |

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "name": "生产MySQL数据库",
    "type": "mysql",
    "host": "192.168.1.100",
    "port": "3306",
    "username": "root",
    "database": "testdb",
    "description": "生产环境MySQL数据库",
    "status": "active"
  }
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 连接不存在

---

### 2.4 更新数据库连接

**接口地址**: `PUT /api/v1/connections/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 连接ID |

**请求体**（所有字段均为可选）:
```json
{
  "name": "更新后的连接名称",
  "host": "192.168.1.101",
  "port": "3307",
  "username": "newuser",
  "password": "newpassword",
  "database": "newdb",
  "description": "更新后的描述",
  "status": "inactive"
}
```

**响应示例**:
```json
{
  "message": "更新成功",
  "data": {
    "id": 1,
    "name": "更新后的连接名称",
    "status": "inactive"
  }
}
```

**状态码**:
- 200: 更新成功
- 400: 请求参数错误
- 401: 未认证
- 404: 连接不存在
- 500: 服务器内部错误

---

### 2.5 删除数据库连接

**接口地址**: `DELETE /api/v1/connections/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 连接ID |

**响应示例**:
```json
{
  "message": "删除成功"
}
```

**状态码**:
- 200: 删除成功
- 401: 未认证
- 404: 连接不存在
- 500: 服务器内部错误

---

### 2.6 测试数据库连接

**接口地址**: `POST /api/v1/connections/test`

**请求头**: 需要认证

**请求体**:
```json
{
  "type": "mysql",
  "host": "192.168.1.100",
  "port": "3306",
  "username": "root",
  "password": "password123",
  "database": "testdb"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "连接成功"
}
```

或失败时：
```json
{
  "success": false,
  "error": "连接失败: dial tcp 192.168.1.100:3306: connect: connection refused"
}
```

**状态码**:
- 200: 请求成功（无论连接是否成功）

---

## 3. 数据查询

### 3.1 查询表数据

**接口地址**: `POST /api/v1/query`

**请求头**: 需要认证

**请求体**:
```json
{
  "connection_id": 1,
  "table_name": "users",
  "page": 1,
  "page_size": 20,
  "condition": "status = 'active'"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| connection_id | integer | 是 | 数据库连接ID |
| table_name | string | 是 | 表名 |
| page | integer | 否 | 页码，从1开始，默认1 |
| page_size | integer | 否 | 每页大小，默认20，最大100 |
| condition | string | 否 | WHERE条件（不含WHERE关键字） |

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "status": "active"
    },
    {
      "id": 2,
      "username": "user2",
      "email": "user2@example.com",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_page": 5
  }
}
```

**状态码**:
- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 404: 数据库连接不存在
- 500: 服务器内部错误

---

### 3.2 获取数据库表列表

**接口地址**: `GET /api/v1/connections/:id/tables`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| connection_id | integer | 是 | 数据库连接ID |

**响应示例**:
```json
{
  "data": ["users", "orders", "products"]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 数据库连接不存在
- 500: 服务器内部错误

---

### 3.3 执行自定义SQL查询

**接口地址**: `POST /api/v1/query/sql`

**请求头**: 需要认证

**请求体**:
```json
{
  "connection_id": 1,
  "sql": "SELECT * FROM users WHERE status = 'active' LIMIT 10"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| connection_id | integer | 是 | 数据库连接ID |
| sql | string | 是 | SQL查询语句（仅支持SELECT语句） |

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 400: 请求参数错误或SQL不是SELECT语句
- 401: 未认证
- 404: 数据库连接不存在
- 500: 服务器内部错误

---

## 4. 同步任务管理

### 4.1 创建同步任务

**接口地址**: `POST /api/v1/sync/tasks`

**请求头**: 需要认证

**请求体**:
```json
{
  "name": "用户表同步任务",
  "source_db_id": 1,
  "target_db_id": 2,
  "table_name": "users",
  "sync_type": "realtime",
  "cron_expr": ""
}
```

或定时任务：
```json
{
  "name": "每日数据同步",
  "source_db_id": 1,
  "target_db_id": 2,
  "table_name": "",
  "sync_type": "scheduled",
  "cron_expr": "0 0 2 * * *"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 任务名称 |
| source_db_id | integer | 是 | 源数据库连接ID |
| target_db_id | integer | 是 | 目标数据库连接ID |
| table_name | string | 否 | 表名，空字符串表示整库同步 |
| sync_type | string | 是 | 同步类型：realtime（实时）, scheduled（定时） |
| cron_expr | string | 否 | 定时任务的cron表达式（定时任务必填） |

**Cron表达式格式**: `秒 分 时 日 月 周`
- 示例：`0 0 2 * * *` 表示每天凌晨2点执行
- 示例：`0 */30 * * * *` 表示每30分钟执行一次

**响应示例**:
```json
{
  "message": "同步任务创建成功",
  "data": {
    "id": 1,
    "name": "用户表同步任务",
    "source_db_id": 1,
    "target_db_id": 2,
    "table_name": "users",
    "sync_type": "realtime",
    "status": "stopped",
    "created_by": 1,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**状态码**:
- 200: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 500: 服务器内部错误

---

### 4.2 列出所有同步任务

**接口地址**: `GET /api/v1/sync/tasks`

**请求头**: 需要认证

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "用户表同步任务",
      "source_db_id": 1,
      "target_db_id": 2,
      "source_db": {
        "id": 1,
        "name": "源数据库"
      },
      "target_db": {
        "id": 2,
        "name": "目标数据库"
      },
      "table_name": "users",
      "sync_type": "realtime",
      "status": "running",
      "last_sync_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 500: 服务器内部错误

---

### 4.3 获取单个同步任务

**接口地址**: `GET /api/v1/sync/tasks/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 任务ID |

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "name": "用户表同步任务",
    "source_db_id": 1,
    "target_db_id": 2,
    "source_db": {
      "id": 1,
      "name": "源数据库"
    },
    "target_db": {
      "id": 2,
      "name": "目标数据库"
    },
    "table_name": "users",
    "sync_type": "realtime",
    "status": "running",
    "last_sync_at": "2024-01-01T12:00:00Z",
    "created_by": 1,
    "creator": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 任务不存在

---

### 4.4 启动同步任务

**接口地址**: `POST /api/v1/sync/tasks/:id/start`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 任务ID |

**请求体**: 无

**响应示例**:
```json
{
  "message": "同步任务已启动"
}
```

**状态码**:
- 200: 启动成功
- 401: 未认证
- 404: 任务不存在
- 500: 服务器内部错误

---

### 4.5 停止同步任务

**接口地址**: `POST /api/v1/sync/tasks/:id/stop`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 任务ID |

**请求体**: 无

**响应示例**:
```json
{
  "message": "同步任务已停止"
}
```

**状态码**:
- 200: 停止成功
- 401: 未认证
- 404: 任务不存在
- 500: 服务器内部错误

---

### 4.6 立即执行同步任务

**接口地址**: `POST /api/v1/sync/tasks/:id/execute`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 任务ID |

**请求体**: 无

**响应示例**:
```json
{
  "message": "同步执行成功"
}
```

**状态码**:
- 200: 执行成功
- 401: 未认证
- 404: 任务不存在
- 500: 同步执行失败

---

### 4.7 删除同步任务

**接口地址**: `DELETE /api/v1/sync/tasks/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 任务ID |

**请求体**: 无

**响应示例**:
```json
{
  "message": "删除成功"
}
```

**状态码**:
- 200: 删除成功
- 401: 未认证
- 404: 任务不存在
- 500: 服务器内部错误

---

### 4.8 获取同步日志

**接口地址**: `GET /api/v1/sync/tasks/:task_id/logs`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | integer | 是 | 任务ID |

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "log_type": "info",
      "message": "同步开始",
      "details": "{}",
      "created_at": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "task_id": 1,
      "log_type": "error",
      "message": "同步失败: 连接超时",
      "details": "{}",
      "created_at": "2024-01-01T10:05:00Z"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 500: 服务器内部错误

---

## 5. 数据库对象管理

### 5.1 列出数据库对象

**接口地址**: `GET /api/v1/connections/:id/objects`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| connection_id | integer | 是 | 数据库连接ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 对象类型：procedure（存储过程）, function（函数）, view（视图）, trigger（触发器）。不传则返回所有类型 |

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "name": "get_user_by_id",
      "table_name": "",
      "schema": "public"
    },
    {
      "name": "user_update_trigger",
      "table_name": "users",
      "schema": "public"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 数据库连接不存在
- 500: 服务器内部错误

---

### 5.2 获取对象定义

**接口地址**: `GET /api/v1/connections/:id/objects/:type/definition`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 数据库连接ID |
| type | string | 是 | 对象类型：procedure, function, view, trigger |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 对象名称 |
| table_name | string | 否 | 触发器关联的表名（触发器类型需要） |

**请求体**: 无

**响应示例**:
```json
{
  "object_type": "procedure",
  "object_name": "get_user_by_id",
  "definition": "CREATE PROCEDURE get_user_by_id(IN user_id INT)\nBEGIN\n  SELECT * FROM users WHERE id = user_id;\nEND"
}
```

**状态码**:
- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 404: 数据库连接或对象不存在
- 500: 服务器内部错误

---

### 5.3 获取对象同步日志

**接口地址**: `GET /api/v1/sync/tasks/:task_id/object-logs`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | integer | 是 | 任务ID |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| object_type | string | 否 | 对象类型过滤：procedure, function, view, trigger |

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "object_type": "procedure",
      "object_name": "get_user_by_id",
      "action": "create",
      "status": "success",
      "message": "get_user_by_id同步成功",
      "created_at": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "task_id": 1,
      "object_type": "trigger",
      "object_name": "user_update_trigger",
      "action": "update",
      "status": "failed",
      "message": "创建user_update_trigger失败: syntax error",
      "created_at": "2024-01-01T10:05:00Z"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 500: 服务器内部错误

---

## 6. 冲突处理

### 6.1 列出所有冲突

**接口地址**: `GET /api/v1/conflicts`

**请求头**: 需要认证

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 过滤状态：pending（待处理）, resolved（已处理） |

**请求体**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "task": {
        "id": 1,
        "name": "用户表同步任务"
      },
      "table_name": "users",
      "primary_key": "{\"id\": 1}",
      "source_data": "{\"id\": 1, \"username\": \"user1\", \"email\": \"user1@example.com\"}",
      "target_data": "{\"id\": 1, \"username\": \"user2\", \"email\": \"user2@example.com\"}",
      "conflict_type": "update_conflict",
      "status": "pending",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 500: 服务器内部错误

---

### 6.2 获取单个冲突详情

**接口地址**: `GET /api/v1/conflicts/:id`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 冲突ID |

**请求体**: 无

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "task_id": 1,
    "task": {
      "id": 1,
      "name": "用户表同步任务"
    },
    "table_name": "users",
    "primary_key": "{\"id\": 1}",
    "source_data": "{\"id\": 1, \"username\": \"user1\", \"email\": \"user1@example.com\"}",
    "target_data": "{\"id\": 1, \"username\": \"user2\", \"email\": \"user2@example.com\"}",
    "conflict_type": "update_conflict",
    "status": "pending",
    "resolved_by": null,
    "resolution": "",
    "resolved_at": null,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**状态码**:
- 200: 成功
- 401: 未认证
- 404: 冲突不存在

---

### 6.3 处理冲突

**接口地址**: `POST /api/v1/conflicts/:id/resolve`

**请求头**: 需要认证

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 冲突ID |

**请求体**:
```json
{
  "resolution": "source"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| resolution | string | 是 | 解决方式：source（以源数据库为准）, target（以目标数据库为准） |

**响应示例**:
```json
{
  "message": "冲突处理成功",
  "data": {
    "id": 1,
    "status": "resolved",
    "resolution": "source",
    "resolved_by": 1,
    "resolved_at": "2024-01-01T11:00:00Z"
  }
}
```

**状态码**:
- 200: 处理成功
- 400: 请求参数错误或冲突已处理
- 401: 未认证
- 404: 冲突不存在
- 500: 服务器内部错误

---

### 6.4 通过Token查看冲突（用于邮件链接）

**接口地址**: `GET /api/v1/conflicts/view`

**请求头**: 无需认证

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 是 | 冲突查看token（从邮件链接中获取） |

**请求体**: 无

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "task_id": 1,
    "task": {
      "id": 1,
      "name": "用户表同步任务"
    },
    "table_name": "users",
    "primary_key": "{\"id\": 1}",
    "source_data": "{\"id\": 1, \"username\": \"user1\", \"email\": \"user1@example.com\"}",
    "target_data": "{\"id\": 1, \"username\": \"user2\", \"email\": \"user2@example.com\"}",
    "conflict_type": "update_conflict",
    "status": "pending"
  }
}
```

**状态码**:
- 200: 成功
- 400: 缺少token参数
- 401: 无效的token
- 404: 冲突不存在

---

## 错误响应格式

所有接口在出错时都遵循统一的错误响应格式：

```json
{
  "error": "错误描述信息"
}
```

常见HTTP状态码：
- 200: 请求成功
- 400: 请求参数错误
- 401: 未认证或认证失败
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

---

## 注意事项

1. **Oracle数据库支持**: Oracle数据库的GORM驱动需要额外配置，当前版本暂时支持原生SQL连接。如需完整支持，请安装 `github.com/godror/godror` 或 `github.com/oci8` 驱动。

2. **同步冲突检测**: 系统会自动检测同步过程中的数据冲突，并通过邮件通知管理员。管理员可以通过邮件中的链接直接查看冲突详情。

3. **定时任务Cron表达式**: 使用6位格式（秒 分 时 日 月 周），例如 `0 0 2 * * *` 表示每天凌晨2点执行。

4. **密码安全**: 数据库密码在存储时应加密，当前版本为简化实现，建议在生产环境中加强密码加密。

5. **并发安全**: 同步任务支持并发执行，但同一表不建议同时启动多个同步任务。

6. **数据同步范围**: `table_name` 为空字符串时表示整库同步，系统会同步所有表和数据库对象（存储过程、触发器、视图、函数等）。

7. **数据库对象同步**: 在整库同步时，系统会自动同步以下数据库对象：
   - 存储过程（Procedure）
   - 函数（Function）
   - 视图（View）
   - 触发器（Trigger）
   
   这些对象会在表数据同步之前进行同步。不同数据库类型之间的对象语法转换会自动处理，但某些复杂的语法差异可能需要手动调整。

---

## 配置说明

系统配置文件 `config.json` 示例：

```json
{
  "server": {
    "port": "8080",
    "mode": "debug"
  },
  "database": {
    "type": "mysql",
    "host": "localhost",
    "port": "3306",
    "user": "root",
    "password": "root",
    "dbname": "db_sync"
  },
  "jwt": {
    "secret": "your-secret-key-change-in-production",
    "expire_time": 24
  },
  "email": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "your-email@example.com",
    "password": "your-password",
    "from": "your-email@example.com"
  }
}
```

---

## 默认账户

系统初始化时会创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`
- 角色: `admin`

**请在首次登录后立即修改默认密码！**
