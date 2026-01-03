// 冲突类型
export type ConflictType = 'update_conflict' | 'insert_conflict' | 'delete_conflict'
export type ConflictStatus = 'pending' | 'resolved'
export type ConflictResolution = 'source' | 'target'

// 任务简要信息
export interface TaskInfo {
  id: number
  name: string
}

// 冲突信息
export interface Conflict {
  id: number
  task_id: number
  task?: TaskInfo
  table_name: string
  primary_key: string
  source_data: string
  target_data: string
  conflict_type: ConflictType
  status: ConflictStatus
  resolved_by?: number
  resolution?: ConflictResolution
  resolved_at?: string
  created_at: string
}

// 列出所有冲突
export interface ConflictListResponse {
  data: Conflict[]
}

// 获取单个冲突详情
export interface ConflictDetailResponse {
  data: Conflict
}

// 处理冲突
export interface ResolveConflictParams {
  resolution: ConflictResolution
}

export interface ResolveConflictResponse {
  message: string
  data: {
    id: number
    status: ConflictStatus
    resolution: ConflictResolution
    resolved_by: number
    resolved_at: string
  }
}

// 通过Token查看冲突
export interface ViewConflictByTokenResponse {
  data: Conflict
}

