import axios from 'axios'
import { Message } from 'element-ui'
// 创建axios实例
const service = axios.create({
  // 如果执行 npm run dev  值为 /api 正确  /api 这个代理只是给开发环境配置的代理
  // 如果执行 npm run build 值为 /prod-api  没关系  运维应该在上线的时候 给你配置上 /prod-api的代理
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})
// 请求拦截器
service.interceptors.request.use()
// 响应拦截器
service.interceptors.response.use(
  response => {
    const { success, data, message } = response.data
    if (success) {
      return data
    } else {
      Message.error(message)
      return Promise.reject(new Error(message))
    }
  }, error => {
    Message.error(error)
    return Promise.reject(error)
  }
)
export default service
