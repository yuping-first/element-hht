<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
           <el-tab-pane label="角色管理">
             <el-row style="height: 60px">
            <el-button size="small" type="primary" icon="el-icon-plus" @click="showDialog = true">
              新增角色
            </el-button>
          </el-row>
          <el-table border="" :data="list" v-loading="loading">
            <el-table-column header-align="left" align="center" type="index" label="序号" width="120">
            </el-table-column>
            <el-table-column header-align="left" align="center" prop="name" label="角色名称" width="240">
            </el-table-column>
            <el-table-column header-align="left" align="center" prop="description" label="描述">
            </el-table-column>
             <el-table-column header-align="left" align="center" label="操作">
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                <el-button size="small" type="danger" @click="delRoleList(row.id)">删除</el-button>
                </template>
            </el-table-column>
          </el-table>
              <el-row type="flex" justify="center" align="middle" style="height: 60px">
              <!-- 分页组件 -->
              <el-pagination @current-change="change" :page-size="page.pagesize" :total="page.total" layout="prev,pager,next" />
            </el-row>
           </el-tab-pane>
           <el-tab-pane label="公司管理">
              <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form label-width="120px" style="margin-top:50px">
              <el-form-item label="公司名称" >
                <el-input disabled style="width:400px" v-model="formData.name" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input disabled style="width:400px" v-model="formData.companyAddress" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input disabled style="width:400px" v-model="formData.mailbox" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input type="textarea" :rows="3" disabled style="width:400px" v-model="formData.remarks" />
              </el-form-item>
            </el-form>
           </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <el-dialog
      title="编辑弹层"
      :visible="showDialog"
      @close="btnCancel">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item label="角色" prop="name">
          <el-input v-model="roleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="8">
          <el-button @click="btnCancel">取 消</el-button>
          <el-button type="primary" @click="btnOk">确 定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
<!--    权限弹层-->
    <el-dialog title="分配权限" :visible="showPermDialog" @close="btnPermCancel">
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        :data="permData"
        :props="defaultProps"
        :show-checkbox="true"
        :check-strictly="true"
        :default-expand-all="true"
        :default-checked-keys="selectCheck"
        node-key="id"
      />
      <!-- 确定 取消 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOK">确定</el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, delRoleList, getRoleDetail, updateRole, addRoles, assignPerm } from '@/api/setting'
import { mapGetters } from 'vuex'
import { getPermissionList } from '@/api/permission'
import { tranListToTreeData } from '@/utils'
export default {
  data() {
    return {
      loading: false,
      list:[], // 角色数据
      page: {
        page: 1,
        pagesize: 10,
        total: 0
      }, // 页码
      formData: {}, // 公司列表
      showDialog: false, // 弹框层
      roleForm: {
        name: '',
        description: ''
      }, // 弹层信息
      rules: { name: [{ required: true, message: '角色名不能为空', trigger: 'blur' }] },
      showPermDialog: false, // 控制分配权限弹层的显示后者隐藏
      defaultProps: {
        label: 'name'
      },
      permData: [], // 专门用来接收权限数据 树形数据
      selectCheck: [], // 定义一个数组来接收 已经选中的节点
      roleId: null // 用来记录分配角色的id
    }
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    // 分配权限
    async assignPerm(id) {
      this.permData = tranListToTreeData(await getPermissionList(), '0')
      this.roleId = id
      const { permIds } = await getRoleDetail(id)
      this.selectCheck = permIds
      this.showPermDialog = true
    },
    // 权限ok
    async btnPermOK() {
      // getCheckedKeys element-ui自带方法
      await assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      this.$message.success('权限分配成功')
      this.showPermDialog = false
    },
    // 权限取消
    btnPermCancel() {
      this.selectCheck = []
      this.showPermDialog = false
    },
    // 角色列表
    async getRoleList() {
      this.loading = true
      const { total, rows } = await getRoleList(this.page)
      this.list = rows
      this.page.total = total
      this.loading = false
    },
    change(newchange) {
      this.page.page = newchange
      this.getRoleList()
    },
    // 公司列表
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId)
    },
    // 删除
    async delRoleList(id) {
      try {
        await this.$confirm('确定要删除吗')
        await delRoleList(id)
        this.getRoleList()
        this.$message.success('删除成功')
      } catch (e) {
        console.log(e)
      }
    },
    // 编辑
    async editRole(id) {
      this.roleForm = await getRoleDetail(id)
      this.showDialog = true
    },
    // 确定
    async btnOk() {
      try {
        await this.$refs.roleForm.validate()
        if (this.roleForm.id) {
          // 编辑
          await updateRole(this.roleForm)
        } else {
          // 新增
          await addRoles(this.roleForm)
        }
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false
      } catch (e) {
        console.log(e)
      }
    },
    // 取消
    btnCancel() {
      this.roleForm = {
        name: '',
        description: ''
      }
      this.$refs.roleForm.resetFields()
      this.showDialog = false
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  }
}
</script>

<style>

</style>

