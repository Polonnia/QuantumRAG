<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>如果你能看到这个页面，说明 Vue 应用已经正常加载。</p>
    <el-button type="primary" @click="goToLogin">前往登录页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.test-container {
  padding: 50px;
  text-align: center;
}

h1 {
  color: #409EFF;
}
</style>
