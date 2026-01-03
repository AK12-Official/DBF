import request from "@/utils/request"
import type {
  CreateSyncTaskParams,
  CreateSyncTaskResponse,
  SyncTaskListResponse,
  SyncTaskDetailResponse,
  TaskActionResponse,
  DeleteTaskResponse,
  SyncLogListResponse,
  ObjectSyncLogListResponse,
} from "./type"

enum API {
  SYNC_TASKS_URL = '/v1/sync/tasks',
}

// 创建同步任务
export const createSyncTask = (data: CreateSyncTaskParams) => {
  return request.post<CreateSyncTaskResponse>(API.SYNC_TASKS_URL, data)
}

// 列出所有同步任务
export const getSyncTaskList = () => {
  return request.get<SyncTaskListResponse>(API.SYNC_TASKS_URL)
}

// 获取单个同步任务
export const getSyncTaskDetail = (id: number) => {
  return request.get<SyncTaskDetailResponse>(`${API.SYNC_TASKS_URL}/${id}`)
}

// 启动同步任务
export const startSyncTask = (id: number) => {
  return request.post<TaskActionResponse>(`${API.SYNC_TASKS_URL}/${id}/start`)
}

// 停止同步任务
export const stopSyncTask = (id: number) => {
  return request.post<TaskActionResponse>(`${API.SYNC_TASKS_URL}/${id}/stop`)
}

// 立即执行同步任务
export const executeSyncTask = (id: number) => {
  return request.post<TaskActionResponse>(`${API.SYNC_TASKS_URL}/${id}/execute`)
}

// 删除同步任务
export const deleteSyncTask = (id: number) => {
  return request.delete<DeleteTaskResponse>(`${API.SYNC_TASKS_URL}/${id}`)
}

// 获取同步日志
export const getSyncLogs = (taskId: number) => {
  return request.get<SyncLogListResponse>(`${API.SYNC_TASKS_URL}/${taskId}/logs`)
}

// 获取对象同步日志
export const getObjectSyncLogs = (taskId: number, objectType?: string) => {
  const params = objectType ? { object_type: objectType } : undefined
  return request.get<ObjectSyncLogListResponse>(`${API.SYNC_TASKS_URL}/${taskId}/object-logs`, { params })
}

