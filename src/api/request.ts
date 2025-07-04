import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/user';

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 这里可以根据后端约定的状态码进行统一处理
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      });

      // 401: 未登录或token过期
      if (res.code === 401) {
        const userStore = useUserStore();
        userStore.logout();
      }
      return Promise.reject(new Error(res.message || '未知错误'));
    } else {
      return res.data;
    }
  },
  (error) => {
    console.error('响应错误:', error);
    let message = error.message;
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录';
          const userStore = useUserStore();
          userStore.logout();
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败: ${error.response.status}`;
      }
    }
    ElMessage({
      message: message,
      type: 'error',
      duration: 3000
    });
    return Promise.reject(error);
  }
);

export default request;
