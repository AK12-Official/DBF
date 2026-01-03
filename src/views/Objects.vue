<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>数据库对象管理</span>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </template>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="对象类型">
        <el-select
          v-model="objectTypeFilter"
          placeholder="全部"
          clearable
          style="width: 150px"
          @change="fetchObjects"
        >
          <el-option label="存储过程" value="procedure" />
          <el-option label="函数" value="function" />
          <el-option label="视图" value="view" />
          <el-option label="触发器" value="trigger" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchObjects">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="objectList" v-loading="loading" stripe>
      <el-table-column prop="name" label="对象名称" width="200" />
      <el-table-column prop="table_name" label="关联表名" width="200">
        <template #default="{ row }">
          {{ row.table_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="schema" label="Schema" width="150" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleViewDefinition(row)">查看定义</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对象定义对话框 -->
    <el-dialog v-model="definitionVisible" title="对象定义" width="800px">
      <el-input
        v-model="objectDefinition"
        type="textarea"
        :rows="15"
        readonly
        style="font-family: monospace"
      />
      <template #footer>
        <el-button @click="definitionVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getObjectList, getObjectDefinition, type DatabaseObject, type ObjectType } from '@/api/object'

const route = useRoute()

const loading = ref(false)
const objectList = ref<DatabaseObject[]>([])
const objectTypeFilter = ref<string>('')
const definitionVisible = ref(false)
const objectDefinition = ref('')

const connectionId = Number(route.params.connectionId)

const fetchObjects = async () => {
  loading.value = true
  try {
    const response = await getObjectList(
      connectionId,
      objectTypeFilter.value as ObjectType | undefined
    )
    objectList.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取对象列表失败')
  } finally {
    loading.value = false
  }
}

const handleViewDefinition = async (row: DatabaseObject) => {
  try {
    // 需要根据对象类型判断，这里简化处理
    const objectType = objectTypeFilter.value || 'procedure'
    const response = await getObjectDefinition(connectionId, {
      type: objectType as ObjectType,
      name: row.name,
      table_name: row.table_name || undefined,
    })
    objectDefinition.value = response.definition
    definitionVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取对象定义失败')
  }
}

onMounted(() => {
  fetchObjects()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

