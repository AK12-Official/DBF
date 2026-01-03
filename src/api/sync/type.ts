// 同步任务类型
export type SyncType = 'realtime' | 'scheduled'
export type TaskStatus = 'stopped' | 'running' | 'paused'

// 数据库连接简要信息
export interface DatabaseInfo {
  id: number
  name: string
}

// 用户简要信息
export interface UserInfo {
  id: number
  username: string
}

// 创建同步任务
export interface CreateSyncTaskParams {
  name: string
  source_db_id: number
  target_db_id: number
  table_name?: string
  sync_type: SyncType
  cron_expr?: string
}

export interface SyncTask {
  id: number
  name: string
  source_db_id: number
  target_db_id: number
  source_db?: DatabaseInfo
  target_db?: DatabaseInfo
  table_name?: string
  sync_type: SyncType
  status: TaskStatus
  last_sync_at?: string
  created_by?: number
  creator?: UserInfo
  created_at?: string
}

export interface CreateSyncTaskResponse {
  message: string
  data: SyncTask
}

// 获取同步任务列表
export interface SyncTaskListResponse {
  data: SyncTask[]
}

// 获取单个同步任务
export interface SyncTaskDetailResponse {
  data: SyncTask
}

// 启动/停止/执行任务响应
export interface TaskActionResponse {
  message: string
}

// 删除任务响应
export interface DeleteTaskResponse {
  message: string
}

// 同步日志
export interface SyncLog {
  id: number
  task_id: number
  log_type: 'info' | 'error' | 'warning'
  message: string
  details: string
  created_at: string
}

export interface SyncLogListResponse {
  data: SyncLog[]
}

// 对象同步日志
export interface ObjectSyncLog {
  id: number
  task_id: number
  object_type: 'procedure' | 'function' | 'view' | 'trigger'
  object_name: string
  action: 'create' | 'update' | 'delete'
  status: 'success' | 'failed'
  message: string
  created_at: string
}

export interface ObjectSyncLogListResponse {
  data: ObjectSyncLog[]
}

