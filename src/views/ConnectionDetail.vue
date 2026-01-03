<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>连接详情</span>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </template>

    <el-descriptions :column="2" border v-if="connection">
      <el-descriptions-item label="连接名称">{{ connection.name }}</el-descriptions-item>
      <el-descriptions-item label="数据库类型">
        <el-tag :type="getTypeTagType(connection.type)">
          {{ connection.type.toUpperCase() }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="主机地址">{{ connection.host }}</el-descriptions-item>
      <el-descriptions-item label="端口">{{ connection.port }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ connection.username }}</el-descriptions-item>
      <el-descriptions-item label="数据库名">{{ connection.database }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="connection.status === 'active' ? 'success' : 'info'">
          {{ connection.status === 'active' ? '活跃' : '非活跃' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        {{ connection.description || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" v-if="connection.created_at">
        {{ connection.created_at }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间" v-if="connection.updated_at">
        {{ connection.updated_at }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="actions" style="margin-top: 20px">
      <el-button type="primary" @click="handleEdit">编辑</el-button>
      <el-button type="danger" @click="handleDelete">删除</el-button>
      <el-button @click="handleViewTables">查看表列表</el-button>
      <el-button @click="handleViewObjects">查看数据库对象</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConnectionDetail, deleteConnection, type Connection } from '@/api/connection'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const connection = ref<Connection | null>(null)

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    mysql: 'success',
    postgres: 'warning',
    oracle: 'danger',
  }
  return map[type] || 'info'
}

const fetchConnection = async () => {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const response = await getConnectionDetail(id)
    connection.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取连接详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  router.push({
    path: '/connections',
    query: { edit: connection.value?.id },
  })
}

const handleDelete = async () => {
  if (!connection.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除此连接吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteConnection(connection.value.id)
    ElMessage.success('删除成功')
    router.push('/connections')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleViewTables = () => {
  router.push({
    path: '/query',
    query: { connectionId: connection.value?.id },
  })
}

const handleViewObjects = () => {
  if (connection.value) {
    router.push(`/objects/${connection.value.id}`)
  }
}

onMounted(() => {
  fetchConnection()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

