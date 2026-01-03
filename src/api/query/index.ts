import request from "@/utils/request"
import type {
  QueryTableParams,
  QueryTableResponse,
  TableListResponse,
  QuerySqlParams,
  QuerySqlResponse,
} from "./type"

enum API {
  QUERY_URL = '/v1/query',
  QUERY_SQL_URL = '/v1/query/sql',
}

// 查询表数据
export const queryTable = (data: QueryTableParams) => {
  return request.post<QueryTableResponse>(API.QUERY_URL, data)
}

// 获取数据库表列表
export const getTableList = (connectionId: number) => {
  return request.get<TableListResponse>(`/v1/connections/${connectionId}/tables`)
}

// 执行自定义SQL查询
export const querySql = (data: QuerySqlParams) => {
  return request.post<QuerySqlResponse>(API.QUERY_SQL_URL, data)
}

