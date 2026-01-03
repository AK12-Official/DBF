<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>同步任务管理</span>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </template>

    <el-table :data="taskList" v-loading="loading" stripe>
      <el-table-column prop="name" label="任务名称" width="200" />
      <el-table-column label="源数据库" width="150">
        <template #default="{ row }">
          {{ row.source_db?.name || `ID: ${row.source_db_id}` }}
        </template>
      </el-table-column>
      <el-table-column label="目标数据库" width="150">
        <template #default="{ row }">
          {{ row.target_db?.name || `ID: ${row.target_db_id}` }}
        </template>
      </el-table-column>
      <el-table-column prop="table_name" label="表名" width="150">
        <template #default="{ row }">
          {{ row.table_name || '整库同步' }}
        </template>
      </el-table-column>
      <el-table-column prop="sync_type" label="同步类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.sync_type === 'realtime' ? 'success' : 'warning'">
            {{ row.sync_type === 'realtime' ? '实时同步' : '定时同步' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_sync_at" label="最后同步时间" width="180" />
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'stopped'"
            link
            type="success"
            @click="handleStart(row)"
          >
            启动
          </el-button>
          <el-button
            v-if="row.status === 'running'"
            link
            type="warning"
            @click="handleStop(row)"
          >
            停止
          </el-button>
          <el-button link type="primary" @click="handleExecute(row)">立即执行</el-button>
          <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="源数据库" prop="source_db_id">
          <el-select v-model="form.source_db_id" placeholder="请选择源数据库" style="width: 100%">
            <el-option
              v-for="conn in connectionList"
              :key="conn.id"
              :label="conn.name"
              :value="conn.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标数据库" prop="target_db_id">
          <el-select v-model="form.target_db_id" placeholder="请选择目标数据库" style="width: 100%">
            <el-option
              v-for="conn in connectionList"
              :key="conn.id"
              :label="conn.name"
              :value="conn.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="表名" prop="table_name">
          <el-input
            v-model="form.table_name"
            placeholder="留空表示整库同步"
          />
        </el-form-item>
        <el-form-item label="同步类型" prop="sync_type">
          <el-radio-group v-model="form.sync_type">
            <el-radio label="realtime">实时同步</el-radio>
            <el-radio label="scheduled">定时同步</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.sync_type === 'scheduled'"
          label="Cron表达式"
          prop="cron_expr"
        >
          <el-input
            v-model="form.cron_expr"
            placeholder="例如: 0 0 2 * * * (每天凌晨2点)"
          />
          <div class="form-tip">格式: 秒 分 时 日 月 周</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getConnectionList, type Connection } from '@/api/connection'
import {
  getSyncTaskList,
  createSyncTask,
  startSyncTask,
  stopSyncTask,
  executeSyncTask,
  deleteSyncTask,
  type SyncTask,
  type CreateSyncTaskParams,
} from '@/api/sync'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const taskList = ref<SyncTask[]>([])
const connectionList = ref<Connection[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建任务')
const formRef = ref<FormInstance>()

const form = reactive<CreateSyncTaskParams>({
  name: '',
  source_db_id: 0,
  target_db_id: 0,
  table_name: '',
  sync_type: 'realtime',
  cron_expr: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  source_db_id: [{ required: true, message: '请选择源数据库', trigger: 'change' }],
  target_db_id: [{ required: true, message: '请选择目标数据库', trigger: 'change' }],
  cron_expr: [
    {
      validator: (rule, value, callback) => {
        if (form.sync_type === 'scheduled' && !value) {
          callback(new Error('定时任务必须填写Cron表达式'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

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

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await getSyncTaskList()
    taskList.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const fetchConnections = async () => {
  try {
    const response = await getConnectionList()
    connectionList.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取连接列表失败')
  }
}

const handleCreate = () => {
  dialogTitle.value = '新建任务'
  resetForm()
  dialogVisible.value = true
}

const handleStart = async (row: SyncTask) => {
  try {
    await startSyncTask(row.id)
    ElMessage.success('任务已启动')
    fetchTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '启动失败')
  }
}

const handleStop = async (row: SyncTask) => {
  try {
    await stopSyncTask(row.id)
    ElMessage.success('任务已停止')
    fetchTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '停止失败')
  }
}

const handleExecute = async (row: SyncTask) => {
  try {
    await executeSyncTask(row.id)
    ElMessage.success('任务执行成功')
    fetchTasks()
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

const handleViewDetail = (row: SyncTask) => {
  router.push(`/sync/tasks/${row.id}`)
}

const handleDelete = async (row: SyncTask) => {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteSyncTask(row.id)
    ElMessage.success('删除成功')
    fetchTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await createSyncTask(form)
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchTasks()
      } catch (error: any) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetForm()
  formRef.value?.clearValidate()
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    source_db_id: 0,
    target_db_id: 0,
    table_name: '',
    sync_type: 'realtime',
    cron_expr: '',
  })
}

onMounted(() => {
  fetchTasks()
  fetchConnections()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>

