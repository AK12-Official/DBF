<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>数据查询</span>
      </div>
    </template>

    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="数据库连接">
        <el-select
          v-model="queryForm.connectionId"
          placeholder="请选择数据库连接"
          style="width: 200px"
          @change="handleConnectionChange"
        >
          <el-option
            v-for="conn in connectionList"
            :key="conn.id"
            :label="conn.name"
            :value="conn.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="表名" v-if="queryForm.connectionId">
        <el-select
          v-model="queryForm.tableName"
          placeholder="请选择表"
          style="width: 200px"
          @change="handleTableChange"
        >
          <el-option
            v-for="table in tableList"
            :key="table"
            :label="table"
            :value="table"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :loading="loading">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-divider>或执行自定义SQL</el-divider>

    <el-form :model="sqlForm" class="sql-form">
      <el-form-item label="SQL查询">
        <el-input
          v-model="sqlForm.sql"
          type="textarea"
          :rows="5"
          placeholder="请输入SQL查询语句（仅支持SELECT语句）"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSqlQuery" :loading="sqlLoading">执行SQL</el-button>
      </el-form-item>
    </el-form>

    <el-divider>查询条件（可选）</el-divider>
    <el-form :inline="true" :model="queryForm">
      <el-form-item label="WHERE条件">
        <el-input
          v-model="queryForm.condition"
          placeholder="例如: status = 'active'"
          style="width: 300px"
        />
      </el-form-item>
      <el-form-item label="页码">
        <el-input-number v-model="queryForm.page" :min="1" />
      </el-form-item>
      <el-form-item label="每页大小">
        <el-input-number v-model="queryForm.pageSize" :min="1" :max="100" />
      </el-form-item>
    </el-form>

    <el-table
      :data="tableData"
      v-loading="loading"
      stripe
      border
      style="margin-top: 20px"
      max-height="500"
    >
      <el-table-column
        v-for="column in tableColumns"
        :key="column"
        :prop="column"
        :label="column"
        show-overflow-tooltip
      />
    </el-table>

    <el-pagination
      v-if="pagination.total > 0"
      v-model:current-page="queryForm.page"
      v-model:page-size="queryForm.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="handleQuery"
      @current-change="handleQuery"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getConnectionList, type Connection } from '@/api/connection'
import { getTableList, queryTable, querySql } from '@/api/query'

const route = useRoute()

const loading = ref(false)
const sqlLoading = ref(false)
const connectionList = ref<Connection[]>([])
const tableList = ref<string[]>([])
const tableData = ref<Record<string, any>[]>([])
const tableColumns = ref<string[]>([])

const queryForm = reactive({
  connectionId: null as number | null,
  tableName: '',
  condition: '',
  page: 1,
  pageSize: 20,
})

const sqlForm = reactive({
  sql: '',
})

const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 20,
  totalPage: 0,
})

const fetchConnections = async () => {
  try {
    const response = await getConnectionList()
    connectionList.value = response.data
    
    // 如果URL中有connectionId参数，自动选择
    const connectionId = route.query.connectionId
    if (connectionId) {
      queryForm.connectionId = Number(connectionId)
      handleConnectionChange()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取连接列表失败')
  }
}

const handleConnectionChange = async () => {
  if (!queryForm.connectionId) return
  
  try {
    const response = await getTableList(queryForm.connectionId)
    tableList.value = response.data
    queryForm.tableName = ''
    tableData.value = []
    tableColumns.value = []
  } catch (error: any) {
    ElMessage.error(error.message || '获取表列表失败')
  }
}

const handleTableChange = () => {
  tableData.value = []
  tableColumns.value = []
}

const handleQuery = async () => {
  if (!queryForm.connectionId || !queryForm.tableName) {
    ElMessage.warning('请选择数据库连接和表名')
    return
  }
  
  loading.value = true
  try {
    const response = await queryTable({
      connection_id: queryForm.connectionId,
      table_name: queryForm.tableName,
      page: queryForm.page,
      page_size: queryForm.pageSize,
      condition: queryForm.condition || undefined,
    })
    
    tableData.value = response.data
    if (response.data.length > 0) {
      tableColumns.value = Object.keys(response.data[0])
    }
    
    Object.assign(pagination, response.pagination)
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

const handleSqlQuery = async () => {
  if (!queryForm.connectionId) {
    ElMessage.warning('请选择数据库连接')
    return
  }
  
  if (!sqlForm.sql.trim()) {
    ElMessage.warning('请输入SQL查询语句')
    return
  }
  
  sqlLoading.value = true
  try {
    const response = await querySql({
      connection_id: queryForm.connectionId,
      sql: sqlForm.sql.trim(),
    })
    
    tableData.value = response.data
    if (response.data.length > 0) {
      tableColumns.value = Object.keys(response.data[0])
    }
    
    pagination.total = response.data.length
    ElMessage.success('查询成功')
  } catch (error: any) {
    ElMessage.error(error.message || 'SQL查询失败')
  } finally {
    sqlLoading.value = false
  }
}

const handleReset = () => {
  queryForm.connectionId = null
  queryForm.tableName = ''
  queryForm.condition = ''
  queryForm.page = 1
  queryForm.pageSize = 20
  tableList.value = []
  tableData.value = []
  tableColumns.value = []
  pagination.total = 0
}

onMounted(() => {
  fetchConnections()
})
</script>

<style scoped>
.query-form,
.sql-form {
  margin-bottom: 20px;
}
</style>

