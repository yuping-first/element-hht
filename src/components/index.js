// 负责全局组建注册
import pageTools from './pageTools'
import UploadExcel from './UploadExcel'
import ImageUpload from './ImageUpload'
import ScreenFull from './ScreenFull'
import ThemePicker from './ThemePicker'
import lang from './lang'
import TagsView from './TagsView'
export default {
  install(Vue) {
    Vue.component('pageTools', pageTools)
    Vue.component('UploadExcel', UploadExcel)
    Vue.component('ImageUpload', ImageUpload) // 注册导入上传组件
    Vue.component('ScreenFull', ScreenFull) // 注册全屏组件
    Vue.component('ThemePicker', ThemePicker)
    Vue.component('lang', lang)
    Vue.component('TagsView', TagsView)
  }
}
