<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>任务详情</span>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="info">
        <el-descriptions :column="2" border v-if="task">
          <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
          <el-descriptions-item label="同步类型">
            <el-tag :type="task.sync_type === 'realtime' ? 'success' : 'warning'">
              {{ task.sync_type === 'realtime' ? '实时同步' : '定时同步' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="源数据库">
            {{ task.source_db?.name || `ID: ${task.source_db_id}` }}
          </el-descriptions-item>
          <el-descriptions-item label="目标数据库">
            {{ task.target_db?.name || `ID: ${task.target_db_id}` }}
          </el-descriptions-item>
          <el-descriptions-item label="表名">
            {{ task.table_name || '整库同步' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(task.status)">
              {{ getStatusText(task.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后同步时间">
            {{ task.last_sync_at || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ task.creator?.username || `ID: ${task.created_by}` }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" v-if="task.created_at">
            {{ task.created_at }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="actions" style="margin-top: 20px">
          <el-button
            v-if="task?.status === 'stopped'"
            type="success"
            @click="handleStart"
          >
            启动
          </el-button>
          <el-button
            v-if="task?.status === 'running'"
            type="warning"
            @click="handleStop"
          >
            停止
          </el-button>
          <el-button type="primary" @click="handleExecute">立即执行</el-button>
          <el-button type="danger" @click="handleDelete">删除</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="同步日志" name="logs">
        <el-table :data="syncLogs" v-loading="logsLoading" stripe>
          <el-table-column prop="log_type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLogTypeTagType(row.log_type)">
                {{ getLogTypeText(row.log_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="消息" show-overflow-tooltip />
          <el-table-column prop="created_at" label="时间" width="180" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="对象同步日志" name="objectLogs">
        <el-form :inline="true" style="margin-bottom: 20px">
          <el-form-item label="对象类型">
            <el-select v-model="objectTypeFilter" placeholder="全部" clearable style="width: 150px">
              <el-option label="存储过程" value="procedure" />
              <el-option label="函数" value="function" />
              <el-option label="视图" value="view" />
              <el-option label="触发器" value="trigger" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchObjectLogs">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="objectLogs" v-loading="objectLogsLoading" stripe>
          <el-table-column prop="object_type" label="对象类型" width="120">
            <template #default="{ row }">
              {{ getObjectTypeText(row.object_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="object_name" label="对象名称" width="200" />
          <el-table-column prop="action" label="操作" width="100">
            <template #default="{ row }">
              {{ getActionText(row.action) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="消息" show-overflow-tooltip />
          <el-table-column prop="created_at" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSyncTaskDetail,
  startSyncTask,
  stopSyncTask,
  executeSyncTask,
  deleteSyncTask,
  getSyncLogs,
  getObjectSyncLogs,
  type SyncTask,
  type SyncLog,
  type ObjectSyncLog,
} from '@/api/sync'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const logsLoading = ref(false)
const objectLogsLoading = ref(false)
const activeTab = ref('info')
const task = ref<SyncTask | null>(null)
const syncLogs = ref<SyncLog[]>([])
const objectLogs = ref<ObjectSyncLog[]>([])
const objectTypeFilter = ref<string>('')

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    running: 'success',
    stopped: 'info',
    paused: 'warning',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    paused: '已暂停',
  }
  return map[status] || status
}

const getLogTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
  }
  return map[type] || 'info'
}

const getLogTypeText = (type: string) => {
  const map: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误',
  }
  return map[type] || type
}

const getObjectTypeText = (type: string) => {
  const map: Record<string, string> = {
    procedure: '存储过程',
    function: '函数',
    view: '视图',
    trigger: '触发器',
  }
  return map[type] || type
}

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
  }
  return map[action] || action
}

const fetchTask = async () => {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const response = await getSyncTaskDetail(id)
    task.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取任务详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const fetchLogs = async () => {
  const id = Number(route.params.id)
  logsLoading.value = true
  try {
    const response = await getSyncLogs(id)
    syncLogs.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取日志失败')
  } finally {
    logsLoading.value = false
  }
}

const fetchObjectLogs = async () => {
  const id = Number(route.params.id)
  objectLogsLoading.value = true
  try {
    const response = await getObjectSyncLogs(id, objectTypeFilter.value || undefined)
    objectLogs.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取对象日志失败')
  } finally {
    objectLogsLoading.value = false
  }
}

const handleStart = async () => {
  if (!task.value) return
  try {
    await startSyncTask(task.value.id)
    ElMessage.success('任务已启动')
    fetchTask()
  } catch (error: any) {
    ElMessage.error(error.message || '启动失败')
  }
}

const handleStop = async () => {
  if (!task.value) return
  try {
    await stopSyncTask(task.value.id)
    ElMessage.success('任务已停止')
    fetchTask()
  } catch (error: any) {
    ElMessage.error(error.message || '停止失败')
  }
}

const handleExecute = async () => {
  if (!task.value) return
  try {
    await executeSyncTask(task.value.id)
    ElMessage.success('任务执行成功')
    fetchTask()
    fetchLogs()
  } catch (error: any) {
    // 使用 errorMessage（来自 request.ts 的错误处理）或 error.message
    const errorMsg = error?.errorMessage || error?.response?.data?.error || error?.message || '执行失败'
    
    // 如果是二进制数据错误，显示更详细的提示
    if (errorMsg.includes('binary') || errorMsg.includes('uuid')) {
      ElMessage({
        type: 'error',
        message: errorMsg,
        duration: 8000,
        showClose: true,
      })
    } else {
      ElMessage.error(errorMsg)
    }
  }
}

const handleDelete = async () => {
  if (!task.value) return
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteSyncTask(task.value.id)
    ElMessage.success('删除成功')
    router.push('/sync/tasks')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'logs' && syncLogs.value.length === 0) {
    fetchLogs()
  } else if (newTab === 'objectLogs' && objectLogs.value.length === 0) {
    fetchObjectLogs()
  }
})

onMounted(() => {
  fetchTask()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

