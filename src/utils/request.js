import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  transformRequest: [function (data, headers) {
    if (data instanceof FormData) {
      return data
    }
    headers['Content-Type'] = 'application/json'
    return JSON.stringify(data)
  }]
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      // 检查是否是 token 相关的错误
      if (res.message?.includes('无效的 token') || 
          res.message?.includes('请先登录') || 
          res.message?.includes('Token已过期') ||
          res.message?.includes('管理员不存在')) {
        localStorage.removeItem('admin_token')
        router.push('/login')
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      router.push('/login')
    }
    ElMessage.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
