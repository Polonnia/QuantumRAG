<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <div class="desc">抱歉，您访问的页面不存在</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  const role = userStore.role
  
  if (!role) {
    router.push('/login')
    return
  }
  
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
      router.push('/login')
  }
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.content {
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.desc {
  font-size: 24px;
  color: #606266;
  margin: 20px 0 30px;
}
</style>
