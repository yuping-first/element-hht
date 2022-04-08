import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getTimeStamp } from '@/utils/auth'
const TimeOut = 3600 // 定义超时时间
import router from '@/router'
// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})
// 请求拦截器(参数固定 config和 error)  必须return config
service.interceptors.request.use(config => {
  if (store.getters.token) {
    if (IsCheckTimeOut) {
      store.dispatch('user/logout')
      router.push('/login')
      return Promise.reject(new Error('token超时了'))
    }
    config.headers['Authorization'] = `Bearer ${store.getters.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})
// 响应拦截器（参数固定 response和error）
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
    if (error.response && error.response.data && error.response.data.code === 10002){
      store.dispatch('user/logout')
      router.push('/login')
    } else {
      Message.error(error)
    }
    return Promise.reject(error)
  }
)
// 时间戳
function IsCheckTimeOut() {
  const curr = Date.now()
  const timeStemp = getTimeStamp()
  return (curr - timeStemp) / 1000 > TimeOut
}
export default service
