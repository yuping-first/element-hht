import request from '@/utils/request'
// 获取所有角色列表
export function getRoleList(params) {
  return request({
    url: '/sys/role',
    params
  })
}
// }根据id查询公司
export function getCompanyInfo(id) {
  return request({
    url: `/company/${id}`
  })
}
// 删除角色
export function delRoleList(id) {
  return request({
    url: `/sys/role/${id}`,
    method: 'delete'
  })
}
// 修改角色
export function updateRole(data) {
  return request({
    url: `/sys/role/${data.id}`,
    method: 'put',
    data
  })
}
// 根据角色详情
export function getRoleDetail(id) {
  return request({
    url: `/sys/role/${id}`
  })
}
// 新增角色
export function addRoles(data) {
  return request({
    url: '/sys/role',
    method: 'post',
    data
  })
}
// 给角色分配权限
export function assignPerm(data) {
  return request({
    url: '/sys/role/assignPrem',
    method: 'put',
    data
  })
}


