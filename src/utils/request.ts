import axios from 'axios'
import { ElMessage } from 'element-plus'
import { GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'

//创建axios请求实例
let request = axios.create({
  //基础路径，从环境变量读取
  // 后端接口已有 /api 前缀，所以：
  // - 如果使用代理方式：baseURL 使用相对路径 /api，代理会转发到后端
  // - 如果使用完整地址方式：baseURL 使用完整地址 http://localhost:8080/api
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000, // 超时时间的设置
})

//给axios实例添加请求与响应拦截器
request.interceptors.request.use((config) => {
  //config配置对象，有headers属性 请求头，给服务器端携带公共的参数
  const storedToken = GET_TOKEN()
  const rawToken = storedToken
    ? storedToken.trim().startsWith('Bearer ')
      ? storedToken.trim().slice('Bearer '.length).trim()
      : storedToken.trim()
    : ''

  if (rawToken) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${rawToken}`
    // 移除 token 请求头，避免 CORS 错误（后端不允许此请求头）
    // ;(config.headers as any).token = rawToken
  }
  //返回配置对象
  return config
})

//响应拦截器
request.interceptors.response.use(
  (response) => {
    //成功回调
    //简化数据
    const data = response.data

    // 统一业务错误处理（与后端约定 code=20000 为成功）
    if (
      data &&
      typeof data === 'object' &&
      'code' in data &&
      typeof (data as any).code === 'number' &&
      'message' in data
    ) {
      const code = (data as any).code as number
      if (code !== 20000) {
        const message = (data as any).message || '请求失败'
        ElMessage({ type: 'error', message })
        const err: any = new Error(message)
        err.businessCode = code
        err.httpStatus = response.status
        err.url = response.config?.url
        return Promise.reject(err)
      }
    }

    return data
  },
  (error) => {
    //失败回调
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      REMOVE_TOKEN()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'))
        // 不做 window.location.href 硬刷新跳转，避免打断调试/看不到请求状态码
        // 由路由守卫或页面逻辑决定是否跳转到 /auth
        try {
          const url = error?.config?.url
          // eslint-disable-next-line no-console
          console.warn('[auth] unauthorized', { status, url })
        } catch {
          // ignore
        }
      }
    }

    // 追加元信息，方便路由守卫/控制台定位
    try {
      ;(error as any).httpStatus = status
      ;(error as any).url = error?.config?.url
      ;(error as any).businessCode = error?.response?.data?.code
    } catch {
      // ignore
    }

    //定义一个变量：存储网络错误信息
    // 支持多种错误格式：message、error、error.message
    const errorData = error?.response?.data
    let message = 
      errorData?.message || 
      errorData?.error || 
      error?.message || 
      '请求失败'

    // 对二进制数据错误提供更友好的提示
    if (message.includes('invalid input syntax for type uuid') || 
        message.includes('binary') ||
        message.includes('binary16')) {
      message = '数据同步失败：检测到二进制数据（UUID/Binary16类型），后端无法处理此类数据。请检查源数据库的数据类型，或联系管理员处理。\n\n详细错误：' + message
    }

    // 将错误信息附加到 error 对象，方便组件使用
    ;(error as any).errorMessage = message

    // 401/403 错误不显示消息（由路由守卫处理跳转）
    if (status !== 401 && status !== 403) {
      ElMessage({
        type: 'error',
        message,
        duration: message.length > 100 ? 8000 : 3000, // 长错误信息显示更长时间
        showClose: true, // 显示关闭按钮
      })
    }

    return Promise.reject(error)
  },
)

//对外暴露
export default request
