const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';
const USER_ROLE_KEY = 'userRole';

/**
 * 保存token到本地存储
 * @param token 
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 从本地存储获取token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 从本地存储中移除token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 保存用户信息到本地存储
 * @param userInfo 
 */
export function setUserInfo(userInfo: any): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 从本地存储获取用户信息
 */
export function getUserInfo(): any {
  try {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('解析用户信息时出错:', error);
    return null;
  }
}

/**
 * 从本地存储中移除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * 清空所有认证信息
 */
export function clearAuth(): void {
  removeToken();
  removeUserInfo();
  localStorage.removeItem(USER_ROLE_KEY);
}

/**
 * 判断是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/**
 * 获取当前用户角色
 */
export function getUserRole(): string | null {
  return localStorage.getItem(USER_ROLE_KEY);
}
