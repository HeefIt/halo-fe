<template>
  <div class="user-management">
    <div class="management-header">
      <div class="header-info">
        <h2>用户管理</h2>
        <p>管理系统用户账户和权限配置</p>
      </div>
      <div class="header-actions">
        <div class="search-group">
          <div class="search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input v-model="searchForm.userName" placeholder="用户名..." @keyup.enter="fetchUsers" />
          </div>
          <div class="search-input">
            <input v-model="searchForm.nickName" placeholder="昵称..." @keyup.enter="fetchUsers" />
          </div>
          <div class="search-input">
            <input v-model="searchForm.email" placeholder="邮箱..." @keyup.enter="fetchUsers" />
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" @click="resetSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            重置
          </button>
          <button class="btn-primary" @click="fetchUsers">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            搜索
          </button>
          <button class="btn-accent" @click="addUser">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加用户
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon users">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总用户数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon online">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ onlineCount }}</span>
          <span class="stat-label">在线用户</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">活跃用户</span>
        </div>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户信息</th>
              <th>联系方式</th>
              <th>状态</th>
              <th>在线</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" @dblclick="showUserDetails(user)">
              <td class="id-cell">
                <span class="id-badge">#{{ user.id }}</span>
              </td>
              <td class="user-cell">
                <div class="user-avatar">
                  {{ (user.nickName || user.userName || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.nickName || user.userName }}</span>
                  <span class="user-username">@{{ user.userName }}</span>
                </div>
              </td>
              <td class="contact-cell">
                <div class="contact-item" v-if="user.email">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {{ user.email }}
                </div>
                <div class="contact-item" v-if="user.phone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {{ user.phone }}
                </div>
                <span v-if="!user.email && !user.phone" class="no-data">暂无</span>
              </td>
              <td class="status-cell">
                <label class="status-switch" :class="{ disabled: user.userName === 'haloAdmin' }">
                  <input
                    type="checkbox"
                    :checked="user.status === 0"
                    :disabled="user.userName === 'haloAdmin'"
                    @change="handleStatusChange(user)"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-label">{{ user.status === 0 ? '启用' : '禁用' }}</span>
                </label>
              </td>
              <td class="online-cell">
                <span class="online-badge" :class="{ online: user.online }">
                  <span class="online-dot"></span>
                  {{ user.online ? '在线' : '离线' }}
                </span>
              </td>
              <td class="action-cell">
                <div class="action-buttons-cell">
                  <button class="action-btn edit" @click="editUser(user)" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    class="action-btn kick"
                    @click="kickUser(user)"
                    :disabled="user.userName === 'haloAdmin' || !user.online"
                    title="踢下线"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && users.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="17" y1="11" x2="23" y2="11"></line>
                  </svg>
                  <h3>暂无用户数据</h3>
                  <p>点击"添加用户"创建第一个用户</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-container" v-if="users.length > 0">
      <div class="pagination-info">
        显示 {{ (pagination.pageNum - 1) * pagination.pageSize + 1 }} - 
        {{ Math.min(pagination.pageNum * pagination.pageSize, pagination.total) }} 条，
        共 {{ pagination.total }} 条
      </div>
      <div class="pagination-controls">
        <select v-model="pagination.pageSize" @change="handleSizeChange" class="page-size-select">
          <option :value="5">5条/页</option>
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
        <div class="page-buttons">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-btn"
            :class="{ active: page === pagination.pageNum, ellipsis: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && handleCurrentChange(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div class="modal-overlay" v-if="showAddUserDialog" @click.self="showAddUserDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
            <button class="modal-close" @click="showAddUserDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>用户名</label>
              <input v-model="userForm.userName" placeholder="请输入用户名" />
            </div>
            <div class="form-group">
              <label>昵称</label>
              <input v-model="userForm.nickName" placeholder="请输入昵称" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>邮箱</label>
                <input v-model="userForm.email" placeholder="请输入邮箱" />
              </div>
              <div class="form-group">
                <label>手机号</label>
                <input v-model="userForm.phone" placeholder="请输入手机号" />
              </div>
            </div>
            <div class="form-group">
              <label>状态</label>
              <div class="status-options">
                <label class="status-option" :class="{ active: userForm.status === 0 }">
                  <input type="radio" :value="0" v-model="userForm.status" />
                  <span class="option-label">启用</span>
                </label>
                <label class="status-option" :class="{ active: userForm.status === 1 }">
                  <input type="radio" :value="1" v-model="userForm.status" />
                  <span class="option-label">禁用</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showAddUserDialog = false">取消</button>
            <button class="btn-primary" @click="saveUser">保存</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div class="modal-overlay" v-if="showUserDetailsDialog" @click.self="showUserDetailsDialog = false">
        <div class="modal-content modal-details">
          <div class="modal-header">
            <h3>用户详情</h3>
            <button class="modal-close" @click="showUserDetailsDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="detail-header">
              <div class="detail-avatar">
                {{ (selectedUser.nickName || selectedUser.userName || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="detail-title">
                <h4>{{ selectedUser.nickName || selectedUser.userName }}</h4>
                <span class="detail-username">@{{ selectedUser.userName }}</span>
              </div>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">用户ID</span>
                <span class="detail-value">#{{ selectedUser.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">邮箱</span>
                <span class="detail-value">{{ selectedUser.email || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">手机号</span>
                <span class="detail-value">{{ selectedUser.phone || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">状态</span>
                <span class="detail-value" :class="selectedUser.status === 0 ? 'status-active' : 'status-inactive'">
                  {{ selectedUser.status === 0 ? '启用' : '禁用' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">在线状态</span>
                <span class="detail-value" :class="selectedUser.online ? 'status-online' : 'status-offline'">
                  {{ selectedUser.online ? '在线' : '离线' }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" @click="showUserDetailsDialog = false">确定</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { authApi } from '@/api/modules/auth'
import { normalizePageSize } from '@/utils/pagination'

const userStore = useUserStore()

const loading = ref(false)

const searchForm = reactive({
  id: '',
  nickName: '',
  userName: '',
  email: '',
  phone: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const onlineStatusTimer = ref(null)

const showAddUserDialog = defineModel('showAddUserDialog', { type: Boolean })
const editingUser = defineModel('editingUser', { type: Object })
const userForm = defineModel('userForm', { type: Object })
const users = defineModel('users', { type: Array })

const showUserDetailsDialog = ref(false)
const selectedUser = ref(null)

const onlineCount = computed(() => users.value.filter(u => u.online).length)
const activeCount = computed(() => users.value.filter(u => u.status === 0).length)

const visiblePages = computed(() => {
  const total = pagination.total
  const pageSize = pagination.pageSize
  const current = pagination.pageNum
  const totalPages = Math.ceil(total / pageSize)
  
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const pages = []
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', totalPages)
  } else if (current >= totalPages - 3) {
    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', totalPages)
  }
  return pages
})

const handleSizeChange = (val) => {
  pagination.pageSize = normalizePageSize(val, pagination.pageSize)
  pagination.pageNum = 1
  fetchUsers()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchUsers()
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      id: searchForm.id,
      nickName: searchForm.nickName,
      userName: searchForm.userName,
      email: searchForm.email,
      phone: searchForm.phone
    }
    
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await authApi.selectUserPage(params)
    if (response.success && response.code === 200) {
      users.value = response.data.result || []
      pagination.total = response.data.total || 0
      
      if (users.value.length === 0 && (searchForm.id || searchForm.nickName || searchForm.userName || searchForm.email || searchForm.phone)) {
        ElMessage.info('未找到符合条件的用户数据')
      }
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
    ElMessage.error('获取用户列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.id = ''
  searchForm.nickName = ''
  searchForm.userName = ''
  searchForm.email = ''
  searchForm.phone = ''
  pagination.pageNum = 1
  fetchUsers()
}

const handleStatusChange = async (user) => {
  const newStatus = user.status === 0 ? 1 : 0
  const success = await userStore.setUserStatus(user.id, newStatus)
  if (success) {
    user.status = newStatus
    if (newStatus === 1) {
      user.online = false
    }
  }
}

const addUser = () => {
  editingUser.value = null
  resetUserForm()
  showAddUserDialog.value = true
}

const editUser = (user) => {
  editingUser.value = user
  Object.assign(userForm.value, user)
  showAddUserDialog.value = true
}

const kickUser = (user) => {
  ElMessageBox.confirm(`确定要将用户 "${user.userName}" 踢下线吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await authApi.kickOutUser(user.id)
      if (response.success) {
        ElMessage.success(`用户 "${user.userName}" 已被踢下线`)
        user.online = false
        if (selectedUser.value?.id === user.id) {
          selectedUser.value.online = false
        }
        await fetchUsers()
      } else {
        ElMessage.error(response.message || '踢下线失败')
      }
    } catch (error) {
      console.error('踢用户下线错误:', error)
      ElMessage.error('踢下线失败，请检查网络连接')
    }
  }).catch(() => {})
}

const saveUser = async () => {
  if (!userForm.value.userName?.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }

  try {
    if (editingUser.value) {
      const payload = {
        ...userForm.value,
        userName: userForm.value.userName?.trim(),
        nickName: userForm.value.nickName?.trim(),
        email: userForm.value.email?.trim(),
        phone: userForm.value.phone?.trim()
      }
      const response = await authApi.updateUserInfo(editingUser.value.id, payload)
      if (!response.success || response.code !== 200) {
        ElMessage.error(response.message || '用户更新失败')
        return
      }
      ElMessage.success('用户信息已更新')
    } else {
      const payload = {
        userName: userForm.value.userName?.trim(),
        nickName: userForm.value.nickName?.trim(),
        email: userForm.value.email?.trim(),
        phone: userForm.value.phone?.trim(),
        status: userForm.value.status
      }
      const response = await authApi.addUser(payload)
      if (!response.success || response.code !== 200) {
        ElMessage.error(response.message || '用户添加失败')
        return
      }
      ElMessage.success('用户添加成功，默认密码为 123456')
    }

    await fetchUsers()
    resetUserForm()
    showAddUserDialog.value = false
    editingUser.value = null
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '保存用户失败')
  }
}

const showUserDetails = (user) => {
  selectedUser.value = user
  showUserDetailsDialog.value = true
}

const resetUserForm = () => {
  Object.assign(userForm.value, {
    id: null,
    userName: '',
    nickName: '',
    email: '',
    phone: '',
    status: 0,
    online: false
  })
}

onMounted(() => {
  fetchUsers()
  onlineStatusTimer.value = setInterval(fetchUsers, 300000)
})

onUnmounted(() => {
  if (onlineStatusTimer.value) {
    clearInterval(onlineStatusTimer.value)
  }
})

defineExpose({
  resetUserForm,
  fetchUsers
})
</script>

<style scoped>
.user-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.header-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.header-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  gap: 8px;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.search-input:focus-within {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.search-input svg {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.search-input input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  padding: 10px 0;
  width: 120px;
}

.search-input input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary, .btn-accent {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-accent {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
  color: white;
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.stat-icon.online {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon.active {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.data-table tbody tr {
  transition: all 0.3s ease;
}

.data-table tbody tr:hover {
  background: rgba(139, 92, 246, 0.05);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.id-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  font-family: 'JetBrains Mono', monospace;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.user-username {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.contact-cell .contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.contact-cell .contact-item:last-child {
  margin-bottom: 0;
}

.contact-cell .contact-item svg {
  color: rgba(255, 255, 255, 0.4);
}

.no-data {
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.status-switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-switch input {
  display: none;
}

.switch-slider {
  width: 44px;
  height: 24px;
  background: rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: all 0.3s ease;
}

.status-switch input:checked + .switch-slider {
  background: rgba(34, 197, 94, 0.3);
}

.status-switch input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.switch-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.online-badge.online {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.online-badge.online .online-dot {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.action-btn.kick {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.action-btn.kick:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.empty-cell {
  padding: 60px 20px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 4px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.pagination-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-size-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.page-size-select option {
  background: #1e293b;
}

.page-buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.page-btn.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
}

.page-btn.ellipsis {
  cursor: default;
  background: transparent;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.modal-details {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.status-options {
  display: flex;
  gap: 12px;
}

.status-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-option input {
  display: none;
}

.status-option.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.status-option.active .option-label {
  color: #4ade80;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 22px;
}

.detail-title h4 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.detail-username {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.detail-value {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.detail-value.status-active {
  color: #4ade80;
}

.detail-value.status-inactive {
  color: #f87171;
}

.detail-value.status-online {
  color: #4ade80;
}

.detail-value.status-offline {
  color: rgba(255, 255, 255, 0.5);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .search-group {
    width: 100%;
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-input input {
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
