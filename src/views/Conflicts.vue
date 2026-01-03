<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>冲突处理</span>
        <el-button type="primary" @click="fetchConflicts">刷新</el-button>
      </div>
    </template>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="状态">
        <el-select
          v-model="statusFilter"
          placeholder="全部"
          clearable
          style="width: 150px"
          @change="fetchConflicts"
        >
          <el-option label="待处理" value="pending" />
          <el-option label="已处理" value="resolved" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchConflicts">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="conflictList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="任务" width="200">
        <template #default="{ row }">
          {{ row.task?.name || `ID: ${row.task_id}` }}
        </template>
      </el-table-column>
      <el-table-column prop="table_name" label="表名" width="150" />
      <el-table-column prop="conflict_type" label="冲突类型" width="150">
        <template #default="{ row }">
          {{ getConflictTypeText(row.conflict_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
            {{ row.status === 'pending' ? '待处理' : '已处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
          <el-button
            v-if="row.status === 'pending'"
            link
            type="success"
            @click="handleResolve(row)"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 冲突详情对话框 -->
    <el-dialog v-model="detailVisible" title="冲突详情" width="900px">
      <el-descriptions :column="2" border v-if="currentConflict">
        <el-descriptions-item label="任务">
          {{ currentConflict.task?.name || `ID: ${currentConflict.task_id}` }}
        </el-descriptions-item>
        <el-descriptions-item label="表名">
          {{ currentConflict.table_name }}
        </el-descriptions-item>
        <el-descriptions-item label="冲突类型">
          {{ getConflictTypeText(currentConflict.conflict_type) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentConflict.status === 'pending' ? 'warning' : 'success'">
            {{ currentConflict.status === 'pending' ? '待处理' : '已处理' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="主键" :span="2">
          <pre>{{ formatJSON(currentConflict.primary_key) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="源数据库数据" :span="2">
          <pre>{{ formatJSON(currentConflict.source_data) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="目标数据库数据" :span="2">
          <pre>{{ formatJSON(currentConflict.target_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentConflict?.status === 'pending'" style="margin-top: 20px">
        <el-radio-group v-model="resolution">
          <el-radio label="source">以源数据库为准</el-radio>
          <el-radio label="target">以目标数据库为准</el-radio>
        </el-radio-group>
        <div style="margin-top: 20px">
          <el-button type="primary" @click="handleConfirmResolve">确认处理</el-button>
          <el-button @click="detailVisible = false">取消</el-button>
        </div>
      </div>

      <template #footer v-if="currentConflict?.status === 'resolved'">
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getConflictList,
  getConflictDetail,
  resolveConflict,
  type Conflict,
} from '@/api/conflict'

const loading = ref(false)
const conflictList = ref<Conflict[]>([])
const statusFilter = ref<string>('')
const detailVisible = ref(false)
const currentConflict = ref<Conflict | null>(null)
const resolution = ref<'source' | 'target'>('source')

const getConflictTypeText = (type: string) => {
  const map: Record<string, string> = {
    update_conflict: '更新冲突',
    insert_conflict: '插入冲突',
    delete_conflict: '删除冲突',
  }
  return map[type] || type
}

const formatJSON = (jsonString: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2)
  } catch {
    return jsonString
  }
}

const fetchConflicts = async () => {
  loading.value = true
  try {
    const response = await getConflictList(statusFilter.value || undefined)
    conflictList.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取冲突列表失败')
  } finally {
    loading.value = false
  }
}

const handleViewDetail = async (row: Conflict) => {
  try {
    const response = await getConflictDetail(row.id)
    currentConflict.value = response.data
    resolution.value = 'source'
    detailVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取冲突详情失败')
  }
}

const handleResolve = async (row: Conflict) => {
  await handleViewDetail(row)
}

const handleConfirmResolve = async () => {
  if (!currentConflict.value) return
  
  try {
    await resolveConflict(currentConflict.value.id, { resolution: resolution.value })
    ElMessage.success('冲突处理成功')
    detailVisible.value = false
    fetchConflicts()
  } catch (error: any) {
    ElMessage.error(error.message || '处理失败')
  }
}

onMounted(() => {
  fetchConflicts()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>

