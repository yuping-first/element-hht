<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共{{page.total}}条记录</span>
        <template slot="after">
          <el-button size="small" type="warning" @click="$router.push('/import')">excel导入</el-button>
          <el-button size="small" type="danger" @click="exportData">excel导出</el-button>
          <el-button size="small" type="primary" @click="add" :disabled="!checkPermission('POINT-USER-ADD')">新增员工</el-button>
        </template>
      </page-tools>
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column label="姓名" sortable="" prop="username" />
          <el-table-column label="头像" align="center">
            <template slot-scope="{ row }">
              <img
                :src="row.staffPhoto"
                alt=""
                style="border-radius: 50%; width: 100px; height: 100px; padding: 10px"
                v-imageerror="require('@/assets/common/bigUserHeader.png')"
                @click ='showCode(row.staffPhoto)'>
            </template>
          </el-table-column
            >
          <el-table-column label="工号" sortable="" prop="workNumber" />
          <el-table-column label="聘用形式" sortable="" prop="formOfEmployment" :formatter="formatEmployment" />
          <el-table-column label="部门" sortable="" prop="departmentName" />
          <el-table-column label="入职时间" sortable="" prop="timeOfEntry">
            <template slot-scope="{ row }">
            {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" sortable="" prop="enableState">
            <template slot-scope="{ row }">
              <el-switch :value="row.enableState === 1"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button type="text" size="small" @click="delEmployee(row.id)" :disabled="!checkPermission('point-user-delete')">删除</el-button>
            </template>
          </el-table-column>
          </el-table>
        </el-card>
<!--      分页-->
      <el-row type="flex" justify="center" align="middle" style="height: 60px">
        <el-pagination
          layout="prev, pager, next"
          :page-size="page.size"
          :total="page.total"
          :current-page="page.page"
          @current-change="change"
          >
        </el-pagination>
      </el-row>
    </div>
    <add-employee ref="child" :show-dialog.sync="showDialog"></add-employee>
    <el-dialog
      title="二维码"
      :visible.sync="showCodeDialog"
      width="30%"
      >
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <assign-role ref="assignRole" :showRoleDialog.sync="showRoleDialog" :useId="useId"></assign-role>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import addEmployee from './components/add-employee'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import assignRole from './components/assign-role'
export default {
  data() {
    return {
      loading: false, // 进度条
      list: [], // 员工列表
      page: {
        total: 0, // 总共页数
        page: 1, // 当前页码
        size: 10 // 每页数据条数
      },
      showDialog: false, // 新增弹框
      showCodeDialog: false, // 二维码
      showRoleDialog: false, // 角色弹框
      useId: null
    }
  },
  created() {
    this.getEmployeeList()
    console.log(EmployeeEnum)
  },
  methods: {
    async editRole(id) {
      this.useId = id
      await this.$refs.assignRole.getUserDetailById(id)
      this.showRoleDialog = true
    },
    // 二维码
    showCode(url) {
      if (url) {
        this.showCodeDialog = true
        this.$nextTick(() => {
          QrCode.toCanvas(this.$refs.myCanvas, url)
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    },
    // 分页方法
    change(newPage) {
      this.page.page = newPage
      this.getEmployeeList()
    },
    // 页面初始化
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.list = rows
      this.page.total = total
      this.loading = false
    },
    // 聘用形式
    formatEmployment(row, column, cellValue, index) {
      let obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    // 删除员工
    async delEmployee(id) {
      try {
        await this.$confirm('确定要删除吗')
        await delEmployee(id)
        this.getEmployeeList()
        this.$message.success('删除成功')
      } catch (error) {
        console.log(error)
      }
    },
    // 新增员工
    add() {
      this.showDialog = true
    },
    // 导出数据
    exportData() {
      const headers = {
        '入职日期': 'timeOfEntry',
        '手机号': 'mobile',
        '姓名': 'username',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName',
        '聘用形式': 'formOfEmployment'
      }
      // 懒加载
      import('@/vendor/Export2Excel').then(async excel => {
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows)
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2']
        excel.export_json_to_excel({
          header: Object.keys(headers), // 代表导出excel的头部
          data,
          filename: '员工信息表', // excel的表名字
          autoWidth: true,
          bookType: 'xlsx',
          multiHeader, // 复杂表头的部分
          merges // 需要合并的部分
        })
      })
    },
    formatJson(headers, rows) {
      return rows.map(item => {
        // ['入职日期','手机号','姓名','转正日期','工号','部门','聘用形式']
        return Object.keys(headers).map(key => {
          if (headers[key] === 'correctionTime' || headers[key] === 'timeOfEntry') {
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(obj => obj.id === item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
      })
    }
  },
  components: {
    addEmployee,
    assignRole
  }
}
</script>

<style>

</style>

