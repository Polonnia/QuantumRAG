<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-container">
      <!-- 顶部Logo -->
      <div class="logo-container">
        <img src="../assets/logo.svg" alt="Logo" class="logo" v-if="!isCollapse" />
        <img src="../assets/logo-mini.svg" alt="Logo" class="logo-mini" v-else />
      </div>
      
      <!-- 菜单 -->
      <el-menu
        :collapse="isCollapse"
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :router="true"
        :unique-opened="true"
      >
        <!-- 管理员菜单 -->
        <template v-if="userRole === 'admin'">
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>管理概览</template>
          </el-menu-item>
          <el-menu-item index="/admin/user">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/resource">
            <el-icon><Files /></el-icon>
            <template #title>资源管理</template>
          </el-menu-item>
        </template>
        
        <!-- 教师菜单 -->
        <template v-if="userRole === 'teacher'">
          <el-menu-item index="/teacher/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>教学概览</template>
          </el-menu-item>
          <el-menu-item index="/teacher/lesson-design">
            <el-icon><Edit /></el-icon>
            <template #title>备课与设计</template>
          </el-menu-item>
          <el-menu-item index="/teacher/exam-generator">
            <el-icon><DocumentAdd /></el-icon>
            <template #title>考核生成</template>
          </el-menu-item>
          <el-menu-item index="/teacher/student-analysis">
            <el-icon><TrendCharts /></el-icon>
            <template #title>学情分析</template>
          </el-menu-item>
        </template>
        
        <!-- 学生菜单 -->
        <template v-if="userRole === 'student'">
          <el-menu-item index="/student/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>学习概览</template>
          </el-menu-item>
          <el-menu-item index="/student/learning-assistant">
            <el-icon><ChatLineRound /></el-icon>
            <template #title>学习助手</template>
          </el-menu-item>
          <el-menu-item index="/student/practice">
            <el-icon><DocumentChecked /></el-icon>
            <template #title>练习评测</template>
          </el-menu-item>
        </template>
      </el-menu>
      
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleSidebar">
        <el-icon :size="20" :color="'#bfcbd9'">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
    </el-aside>
    
    <div class="main-container">
      <!-- 顶部导航 -->
      <el-header height="60px" class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute">{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="36" :src="userAvatar" />
              <span class="username">{{ userName }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主要内容 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取当前路由标题
const currentRoute = computed(() => {
  return route.meta.title as string || ''
})

// 用户信息
const userRole = computed(() => userStore.role)
const userName = computed(() => userStore.userInfo?.name || '未登录')
const userAvatar = computed(() => userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

// 下拉菜单处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    // 跳转到个人信息页面
  } else if (command === 'settings') {
    // 跳转到设置页面
  }
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.token) {
    router.push('/login')
  }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
}

.sidebar-container {
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
}

.logo-container {
  height: 60px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b3a4d;
}

.logo {
  height: 40px;
  max-width: 180px;
}

.logo-mini {
  height: 36px;
  max-width: 36px;
}

.el-menu-vertical {
  border-right: none;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  cursor: pointer;
  padding: 10px 0;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 10px;
  font-size: 14px;
  color: #606266;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* 页面切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
