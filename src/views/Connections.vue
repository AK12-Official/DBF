<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>数据库连接管理</span>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建连接
        </el-button>
      </div>
    </template>

    <el-table :data="connectionList" v-loading="loading" stripe>
      <el-table-column prop="name" label="连接名称" width="200" />
      <el-table-column prop="type" label="数据库类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">{{ row.type.toUpperCase() }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="host" label="主机地址" width="150" />
      <el-table-column prop="port" label="端口" width="100" />
      <el-table-column prop="database" label="数据库名" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '活跃' : '非活跃' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleTest(row)">测试</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="连接名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入连接名称" />
        </el-form-item>
        <el-form-item label="数据库类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择数据库类型" style="width: 100%">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgres" />
            <el-option label="Oracle" value="oracle" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机地址" prop="host">
          <el-input v-model="form.host" placeholder="请输入主机地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入端口" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="数据库名" prop="database">
          <el-input v-model="form.database" placeholder="请输入数据库名" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
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
import {
  getConnectionList,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection,
  type Connection,
  type CreateConnectionParams,
  type UpdateConnectionParams,
} from '@/api/connection'

const router = useRouter()

const loading = ref(false)
const submitLoading = ref(false)
const connectionList = ref<Connection[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建连接')
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const form = reactive<CreateConnectionParams>({
  name: '',
  type: 'mysql',
  host: '',
  port: '',
  username: '',
  password: '',
  database: '',
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入连接名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    mysql: 'success',
    postgres: 'warning',
    oracle: 'danger',
  }
  return map[type] || 'info'
}

const fetchConnections = async () => {
  loading.value = true
  try {
    const response = await getConnectionList()
    connectionList.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取连接列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  dialogTitle.value = '新建连接'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Connection) => {
  dialogTitle.value = '编辑连接'
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    host: row.host,
    port: row.port,
    username: row.username,
    password: '', // 不显示密码
    database: row.database,
    description: row.description || '',
  })
  dialogVisible.value = true
}

const handleViewDetail = (row: Connection) => {
  router.push(`/connections/${row.id}`)
}

const handleTest = async (row: Connection) => {
  try {
    // 使用 prompt 让用户输入密码
    const password = await ElMessageBox.prompt('请输入数据库密码以测试连接', '测试连接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'password',
      inputPlaceholder: '请输入密码',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '密码不能为空'
        }
        return true
      },
    }).then((result) => result.value).catch(() => null)
    
    if (!password) {
      return // 用户取消
    }
    
    const response = await testConnection({
      type: row.type,
      host: row.host,
      port: row.port,
      username: row.username,
      password: password,
      database: row.database,
    })
    
    if (response.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.error(response.error || '连接测试失败')
    }
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '连接测试失败')
    }
  }
}

const handleDelete = async (row: Connection) => {
  try {
    await ElMessageBox.confirm('确定要删除此连接吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteConnection(row.id)
    ElMessage.success('删除成功')
    fetchConnections()
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
        if (editingId.value) {
          const updateData: UpdateConnectionParams = { ...form }
          await updateConnection(editingId.value, updateData)
          ElMessage.success('更新成功')
        } else {
          await createConnection(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchConnections()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
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
    type: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    description: '',
  })
}

onMounted(() => {
  fetchConnections()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

