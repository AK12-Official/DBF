<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>个人中心</span>
      </div>
    </template>

    <el-descriptions :column="2" border v-loading="loading" v-if="userInfo">
      <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
      <el-descriptions-item label="角色">
        <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'primary'">
          {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="userInfo.status === 'active' ? 'success' : 'info'">
          {{ userInfo.status === 'active' ? '活跃' : '非活跃' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const userInfo = ref(userStore.userInfo)

const fetchUserInfo = async () => {
  loading.value = true
  try {
    await userStore.fetchUserInfo()
    userInfo.value = userStore.userInfo
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!userInfo.value) {
    fetchUserInfo()
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

