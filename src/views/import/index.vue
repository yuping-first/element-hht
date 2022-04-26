<template>
  <!-- 放置一个导入excel的组件 -->
  <upload-excel :on-success="onSuccess" />
</template>

<script>
import { importEmployee } from '@/api/employees'
export default {
  data() {
    return {
      type: this.$route.query.type
    }
  },
  methods: {
    async onSuccess({ header, results }) {
      const userRelations = {
        '入职日期': 'timeOfEntry',
        '手机号': 'mobile',
        '姓名': 'username',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName',
        '聘用形式': 'formOfEmployment'
      }
      const newArr = results.map(item => {
        var userInfo = {}
        Object.keys(item).map(key => {
          if (userRelations[key] === 'timeOfEntry1' || userRelations[key] === 'correctionTime1') {
            userInfo[userRelations[key]] = new Date(this.formatDate(item[key], '/'))
          } else {
            userInfo[userRelations[key]] = item[key]
          }
        })
        return userInfo
      })
      await importEmployee(newArr)
      this.$message.success('批量导入员工成功')
      this.$router.back()
    },
    // 时间转化
    formatDate(numb, format) {
      const time = new Date((numb - 1) * 24 * 3600000 + 1)
      time.setYear(time.getFullYear() - 70)
      const year = time.getFullYear() + ''
      const month = time.getMonth() + 1 + ''
      const date = time.getDate() + ''
      if (format && format.length === 1) {
        return year + format + month + format + date
      }
      return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
    }
  }
}
</script>

<style>

</style>
