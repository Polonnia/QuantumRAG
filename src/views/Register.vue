<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <img src="../assets/logo.svg" alt="Logo" />
        </div>
        <h2 class="title">用户注册</h2>
        <p class="subtitle">加入教学实训智能体系统</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="姓名"
            prefix-icon="UserFilled"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="verificationCode">
          <div class="verification-code-container">
            <el-input
              v-model="registerForm.verificationCode"
              placeholder="验证码"
              prefix-icon="Lock"
            />
            <el-button
              :disabled="verificationCodeDisabled"
              @click="sendVerificationCode"
              :loading="verificationCodeLoading"
              type="primary"
            >
              {{ verificationCodeText }}
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        
        <div v-if="registerForm.role === 'teacher'">
          <el-form-item prop="department">
            <el-input
              v-model="registerForm.department"
              placeholder="所属部门"
              prefix-icon="OfficeBuilding"
            />
          </el-form-item>
        </div>
        
        <div v-if="registerForm.role === 'student'">
          <el-form-item prop="class">
            <el-input
              v-model="registerForm.class"
              placeholder="班级"
              prefix-icon="School"
            />
          </el-form-item>
        </div>
        
        <el-form-item prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传头像</div>
        </el-form-item>
        
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意 <el-button type="text" @click="showTerms">服务条款</el-button>
          </el-checkbox>
        </el-form-item>
        
        <el-button
          :loading="loading"
          type="primary"
          class="register-button"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form>
      
      <div class="register-footer">
        <p>已有账号? <el-button type="text" @click="goToLogin">立即登录</el-button></p>
      </div>
    </div>
    
    <!-- 服务条款对话框 -->
    <el-dialog
      v-model="termsDialogVisible"
      title="服务条款"
      width="70%"
      center
    >
      <div class="terms-content">
        <h3>用户协议与隐私政策</h3>
        <p>感谢您使用基于开源AI大模型的教学实训智能体系统（以下简称"本系统"）。本协议是您与本系统运营方之间关于使用本系统服务所订立的协议。</p>
        
        <h4>1. 接受条款</h4>
        <p>使用本系统，即表示您已同意本条款。如您不接受本条款，请勿注册或使用本系统。</p>
        
        <h4>2. 用户账号</h4>
        <p>您需要创建账号才能使用本系统的部分功能。您应对账号安全负责，且对您账号下的所有活动承担责任。</p>
        
        <h4>3. 用户行为规范</h4>
        <p>您同意不会使用本系统从事任何违法或不当的行为，包括但不限于：发布虚假信息、侵犯他人知识产权、传播有害信息等。</p>
        
        <h4>4. 数据隐私</h4>
        <p>我们重视您的隐私。我们收集的信息将用于提供、改进和个性化服务体验。具体内容请参阅我们的隐私政策。</p>
        
        <h4>5. 知识产权</h4>
        <p>本系统内容，包括文字、图片、音频、视频等，均受版权法及其他法律保护。未经允许，不得复制、修改、传播或使用。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="agreeTerms">同意</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, OfficeBuilding, School } from '@element-plus/icons-vue'
import { userApi } from '../api'
import { useUserStore } from '../store/user'

const router = useRouter()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  department: '',
  class: '',
  avatar: null as File | null,
  agreement: false,
  verificationCode: ''
})

// 验证码相关
const verificationCodeLoading = ref(false)
const verificationCodeDisabled = ref(false)
const verificationCodeText = ref('获取验证码')
const countDown = ref(60)
let timer: number | null = null

// 发送验证码
const sendVerificationCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  
  try {
    verificationCodeLoading.value = true
    await userApi.sendEmailVerificationCode(registerForm.email)
    
    ElMessage({
      type: 'success',
      message: '验证码已发送，请查收'
    })
    
    // 开始倒计时
    verificationCodeDisabled.value = true
    countDown.value = 60
    
    timer = window.setInterval(() => {
      if (countDown.value > 0) {
        countDown.value--
        verificationCodeText.value = `${countDown.value}秒后重新获取`
      } else {
        clearInterval(timer as number)
        timer = null
        verificationCodeDisabled.value = false
        verificationCodeText.value = '获取验证码'
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  } finally {
    verificationCodeLoading.value = false
  }
}

// 头像预览
const imageUrl = ref<string>('')

// 服务条款对话框
const termsDialogVisible = ref(false)

// 表单验证规则
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else {
    if (registerForm.confirmPassword !== '') {
      if (!registerFormRef.value) return
      registerFormRef.value.validateField('confirmPassword', () => null)
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意服务条款'))
  } else {
    callback()
  }
}

// 检查用户名是否存在
const checkUsername = async (rule: any, value: string, callback: any) => {
  if (value && value.length >= 3) {
    try {
      const exists = await userApi.checkUsernameExists(value)
      if (exists) {
        callback(new Error('用户名已被使用'))
      } else {
        callback()
      }
    } catch (error) {
      // 如果API调用失败，暂时允许通过验证
      console.error('检查用户名失败:', error)
      callback()
    }
  } else {
    callback()
  }
}

// 验证验证码
const validateVerificationCode = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入验证码'))
  } else if (value.length !== 6) {
    callback(new Error('验证码应为6位数字'))
  } else {
    callback()
  }
}

const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
    { validator: checkUsername, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应为2-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  verificationCode: [
    { validator: validateVerificationCode, trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  department: [
    { required: false, message: '请输入所属部门', trigger: 'blur' }
  ],
  class: [
    { required: false, message: '请输入班级', trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
})

// 角色变更时动态设置表单验证规则
watch(() => registerForm.role, (newRole) => {
  if (newRole === 'teacher') {
    registerRules.department = [
      { required: true, message: '请输入所属部门', trigger: 'blur' }
    ]
  } else {
    registerRules.department = [
      { required: false, message: '请输入所属部门', trigger: 'blur' }
    ]
  }
  
  if (newRole === 'student') {
    registerRules.class = [
      { required: true, message: '请输入班级', trigger: 'blur' }
    ]
  } else {
    registerRules.class = [
      { required: false, message: '请输入班级', trigger: 'blur' }
    ]
  }
})

// 其他数据
const loading = ref(false)

// 处理头像上传
const handleAvatarChange = (file: any) => {
  registerForm.avatar = file.raw
  imageUrl.value = URL.createObjectURL(file.raw)
}

// 显示服务条款
const showTerms = () => {
  termsDialogVisible.value = true
}

// 同意服务条款
const agreeTerms = () => {
  registerForm.agreement = true
  termsDialogVisible.value = false
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      
      try {
        // 先验证验证码
        await userApi.verifyEmailCode(registerForm.email, registerForm.verificationCode)
        
        // 准备注册数据
        const formData = new FormData()
        formData.append('username', registerForm.username)
        formData.append('name', registerForm.name)
        formData.append('email', registerForm.email)
        formData.append('password', registerForm.password)
        formData.append('role', registerForm.role)
        formData.append('verificationCode', registerForm.verificationCode)
        
        if (registerForm.role === 'teacher' && registerForm.department) {
          formData.append('department', registerForm.department)
        }
        
        if (registerForm.role === 'student' && registerForm.class) {
          formData.append('class', registerForm.class)
        }
        
        if (registerForm.avatar) {
          formData.append('avatar', registerForm.avatar)
        }
        
        // 调用注册接口
        await userApi.register(formData)
        
        ElMessage({
          type: 'success',
          message: '注册成功!'
        })
        
        // 询问用户是否直接登录
        try {
          const result = await ElMessageBox.confirm(
            '注册成功，是否直接登录？',
            '提示',
            {
              confirmButtonText: '是，直接登录',
              cancelButtonText: '返回登录页',
              type: 'success'
            }
          )
          
          if (result === 'confirm') {
            try {
              const loginData = {
                username: registerForm.username,
                password: registerForm.password,
                role: registerForm.role as 'teacher' | 'student' | 'admin'
              }
              
              const userStore = useUserStore()
              const response = await userApi.login(loginData)
              
              // 处理登录响应
              // 注意：这里根据实际的API响应结构进行调整
              const data = response as any
              
              // 设置用户信息和token到store
              userStore.setToken(data.token || '')
              userStore.setUserInfo(data.userInfo || null)
              
              ElMessage({
                type: 'success',
                message: '登录成功！'
              })
              
              // 根据角色跳转到相应的首页
              if (registerForm.role === 'teacher') {
                router.push('/teacher/dashboard')
              } else if (registerForm.role === 'student') {
                router.push('/student/dashboard')
              }
            } catch (error) {
              console.error('自动登录失败:', error)
              router.push('/login')
            }
          } else {
            // 用户选择返回登录页
            router.push('/login')
          }
        } catch (error) {
          // 用户取消了弹窗
          router.push('/login')
        }
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败', fields)
      ElMessage.error('请完善表单信息')
    }
  })
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: auto;
  padding: 20px 0;
}

.register-container::before,
.register-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.register-container::before {
  top: -100px;
  left: -100px;
  animation: float 10s infinite ease-in-out;
}

.register-container::after {
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

.register-card {
  width: 480px;
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

.register-header {
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

.register-form {
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-top: 10px;
}

.register-footer {
  text-align: center;
  color: #606266;
  font-size: 14px;
  margin-top: 20px;
}

.verification-code-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-code-container .el-input {
  flex: 1;
}

.verification-code-container .el-button {
  width: 120px;
  white-space: nowrap;
}

.terms-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px;
}

.terms-content h3 {
  text-align: center;
  margin-bottom: 20px;
}

.terms-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.terms-content p {
  line-height: 1.6;
  margin-bottom: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
