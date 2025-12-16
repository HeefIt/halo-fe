<!--
  UserManagement 用户管理组件
  功能描述：管理员管理系统用户的组件
  主要功能：
    - 用户列表查看：分页查看所有用户信息
    - 用户搬查：按ID、用户名、昵称、邮箱、手机号等条件搬查
    - 用户管理：添加、编辑、删除用户
    - 状态管理：激活/禁用用户、打钨本地辛苦的用户
    - 用户详情：双击用户行查看新信息详情
  使用位置：Admin.vue的"用户管理"上
-->
<template>
  <div class="tab-content">
    <div class="section-header">
      <h2>用户管理</h2>
      <div class="actions">
        <el-input
          v-model="searchForm.id"
          placeholder="搜索ID..."
          style="width: 120px; margin-right: 10px;"
          type="number"
        />
        <el-input
          v-model="searchForm.userName"
          placeholder="搜索用户名..."
          style="width: 120px; margin-right: 10px;"
        />
        <el-input
          v-model="searchForm.nickName"
          placeholder="搜索昵称..."
          style="width: 120px; margin-right: 10px;"
        />
        <el-input
          v-model="searchForm.email"
          placeholder="搜索邮箱..."
          style="width: 150px; margin-right: 10px;"
        />
        <el-input
          v-model="searchForm.phone"
          placeholder="搜索手机号..."
          style="width: 150px; margin-right: 10px;"
        />
        <el-button type="primary" @click="fetchUsers">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" @click="addUser" style="margin-left: 16px;">
          <el-icon><Plus /></el-icon>添加用户
        </el-button>
      </div>
    </div>
    
    <el-table :data="users" style="width: 100%" border v-loading="loading" @row-dblclick="showUserDetails">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="在线状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">
            {{ scope.row.status === 0 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            active-text="启用"
            inactive-text="禁用"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="kickUser(scope.row)"
            :disabled="scope.row.userName === 'haloAdmin' || scope.row.status !== 0"
          >
            踢下线
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 空状态提示 -->
    <el-empty v-if="!loading && users.length === 0" description="暂无用户数据" />
    
    <!-- 分页 -->
    <el-pagination
      v-if="users.length > 0"
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[5, 10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: center;"
    />
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog v-model="showAddUserDialog" :title="editingUser ? '编辑用户' : '添加用户'" width="500px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.userName" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickName" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userForm.status">
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddUserDialog = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 用户详情对话框 -->
    <el-dialog v-model="showUserDetailsDialog" title="用户详情" width="500px">
      <el-form label-width="80px" :model="selectedUser" v-if="selectedUser">
        <el-form-item label="用户ID">
          <el-input v-model="selectedUser.id" readonly />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="selectedUser.userName" readonly />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="selectedUser.nickName" readonly />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="selectedUser.email" readonly />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="selectedUser.phone" readonly />
        </el-form-item>
        <el-form-item label="状态">
          <el-input :value="selectedUser.status === 0 ? '启用' : '禁用'" readonly />
        </el-form-item>
        <el-form-item label="在线状态">
          <el-input :value="selectedUser.status === 0 ? '在线' : '离线'" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showUserDetailsDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'

const userStore = useUserStore()

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  id: '',
  nickName: '',
  userName: '',
  email: '',
  phone: ''
})

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 在线状态刷新定时器
const onlineStatusTimer = ref(null)

// 控制对话框显示
const showAddUserDialog = defineModel('showAddUserDialog', { type: Boolean })

// 编辑状态
const editingUser = defineModel('editingUser', { type: Object })

// 用户表单数据
const userForm = defineModel('userForm', { type: Object })

// 用户数据
const users = defineModel('users', { type: Array })

// 用户详情对话框显示控制
const showUserDetailsDialog = ref(false)

// 当前选中的用户
const selectedUser = ref(null)

// 处理每页数量变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchUsers()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchUsers()
}

// 获取用户列表
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
    
    // 移除空值参数（但保留数字0）
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    console.log('发送的查询参数:', params); // 调试用，可以查看实际发送的参数
    
    const response = await authApi.selectUserPage(params)
    if (response.success && response.code === 200) {
      // 根据后端实际返回的数据结构进行适配
      users.value = response.data.result || []
      pagination.total = response.data.total || 0
      
      // 当搜索结果为空时给出提示
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

// 重置搜索条件
const resetSearch = () => {
  searchForm.id = ''
  searchForm.nickName = ''
  searchForm.userName = ''
  searchForm.email = ''
  searchForm.phone = ''
  pagination.pageNum = 1
  fetchUsers()
}

// 处理用户状态变更
const handleStatusChange = async (user) => {
  const success = await userStore.setUserStatus(user.id, user.status)
  if (!success) {
    // 如果更新失败，恢复原来的状态
    user.status = user.status === 0 ? 1 : 0
  }
}

// 添加用户
const addUser = () => {
  editingUser.value = null
  resetUserForm()
  showAddUserDialog.value = true
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = user
  Object.assign(userForm.value, user)
  showAddUserDialog.value = true
}

// 踢用户下线
const kickUser = (user) => {
  ElMessageBox.confirm(`确定要将用户 "${user.userName}" 踢下线吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 直接踢下线，因为按钮已经根据状态禁用
      const response = await authApi.kickOutUser(user.id)
      if (response.success) {
        ElMessage.success(`用户 "${user.userName}" 已被踢下线`)
        // 更新用户状态为禁用
        user.status = 1
      } else {
        ElMessage.error(response.message || '踢下线失败')
      }
    } catch (error) {
      console.error('踢用户下线错误:', error)
      ElMessage.error('踢下线失败，请检查网络连接')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 保存用户
const saveUser = () => {
  if (editingUser.value) {
    // 编辑用户
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...userForm.value }
    }
    ElMessage.success('用户信息已更新')
  } else {
    // 添加新用户
    const newUser = {
      ...userForm.value,
      id: Math.max(...users.value.map(u => u.id)) + 1
    }
    users.value.push(newUser)
    ElMessage.success('用户添加成功')
  }
  
  // 重置表单和对话框
  resetUserForm()
  showAddUserDialog.value = false
  editingUser.value = null
}

// 显示用户详情
const showUserDetails = (user) => {
  selectedUser.value = user
  showUserDetailsDialog.value = true
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm.value, {
    id: null,
    userName: '',
    nickName: '',
    email: '',
    phone: '',
    status: 0
  })
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
  // 每300秒刷新一次用户列表以更新状态
  onlineStatusTimer.value = setInterval(fetchUsers, 300000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (onlineStatusTimer.value) {
    clearInterval(onlineStatusTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  resetUserForm,
  fetchUsers
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
</style>