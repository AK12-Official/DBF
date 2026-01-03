// 查询表数据
export interface QueryTableParams {
  connection_id: number
  table_name: string
  page?: number
  page_size?: number
  condition?: string
}

export interface QueryTableResponse {
  data: Record<string, any>[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_page: number
  }
}

// 获取数据库表列表
export interface TableListResponse {
  data: string[]
}

// 执行自定义SQL查询
export interface QuerySqlParams {
  connection_id: number
  sql: string
}

export interface QuerySqlResponse {
  data: Record<string, any>[]
}

