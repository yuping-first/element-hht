<template>
  <div class="dashboard-container">
      <el-card class="tree-card">
        <treeTools :treeNode="company" :is-tools="true" @addDepts="addDepts"></treeTools>
        <el-tree :data="departs" :props="defaultProps" default-expand-all>
          <treeTools slot-scope="{ data }" :treeNode="data" @addDepts="addDepts" @delpats = 'getDepartments' @editDepts="editDepts"></treeTools>
        </el-tree>
      </el-card>
    <add-dept ref="addDept" :show-dialog.sync="showDialog" :tree-node="node" @addDepts="getDepartments" ></add-dept>
  </div>
</template>

<script>
import treeTools from './components/tree-tools'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils/index'
import AddDept from './components/add-dept'
export default {
  components: {
    treeTools,
    AddDept
  },
  data() {
    return {
      company: {},
      departs: [],
      defaultProps: {
        label: 'name' // 表示从这个属性显示内容
      },
      showDialog: false, // 增加部门弹窗
      node: null // 当前的点击的部门
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    async getDepartments() {
      try {
        const result = await getDepartments()
        this.company = { name: result.companyName, manager: '负责人', id: '' }
        this.departs = tranListToTreeData(result.depts, '')
        console.log(result)
      } catch (e) {
        console.log(e)
      }
    },
    // 添加组织
    addDepts(node) {
      this.showDialog = true
      this.node = node
    },
    // 编辑
    editDepts(node) {
      this.showDialog = true
      this.node = node
      console.log(this.$refs.addDept)
      this.$refs.addDept.getDepartDetail(node.id)
    }
  }
}
</script>

<style scoped>
.tree-card {
  padding: 30px  140px;
  font-size:14px;
}
</style>

