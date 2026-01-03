import request from "@/utils/request"
import type {
  CreateConnectionParams,
  CreateConnectionResponse,
  ConnectionListResponse,
  ConnectionDetailResponse,
  UpdateConnectionParams,
  UpdateConnectionResponse,
  DeleteConnectionResponse,
  TestConnectionParams,
  TestConnectionResponse,
} from "./type"

enum API {
  CONNECTIONS_URL = '/v1/connections',
  CONNECTION_TEST_URL = '/v1/connections/test',
}

// 创建数据库连接
export const createConnection = (data: CreateConnectionParams) => {
  return request.post<CreateConnectionResponse>(API.CONNECTIONS_URL, data)
}

// 列出所有数据库连接
export const getConnectionList = () => {
  return request.get<ConnectionListResponse>(API.CONNECTIONS_URL)
}

// 获取单个数据库连接
export const getConnectionDetail = (id: number) => {
  return request.get<ConnectionDetailResponse>(`${API.CONNECTIONS_URL}/${id}`)
}

// 更新数据库连接
export const updateConnection = (id: number, data: UpdateConnectionParams) => {
  return request.put<UpdateConnectionResponse>(`${API.CONNECTIONS_URL}/${id}`, data)
}

// 删除数据库连接
export const deleteConnection = (id: number) => {
  return request.delete<DeleteConnectionResponse>(`${API.CONNECTIONS_URL}/${id}`)
}

// 测试数据库连接
export const testConnection = (data: TestConnectionParams) => {
  return request.post<TestConnectionResponse>(API.CONNECTION_TEST_URL, data)
}

