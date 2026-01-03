import request from "@/utils/request"
import type {
  ObjectListResponse,
  GetObjectDefinitionParams,
  ObjectDefinitionResponse,
  ObjectType,
} from "./type"

// 列出数据库对象
export const getObjectList = (connectionId: number, type?: ObjectType) => {
  const params = type ? { type } : undefined
  return request.get<ObjectListResponse>(`/v1/connections/${connectionId}/objects`, { params })
}

// 获取对象定义
export const getObjectDefinition = (
  connectionId: number,
  params: GetObjectDefinitionParams
) => {
  return request.get<ObjectDefinitionResponse>(
    `/v1/connections/${connectionId}/objects/${params.type}/definition`,
    { params: { name: params.name, table_name: params.table_name } }
  )
}

