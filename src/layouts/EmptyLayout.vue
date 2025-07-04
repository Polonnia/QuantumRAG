<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
// 空白布局，用于登录页等不需要导航栏的页面
</script>

<style scoped>
.empty-layout {
  height: 100vh;
  width: 100vw;
}
</style>
