import request from './request'

export const fileApi = {
  // 文件上传
  uploadFile: (file, description) => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    
    return request({
      url: '/file/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 图片上传
  uploadImage: (file, description) => {
    const formData = new FormData()
    formData.append('image', file)
    if (description) {
      formData.append('description', description)
    }
    
    return request({
      url: '/file/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 根据ID获取文件信息
  getFileById: (fileId) => {
    return request({
      url: `/file/${fileId}`,
      method: 'GET'
    })
  },
  
  // 删除文件
  deleteFile: (fileId) => {
    return request({
      url: `/file/${fileId}`,
      method: 'DELETE'
    })
  },
  
  // 获取文件列表
  getFileList: (page = 1, size = 10) => {
    return request({
      url: '/file/list',
      method: 'GET',
      params: { page, size }
    })
  }
}
