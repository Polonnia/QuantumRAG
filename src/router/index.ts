import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局
import MainLayout from '../layouts/MainLayout.vue'
import EmptyLayout from '../layouts/EmptyLayout.vue'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 管理员路由
  {
    path: '/admin',
    component: MainLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理概览', icon: 'DataLine' }
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'resource',
        name: 'ResourceManagement',
        component: () => import('../views/admin/ResourceManagement.vue'),
        meta: { title: '资源管理', icon: 'Files' }
      }
    ]
  },
  // 教师路由
  {
    path: '/teacher',
    component: MainLayout,
    redirect: '/teacher/dashboard',
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/Dashboard.vue'),
        meta: { title: '教学概览', icon: 'DataLine' }
      },
      {
        path: 'lesson-design',
        name: 'LessonDesign',
        component: () => import('../views/teacher/LessonDesign.vue'),
        meta: { title: '备课与设计', icon: 'Edit' }
      },
      {
        path: 'exam-generator',
        name: 'ExamGenerator',
        component: () => import('../views/teacher/ExamGenerator.vue'),
        meta: { title: '考核生成', icon: 'DocumentAdd' }
      },
      {
        path: 'student-analysis',
        name: 'StudentAnalysis',
        component: () => import('../views/teacher/StudentAnalysis.vue'),
        meta: { title: '学情分析', icon: 'TrendCharts' }
      }
    ]
  },
  // 学生路由
  {
    path: '/student',
    component: MainLayout,
    redirect: '/student/dashboard',
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('../views/student/Dashboard.vue'),
        meta: { title: '学习概览', icon: 'DataLine' }
      },
      {
        path: 'learning-assistant',
        name: 'LearningAssistant',
        component: () => import('../views/student/LearningAssistant.vue'),
        meta: { title: '学习助手', icon: 'ChatLineRound' }
      },
      {
        path: 'practice',
        name: 'PracticeAssistant',
        component: () => import('../views/student/PracticeAssistant.vue'),
        meta: { title: '练习评测', icon: 'DocumentChecked' }
      }
    ]
  },
  // 禁止访问页面
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: () => import('../views/Forbidden.vue')
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 引入状态管理和工具函数
import { useUserStore } from '../store/user'
import { getToken, getUserRole } from '../utils/auth'

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  // 使用 pinia 状态和 auth 工具函数获取登录状态
  const token = getToken()
  const userRole = getUserRole()
  
  console.log('路由守卫 - 当前token:', token)
  console.log('路由守卫 - 当前角色:', userRole)
  console.log('路由守卫 - 目标路径:', to.path)
  
  // 如果前往登录页且已登录，则重定向到对应角色首页
  if (to.path === '/login' && token) {
    switch(userRole) {
      case 'admin':
        return next({ path: '/admin/dashboard' })
      case 'teacher':
        return next({ path: '/teacher/dashboard' })
      case 'student':
        return next({ path: '/student/dashboard' })
      default:
        // 清除可能损坏的状态
        const userStore = useUserStore()
        userStore.logout()
        return next()
    }
  }

  // 需要登录的页面
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    if (!token) {
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath } // 记录原本要访问的页面，登录后可以重定向回来
      })
    } else {
      // 检查角色权限
      if (to.matched.some(record => record.meta.role && record.meta.role !== userRole)) {
        // 角色不匹配，跳转到禁止访问页面
        return next({ path: '/forbidden' })
      } else {
        return next()
      }
    }
  } else {
    return next()
  }
})

export default router
