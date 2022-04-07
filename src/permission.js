import router from '@/router'
import store from '@/store'
// 进度条
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式
// 不走守卫的页面
const whiteList = ['/login', '/404']
// 前置守卫
router.beforeEach(async function(to, from, next) {
  NProgress.start() // 进度条开启
  // 有token
  if (store.getters.token) {
    if (to.path ==='/login') {
      next('/')
    } else {
      // 没有userId的情况下再去获取userInfo
      if (!store.getters.userId) {
        await store.dispatch('user/getUserInfo')
      }
      next()
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) > -1) {
      next()
    } else {
      next('/login')
    }
  }
  NProgress.done() // 进度条关闭
})

// 后置守卫
router.afterEach(function() {
  NProgress.done() // 进度条关闭
})
