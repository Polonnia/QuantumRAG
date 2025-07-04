<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <img src="../assets/logo.svg" alt="Logo" />
        </div>
        <h2 class="title">教学实训智能体系统</h2>
        <p class="subtitle">基于开源AI大模型的智能教学助手</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="role">
          <el-select v-model="loginForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        
        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-button type="text">忘记密码?</el-button>
        </div>
        
        <el-button
          :loading="loading"
          type="primary"
          class="login-button"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
      
      <div class="login-footer">
        <p>还没有账号? <el-button type="text" @click="goToRegister">立即注册</el-button></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage, FormInstance } from 'element-plus'
import type { UserInfo, LoginParams } from '../types'
import { userApi } from '../api'
import { getToken, getUserInfo as getStoredUserInfo, setToken, setUserInfo } from '../utils/auth'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: localStorage.getItem('ai_edu_remember_username') || '',
  password: '',
  role: localStorage.getItem('ai_edu_remember_role') || 'teacher'
})

// 表单验证规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 其他数据
const loading = ref(false)
const rememberMe = ref(!!localStorage.getItem('ai_edu_remember_username'))

// 初始化检查登录状态
onMounted(() => {
  const token = getToken();
  const storedUserInfo = getStoredUserInfo();
  
  if (token && storedUserInfo) {
    const role = storedUserInfo.role;
    if (role) {
      // 已登录，根据角色跳转到对应的首页
      redirectToDashboard(role);
    }
  }
});

// 根据角色跳转到对应的首页
const redirectToDashboard = (role: string) => {
  switch (role) {
    case 'admin':
      router.push('/admin/dashboard');
      break;
    case 'teacher':
      router.push('/teacher/dashboard');
      break;
    case 'student':
      router.push('/student/dashboard');
      break;
    default:
      router.push('/');
  }
};

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true;
      
      try {
        // 调用登录 API
        const loginParams: LoginParams = {
          username: loginForm.username,
          password: loginForm.password,
          role: loginForm.role as 'admin' | 'teacher' | 'student'
        };
        
        // 调用登录接口
        // 注释掉实际 API 调用，使用模拟数据
        // const result = await userApi.login(loginParams);
        // const { token, userInfo } = result;
        
        // 模拟 API 调用响应
        const token = 'simulated_token_' + Date.now();
        const userInfo: UserInfo = {
          id: '1001',
          username: loginForm.username,
          name: loginForm.username === 'admin' ? '管理员' : 
                loginForm.username === 'teacher' ? '张老师' : '王同学',
          role: loginForm.role as 'admin' | 'teacher' | 'student',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          email: `${loginForm.username}@example.com`,
          department: loginForm.role === 'teacher' ? '计算机科学系' : undefined,
          class: loginForm.role === 'student' ? '计算机科学2班' : undefined
        };
        
        console.log('登录成功 - 设置token:', token);
        console.log('登录成功 - 设置角色:', loginForm.role);
        
        // 保存登录状态到 store
        userStore.setToken(token);
        userStore.setUserInfo(userInfo);
        userStore.setRole(loginForm.role);
        
        // 同时也使用 auth.ts 中的方法保存（以确保一致性）
        setToken(token);
        setUserInfo(userInfo);
        
        // 如果勾选了记住我，则在本地存储保存登录信息
        if (rememberMe.value) {
          localStorage.setItem('ai_edu_remember_username', loginForm.username);
          localStorage.setItem('ai_edu_remember_role', loginForm.role);
        } else {
          localStorage.removeItem('ai_edu_remember_username');
          localStorage.removeItem('ai_edu_remember_role');
        }
        
        // 重定向到对应角色的首页
        redirectToDashboard(loginForm.role);
        
        ElMessage.success('登录成功');
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before,
.login-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.login-container::before {
  top: -100px;
  left: -100px;
  animation: float 10s infinite ease-in-out;
}

.login-container::after {
  bottom: -100px;
  right: -100px;
  animation: float 12s infinite ease-in-out reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(50px, 50px) scale(1.2);
  }
}

.login-card {
  width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 35px;
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  margin-bottom: 15px;
}

.logo img {
  height: 60px;
}

.title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  color: #606266;
  font-size: 14px;
}
</style>
