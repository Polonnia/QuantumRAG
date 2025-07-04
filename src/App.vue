<script setup lang="ts">
// 应用入口组件
console.log("App 组件已加载");
</script>

<template>
  <div class="app-container">
    <h1>AI教学实训智能体系统</h1>
    <!-- 路由出口 -->
    <router-view></router-view>
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  padding: 20px;
}
</style>
