import request from './request'

export const authApi = {
  // 用户登录
  login: (data) => {
    return request({
      url: '/auth/user/login',
      method: 'POST',
      data
    })
  },
  
  // 用户注册
  register: (data) => {
    return request({
      url: '/auth/user/register',
      method: 'POST',
      data
    })
  },
  
  // 获取用户信息
  getUserInfo: (id) => {
    if (id) {
      // 获取指定用户信息
      return request({
        url: `/auth/user/queryById/${id}`,
        method: 'GET'
      })
    } else {
      // 获取当前登录用户信息
      return request({
        url: '/auth/user/getInfo',
        method: 'GET'
      })
    }
  },
  
  // 更新用户信息
  updateUserInfo: (id, data) => {
    return request({
      url: `/auth/user/update/${id}`,
      method: 'PUT',
      data
    })
  },
  
  // 退出登录
  logout: (data = {}) => {
    return request({
      url: '/auth/user/logout',
      method: 'POST',
      data
    })
  },
  
  // 设置用户状态
  setUserStatus: (id, status) => {
    return request({
      url: '/auth/user/status',
      method: 'POST',
      params: { id, status }
    })
  },
  
  // 踢用户下线
  kickOutUser: (id) => {
    return request({
      url: '/auth/user/kickout',
      method: 'POST',
      params: { id }
    })
  },
  
  // 检查用户是否在线
  isUserOnline: (id) => {
    return request({
      url: '/auth/user/isLogin',
      method: 'POST',
      params: { id }
    })
  },
  
  // 分页查询用户
  selectUserPage: (params) => {
    return request({
      url: '/auth/user/selectPage',
      method: 'GET',
      params
    })
  }
}