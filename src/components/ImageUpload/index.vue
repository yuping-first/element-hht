<template>
<div>
  <el-upload
  list-type="picture-card"
  :limit="1"
  action="#"
  :on-preview="preview"
  :file-list="fileList"
  :class="{disabled: fileComputed }"
  :on-remove="handleRemove"
  :on-change="changeFile"
  :before-upload="beforeUpload"
  :http-request="upload">
     <i class="el-icon-plus" />
  </el-upload>
  <el-progress v-if="showPercent" style="width: 180px" :percentage="percent" />
   <el-dialog title="图片" :visible.sync="showDialog">
      <img :src="imgUrl" style="width:100%" alt="">
   </el-dialog>
</div>
</template>

<script>
  // 2AKIDYw4vVosgDTTCeoiLiocBSSBdpthFWWEf2
  // 2C8nAG5ewyjDQM1PWMvDEyRdXAWbQzHI22
import COS from 'cos-js-sdk-v5'
const cos = new COS ({
  SecretId: '', // 身份识别 ID
  SecretKey: '' // 身份密钥
})
export default {
  data() {
    return {
      fileList: [], // 图片地址设置为数组
      showDialog: false, // 控制显示弹层
      imgUrl: '',
      currentFileUid: null, // 记录当前上传的图片id
      percent: 0, // 记录进度条
      showPercent: false // 进度条显示
    }
  },
  methods: {
    preview(file) {
      this.imgUrl = file.url
      this.showDialog = true
    },
    handleRemove(file, fileList) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
      // 或者 this.fileList = flleList
    },
    changeFile(file, fileList) {
      // file是最新文件 fileList是最新数组
      this.fileList = fileList.map(item => item)
    },
    beforeUpload(file) {
      // 文件类型
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      // 文件大小
      const maxSize = 5 * 1024 * 1024
      if (maxSize < file.size) {
        this.$message.error('图片大小最大不能超过5M')
        return false
      }
      this.showPercent = true
      this.currentFileUid = file.uid
      return true
    },
    upload(params) {
      if (params.file) {
        cos.putObject({
          Bucket: 'yikz-1304432183', // 存储桶
          Region: 'ap-beijing', // 地域
          Key: params.file.name, // 文件名
          Body: params.file, // 要上传的文件对象
          StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
          // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
          onProgress: (params) => {
            this.percent = params.percent * 100
          }
        }, (err, data) => {
          // data返回数据之后 应该如何处理
          if (!err && data.statusCode === 200) {
            this.fileList = this.fileList.map(item => {
              if (item.uid === this.currentFileUid) {
                return { url: 'http://' + data.Location, upload: true }
              }
              return item
            })
            setTimeout(() => {
              this.showPercent = false
              this.percent = 0
            }, 2000)
          }
        })
      }
    }
  },
  computed: {
    fileComputed() {
      return this.fileList.length === 1
    }
  }
}
</script>

<style>
.disabled .el-upload--picture-card {
  display: none
}
</style>
