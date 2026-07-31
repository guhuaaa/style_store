import axios from 'axios'

const trimTrailingSlash = value => value.replace(/\/+$/, '')

export function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl)
  }

  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5001'
  }

  const { protocol, hostname, port, origin } = window.location

  // The production build is served by Flask on port 5001.
  if (protocol !== 'file:' && port === '5001') {
    return origin
  }

  // HTTPS deployments are expected to proxy /api on the same origin.
  if (protocol === 'https:') {
    return origin
  }

  const apiHost = hostname || '127.0.0.1'
  return `http://${apiHost}:5001`
}

export const API_BASE_URL = resolveApiBaseUrl()

// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 300000, // 5分钟超时（本体生成可能需要较长时间）
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    config.headers['Accept-Language'] = 'zh-CN'
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（容错重试机制）
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是success，则抛出错误
    if (!res.success && res.success !== undefined) {
      console.error('API Error:', res.error || res.message || 'Unknown error')
      return Promise.reject(new Error(res.error || res.message || 'Error'))
    }
    
    return res
  },
  error => {
    console.error('Response error:', error)
    const data = error.response?.data

    if (error.response?.status === 401 && data?.auth_required) {
      window.dispatchEvent(new CustomEvent('demo-auth-required'))
      error.message = data.error || '请先输入访问口令'
      return Promise.reject(error)
    }

    // 提取后端返回的具体错误信息（覆盖 axios 默认的 "Request failed with status code XXX"）
    if (data && (data.error || data.message)) {
      error.message = data.error || data.message
    }

    // 处理超时
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timeout')
    }

    // 处理网络错误
    if (error.message === 'Network Error') {
      const targetUrl = `${API_BASE_URL}${error.config?.url || ''}`
      error.message = `无法连接后端服务（${targetUrl}）。请确认后端已启动，并检查 5001 端口或反向代理配置。`
      error.apiBaseUrl = API_BASE_URL
      console.error(error.message)
    }

    return Promise.reject(error)
  }
)

export default service
