import request from "@/utils/request"
import type {
  ConflictListResponse,
  ConflictDetailResponse,
  ResolveConflictParams,
  ResolveConflictResponse,
  ViewConflictByTokenResponse,
} from "./type"

enum API {
  CONFLICTS_URL = '/v1/conflicts',
  CONFLICT_VIEW_URL = '/v1/conflicts/view',
}

// 列出所有冲突
export const getConflictList = (status?: string) => {
  const params = status ? { status } : undefined
  return request.get<ConflictListResponse>(API.CONFLICTS_URL, { params })
}

// 获取单个冲突详情
export const getConflictDetail = (id: number) => {
  return request.get<ConflictDetailResponse>(`${API.CONFLICTS_URL}/${id}`)
}

// 处理冲突
export const resolveConflict = (id: number, data: ResolveConflictParams) => {
  return request.post<ResolveConflictResponse>(`${API.CONFLICTS_URL}/${id}/resolve`, data)
}

// 通过Token查看冲突（用于邮件链接）
export const viewConflictByToken = (token: string) => {
  return request.get<ViewConflictByTokenResponse>(API.CONFLICT_VIEW_URL, {
    params: { token },
  })
}

