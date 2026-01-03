// 数据库对象类型
export type ObjectType = 'procedure' | 'function' | 'view' | 'trigger'

// 数据库对象信息
export interface DatabaseObject {
  name: string
  table_name: string
  schema: string
}

// 列出数据库对象
export interface ObjectListResponse {
  data: DatabaseObject[]
}

// 获取对象定义
export interface GetObjectDefinitionParams {
  type: ObjectType
  name: string
  table_name?: string
}

export interface ObjectDefinitionResponse {
  object_type: ObjectType
  object_name: string
  definition: string
}

