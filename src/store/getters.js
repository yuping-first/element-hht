const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  name: state => state.user.userInfo.username, // 名字
  userId: state => state.user.userInfo.userId, // id
  staffPhoto: state => state.user.userInfo.staffPhoto //头像信息
}
export default getters
