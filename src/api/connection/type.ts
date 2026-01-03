// 数据库连接类型
export type DatabaseType = 'mysql' | 'oracle' | 'postgres'

// 创建数据库连接
export interface CreateConnectionParams {
  name: string
  type: DatabaseType
  host: string
  port: string
  username: string
  password: string
  database: string
  description?: string
}

export interface Connection {
  id: number
  name: string
  type: DatabaseType
  host: string
  port: string
  username: string
  database: string
  description?: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface CreateConnectionResponse {
  message: string
  data: Connection
}

// 获取连接列表响应
export interface ConnectionListResponse {
  data: Connection[]
}

// 获取单个连接响应
export interface ConnectionDetailResponse {
  data: Connection
}

// 更新数据库连接
export interface UpdateConnectionParams {
  name?: string
  host?: string
  port?: string
  username?: string
  password?: string
  database?: string
  description?: string
  status?: string
}

export interface UpdateConnectionResponse {
  message: string
  data: Partial<Connection>
}

// 删除连接响应
export interface DeleteConnectionResponse {
  message: string
}

// 测试数据库连接
export interface TestConnectionParams {
  type: DatabaseType
  host: string
  port: string
  username: string
  password: string
  database: string
}

export interface TestConnectionResponse {
  success: boolean
  message?: string
  error?: string
}

