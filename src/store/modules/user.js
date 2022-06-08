import { getToken, setToken, removeToken, getTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'
const state = {
  token: getToken(),
  userInfo: {} // 用户信息
}
const mutations = {
  // 设置token
  setToken(state, token) {
    state.token = token
    setToken(token)
  },
  // 删除token
  removeToken(state) {
    state.token = null
    removeToken()
  },
  // 设置用户信息
  setUserInfo(state, userInfo) {
    state.userInfo = { ...userInfo }
  },
  // 移除用户信息
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
const actions = {
  async login(context, data) {
    // 经过响应拦截器的处理之后 这里的result实际上就是 token
    const result = await login(data) // 实际上就是一个promise  result就是执行的结果
    // axios默认给数据加了一层data
    // 表示登录接口调用成功 也就是意味着你的用户名和密码是正确的
    // 现在有用户token
    // actions 修改state 必须通过mutations
    context.commit('setToken', result)
    getTimeStamp() // 登录成功设置时间戳
  },
  async getUserInfo(context) {
    const result = await getUserInfo()
    // 获取用户详情
    const baseInfo = await getUserDetailById(result.userId)
    const baseResult = { ...result, ...baseInfo }
    context.commit('setUserInfo', baseResult)
    return result
  },
  // 登出
  logout(context) {
    context.commit('removeToken')
    context.commit('removeUserInfo')
    // 重置路由
    resetRouter()
    // 去设置权限下的路由为初始状态
    // vuex 子模块怎么调用子模块的action 都没加锁的情况下随意调用
    // 不加命名空间的情况下的 所有mutations和action都挂在全局上 所以可以直接调用
    // 但是加了命名空间的子模块 怎么调用另一个加了命名空间的子模块的mutations
    // 加了命名空间的context指的不是全局的context
    // mutations 名称  载荷 payload 第三个参数{root:true} 调用根级的mutation或者action
    context.commit('permission/setRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

