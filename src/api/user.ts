import request from './request';
import type { LoginParams, UserInfo } from '../types';

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginParams) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
}

/**
 * 用户注册
 * @param data 注册数据（FormData 格式）
 */
export function register(data: FormData) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 用户登出
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  });
}

/**
 * 获取用户列表（管理员）
 * @param params 查询参数
 */
export function getUserList(params: any) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  });
}

/**
 * 创建用户（管理员）
 * @param data 用户信息
 */
export function createUser(data: UserInfo) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  });
}

/**
 * 更新用户信息（管理员）
 * @param id 用户ID
 * @param data 用户信息
 */
export function updateUser(id: string, data: Partial<UserInfo>) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除用户（管理员）
 * @param id 用户ID
 */
export function deleteUser(id: string) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  });
}

/**
 * 批量导入用户（管理员）
 * @param data 用户数据
 */
export function batchImportUsers(data: FormData) {
  return request({
    url: '/user/batch-import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 修改密码
 * @param data 密码数据
 */
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request({
    url: '/user/change-password',
    method: 'post',
    data
  });
}

/**
 * 检查用户名是否已存在
 * @param username 用户名
 */
export function checkUsernameExists(username: string) {
  return request({
    url: '/auth/check-username',
    method: 'get',
    params: { username }
  });
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 */
export function sendEmailVerificationCode(email: string) {
  return request({
    url: '/auth/send-verification-code',
    method: 'post',
    data: { email }
  });
}

/**
 * 验证邮箱验证码
 * @param email 邮箱地址
 * @param code 验证码
 */
export function verifyEmailCode(email: string, code: string) {
  return request({
    url: '/auth/verify-code',
    method: 'post',
    data: { email, code }
  });
}
