<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <el-icon class="forbidden-icon"><WarningFilled /></el-icon>
      <h2>访问受限</h2>
      <p>抱歉，您没有权限访问此页面</p>
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  const role = userStore.role
  
  if (role) {
    // 根据角色跳转到对应的首页
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'teacher':
        router.push('/teacher/dashboard')
        break
      case 'student':
        router.push('/student/dashboard')
        break
      default:
        router.push('/')
    }
  } else {
    // 如果没有角色信息，则跳转到登录页
    router.push('/login')
  }
}
</script>

<style scoped>
.forbidden-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f8fa;
}

.forbidden-content {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.forbidden-icon {
  font-size: 64px;
  color: #f56c6c;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 24px;
}
</style>
