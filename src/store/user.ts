import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '../types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const role = ref<string | null>(localStorage.getItem('userRole'))
  
  // 初始化时，尝试从本地存储加载用户信息
  try {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    }
  } catch (error) {
    console.error('初始化 store 时解析用户信息出错:', error)
  }
  
  // 动作
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  function setRole(newRole: string) {
    role.value = newRole
    localStorage.setItem('userRole', newRole)
  }
  
  function logout() {
    token.value = null
    userInfo.value = null
    role.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    
    console.log('用户已登出，清除所有认证信息')
  }
  
  return {
    token,
    userInfo,
    role,
    setToken,
    setUserInfo,
    setRole,
    logout
  }
})
