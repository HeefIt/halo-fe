<!--
  Profile 個人中心组件
  功能描述：用戶个人檔案費傷的组件
  主要功能：
    - 个人信息展示：头像、用户名、昵称、邮箱、性別、加入時間等
    - 成就德勇墨：水上段物顔麫手鹿再画時分間封平話
    - 刺题記錄：最近提交的唾驄物記錄（包含提交結果、時間、風悍置位、分示確較）
    - 學習統計：难度虒分提進、提交日歷、學習計釈
    - 头像编辑：支持上传新的头像、雌击预觘
  使用位置：路由 /profile
-->
<template>
  <div class="profile-page">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="nav-content">
          <div class="nav-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <h1>个人中心</h1>
          </div>
          
          <div class="nav-right">
            <el-button @click="$router.push('/home')" type="primary" plain>
              返回首页
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="profile-layout">
          <!-- 左侧个人信息卡片 -->
          <div class="profile-sidebar">
            <el-card class="profile-card">
              <div class="profile-info">
                <div class="avatar-section">
                  <el-avatar 
                    :src="userStore.userAvatar" 
                    :size="80"
                    @dblclick="viewAvatar"
                    class="avatar-image"
                  >
                    {{ userStore.userName.charAt(0) }}
                  </el-avatar>
                  <el-button size="small" text @click="editAvatar">
                    <el-icon><Camera /></el-icon>
                    更换头像
                  </el-button>
                </div>
                
                <div class="user-info">
                  <h2 class="user-nickname">{{ userStore.userName }}</h2>
                  <p class="user-name" v-if="userStore.userInfo && userStore.userInfo.userName">
                    @{{ userStore.userInfo.userName }}
                  </p>
                  <p class="user-email" v-if="userInfo.email">{{ userInfo.email }}</p>
                  <p class="user-gender" v-if="userInfo.gender !== undefined">
                    性别：{{ userInfo.gender === 1 ? '男' : '女' }}
                  </p>
                  <p class="join-date" v-if="userInfo.joinDate">加入时间：{{ formatDate(userInfo.joinDate) }}</p>
                  <p class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</p>
                </div>
                
                <div class="user-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ userStats.totalSolved }}</div>
                    <div class="stat-label">答对题数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ userStats.totalAttempted }}</div>
                    <div class="stat-label">回答总题数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ userStats.streak }}</div>
                    <div class="stat-label">加入天数</div>
                  </div>
                </div>
              </div>
            </el-card>
            
            <!-- 成就卡片 -->
            <el-card class="achievements-card">
              <template #header>
                <span>成就徽章</span>
              </template>
              
              <div class="achievements-grid">
                <div
                  v-for="achievement in achievements"
                  :key="achievement.id"
                  class="achievement-item"
                  :class="{ unlocked: achievement.unlocked }"
                >
                  <el-icon class="achievement-icon">
                    <component :is="achievement.icon" />
                  </el-icon>
                  <div class="achievement-info">
                    <div class="achievement-name">{{ achievement.name }}</div>
                    <div class="achievement-desc">{{ achievement.description }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          
          <!-- 右侧主要内容 -->
          <div class="profile-main">
            <el-tabs v-model="activeTab" class="profile-tabs">
              <!-- 刷题记录 -->
              <el-tab-pane label="刷题记录" name="solutions">
                <div class="solutions-section">
                  <div class="section-header">
                    <h3>最近提交</h3>
                    <el-select v-model="solutionFilter" size="small">
                      <el-option label="全部" value="all" />
                      <el-option label="已通过(正确)" value="accepted" />
                      <el-option label="未通过(错误)" value="failed" />
                    </el-select>
                  </div>
                  
                  <div class="solutions-list">
                    <div
                      v-for="solution in filteredSolutions"
                      :key="solution.id"
                      class="solution-item"
                    >
                      <div class="solution-status">
                        <el-icon
                          :class="['status-icon', solution.status]"
                        >
                          <Check v-if="solution.status === 'accepted'" />
                          <Close v-else />
                        </el-icon>
                      </div>
                      
                      <div class="solution-info">
                        <div class="solution-title">{{ solution.problemTitle }}</div>
                        <div class="solution-meta">
                          <span class="solution-category" v-if="solution.categoryName">{{ solution.categoryName }}</span>
                          <span class="solution-time">{{ formatDateTime(solution.submitTime) }}</span>
                        </div>
                      </div>
                      
                      <div class="solution-result">
                        <div v-if="solution.status === 'accepted'" class="result-success">
                          <div>{{ solution.runtime }}ms</div>
                          <div>{{ solution.memory }}MB</div>
                        </div>
                        <div v-else class="result-failed">
                          {{ solution.errorType }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <!-- 学习统计 -->
              <el-tab-pane label="学习统计" name="statistics">
                <div class="statistics-section">
                  <!-- 难度分布 -->
                  <el-card class="stats-card">
                    <template #header>
                      <span>题目难度分布</span>
                    </template>
                    
                    <div class="difficulty-stats">
                      <div class="difficulty-item easy">
                        <div class="difficulty-header">
                          <span class="difficulty-label">简单</span>
                          <span class="difficulty-count">{{ difficultyStats.easy.solved }}/{{ difficultyStats.easy.total }}</span>
                        </div>
                        <el-progress
                          :percentage="(difficultyStats.easy.solved / difficultyStats.easy.total * 100)"
                          color="#67c23a"
                          :show-text="false"
                        />
                      </div>
                      
                      <div class="difficulty-item medium">
                        <div class="difficulty-header">
                          <span class="difficulty-label">中等</span>
                          <span class="difficulty-count">{{ difficultyStats.medium.solved }}/{{ difficultyStats.medium.total }}</span>
                        </div>
                        <el-progress
                          :percentage="(difficultyStats.medium.solved / difficultyStats.medium.total * 100)"
                          color="#e6a23c"
                          :show-text="false"
                        />
                      </div>
                      
                      <div class="difficulty-item hard">
                        <div class="difficulty-header">
                          <span class="difficulty-label">困难</span>
                          <span class="difficulty-count">{{ difficultyStats.hard.solved }}/{{ difficultyStats.hard.total }}</span>
                        </div>
                        <el-progress
                          :percentage="(difficultyStats.hard.solved / difficultyStats.hard.total * 100)"
                          color="#f56c6c"
                          :show-text="false"
                        />
                      </div>
                    </div>
                  </el-card>
                  
                  <!-- 提交日历 -->
                  <el-card class="stats-card">
                    <template #header>
                      <span>提交日历</span>
                    </template>
                    
                    <div class="calendar-stats">
                      <div class="calendar-grid">
                        <div
                          v-for="day in calendarData"
                          :key="day.date"
                          class="calendar-day"
                          :class="getCalendarDayClass(day.count)"
                          :title="`${day.date}: ${day.count} 次提交`"
                        ></div>
                      </div>
                      
                      <div class="calendar-legend">
                        <span>少</span>
                        <div class="legend-colors">
                          <div class="legend-color level-0"></div>
                          <div class="legend-color level-1"></div>
                          <div class="legend-color level-2"></div>
                          <div class="legend-color level-3"></div>
                          <div class="legend-color level-4"></div>
                        </div>
                        <span>多</span>
                      </div>
                    </div>
                  </el-card>
                </div>
              </el-tab-pane>
              
              <!-- 设置 -->
              <el-tab-pane label="设置" name="settings">
                <div class="settings-section">
                  <el-card class="settings-card">
                    <template #header>
                      <span>个人信息设置</span>
                    </template>
                    
                    <el-form :model="settingsForm" label-width="100px">
                      <el-form-item label="昵称">
                        <el-input v-model="settingsForm.nickname" />
                      </el-form-item>
                      
                      <el-form-item label="邮箱">
                        <el-input v-model="settingsForm.email" />
                      </el-form-item>
                      
                      <el-form-item label="性别">
                        <el-radio-group v-model="settingsForm.gender">
                          <el-radio :value="1">男</el-radio>
                          <el-radio :value="0">女</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      
                      <el-form-item label="个人简介">
                        <el-input
                          v-model="settingsForm.bio"
                          type="textarea"
                          :rows="3"
                          placeholder="介绍一下你自己..."
                        />
                      </el-form-item>
                      
                      <el-form-item>
                        <el-button type="primary" @click="saveSettings">
                          保存设置
                        </el-button>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  
                  <el-card class="settings-card">
                    <template #header>
                      <span>偏好设置</span>
                    </template>
                    
                    <el-form label-width="120px">
                      <el-form-item label="默认编程语言">
                        <el-select v-model="settingsForm.defaultLanguage">
                          <el-option label="JavaScript" value="javascript" />
                          <el-option label="Python" value="python" />
                          <el-option label="Java" value="java" />
                          <el-option label="C++" value="cpp" />
                        </el-select>
                      </el-form-item>
                      
                      <el-form-item label="主题模式">
                        <el-radio-group v-model="settingsForm.theme">
                          <el-radio label="light">浅色</el-radio>
                          <el-radio label="dark">深色</el-radio>
                          <el-radio label="auto">跟随系统</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      
                      <el-form-item label="邮件通知">
                        <el-switch v-model="settingsForm.emailNotification" />
                      </el-form-item>
                      
                      <el-form-item>
                        <el-button type="primary" @click="saveSettings">
                          保存设置
                        </el-button>
                      </el-form-item>
                    </el-form>
                  </el-card>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      :show-close="true"
      width="60%"
      class="image-preview-dialog"
      @close="imagePreviewVisible = false"
    >
      <template #header>
        <div class="preview-header">
          <span>头像预览</span>
        </div>
      </template>
      
      <div class="preview-content">
        <el-image
          :src="previewImageUrl"
          fit="contain"
          class="preview-image"
          :preview-src-list="[previewImageUrl]"
          :initial-index="0"
          hide-on-click-modal
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="imagePreviewVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { ArrowLeft, Camera, Check, Close, Trophy, Medal, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { getPracticeRecordsByUser, getSolvedProblemsCount, getAttemptedProblemsCount } from '@/api/subject.js'
import { fileApi } from '@/api/file.js'

const userStore = useUserStore()

// 添加图片预览相关响应式数据
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// 当前激活的标签页
const activeTab = ref('solutions')

// 用户信息
const userInfo = reactive({
  email: '',
  gender: undefined,
  joinDate: '',
  bio: ''
})

// 用户统计数据
const userStats = reactive({
  totalSolved: 0,
  totalAttempted: 0,
  streak: 0
})

// 成就数据
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一道Java八股文',
    icon: 'Star',
    unlocked: true
  },
  {
    id: 2,
    name: '坚持者',
    description: '连续7天学习Java八股文',
    icon: 'Medal',
    unlocked: true
  },
  {
    id: 3,
    name: '挑战者',
    description: '完成100道Java八股文',
    icon: 'Trophy',
    unlocked: false
  }
])

// 刷题记录筛选
const solutionFilter = ref('all')

// 刷题记录数据
const solutions = ref([])

// 过滤后的刷题记录
const filteredSolutions = computed(() => {
  if (solutionFilter.value === 'all') {
    return solutions.value
  }
  return solutions.value.filter(s => s.status === solutionFilter.value)
})

// 难度统计数据
const difficultyStats = reactive({
  easy: { solved: 25, total: 50 },
  medium: { solved: 18, total: 60 },
  hard: { solved: 5, total: 25 }
})

// 日历数据（模拟一年的提交数据）
const calendarData = ref([])

// 设置表单
const settingsForm = reactive({
  nickname: '',
  email: '',
  gender: undefined,
  bio: '',
  defaultLanguage: 'javascript',
  theme: 'light',
  emailNotification: true
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  // 处理时间戳格式
  if (typeof dateString === 'number') {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  // 处理时间戳格式
  if (typeof dateString === 'number') {
    return new Date(dateString).toLocaleString('zh-CN')
  }
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取日历格子的样式类
const getCalendarDayClass = (count) => {
  if (count === 0) return 'level-0'
  if (count <= 2) return 'level-1'
  if (count <= 4) return 'level-2'
  if (count <= 6) return 'level-3'
  return 'level-4'
}

// 生成日历数据
const generateCalendarData = () => {
  const data = []
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 11, today.getDate())
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8) // 随机生成提交次数
    })
  }
  
  calendarData.value = data
}

// 计算连续天数
const calculateStreak = (joinDate) => {
  if (!joinDate) return 0
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - join)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 获取用户统计数据
const fetchUserStatistics = async () => {
  try {
    if (!userStore.userInfo?.id) {
      console.warn('用户未登录或用户ID不存在')
      return
    }
    
    // 获取已解决题目数量
    const solvedRes = await getSolvedProblemsCount(userStore.userInfo.id)
    if (solvedRes.code === 200) {
      userStats.totalSolved = solvedRes.data
    } else {
      ElMessage.error(solvedRes.message || '获取已解决题目数量失败')
    }
    
    // 获取尝试题目数量
    const attemptedRes = await getAttemptedProblemsCount(userStore.userInfo.id)
    if (attemptedRes.code === 200) {
      userStats.totalAttempted = attemptedRes.data
    } else {
      ElMessage.error(attemptedRes.message || '获取尝试题目数量失败')
    }
    
    // 计算连续天数
    userStats.streak = calculateStreak(userStore.userInfo.createdTime)
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    ElMessage.error('获取用户统计数据失败')
  }
}

// 获取用户刷题记录
const fetchUserPracticeRecords = async () => {
  try {
    if (!userStore.userInfo?.id) {
      console.warn('用户未登录或用户ID不存在')
      return
    }
    
    const res = await getPracticeRecordsByUser(userStore.userInfo.id)
    if (res.code === 200) {
      // 转换数据格式以适配前端显示
      solutions.value = res.data.map(record => ({
        id: record.id,
        problemTitle: record.subjectName || `题目ID: ${record.subjectId}`,
        categoryName: record.categoryName,
        language: 'Java', // 这里需要根据实际题目信息来确定语言
        status: record.isCorrect === 1 ? 'accepted' : 'failed',
        runtime: record.timeCost ? `${record.timeCost * 1000}` : '0',
        memory: '0', // 暂时没有内存信息
        submitTime: record.answerTime,
        errorType: record.isCorrect === 1 ? '' : '答案错误'
      }))
    } else {
      ElMessage.error(res.message || '获取刷题记录失败')
    }
  } catch (error) {
    console.error('获取刷题记录失败:', error)
    ElMessage.error('获取刷题记录失败')
  }
}

// 编辑头像
const editAvatar = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // 验证文件整庋
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      ElMessage.error('请上传有效的图片格式（JPG, PNG, GIF, WebP）')
      return
    }
    
    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }
    
    try {
      // 使用 ElLoading.service 显示加载状态
      const loading = ElLoading.service({
        lock: true,
        text: '头像上传中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      const res = await fileApi.uploadImage(file, '用户头像')
      loading.close()
      
      if (res && res.code === 200 && res.data) {
        // 获取上传后的文件URL（使用filePath作为访问路径）
        const fileUrl = res.data.filePath
        
        if (!fileUrl) {
          ElMessage.error('上传回复数据错误，请重新尝试')
          return
        }
        
        // 更新用户头像
        const success = await userStore.updateUserInfo({
          id: userStore.userInfo?.id,
          avatar: fileUrl
        })
        
        if (success) {
          ElMessage.success('头像上传成功！')
          // 刷新用户信息确保头像显示更新
          await refreshUserInfo()
        }
      } else {
        ElMessage.error(res?.message || '图片上传失败，请重新尝试')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error('头像上传失败: ' + error.message)
    }
  }
  input.click()
}

// 添加查看头像大图的方法
const viewAvatar = () => {
  if (userStore.userAvatar) {
    previewImageUrl.value = userStore.userAvatar
    imagePreviewVisible.value = true
  } else {
    ElMessage.info('暂无头像可查看')
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    const userData = {
      id: userStore.userInfo?.id,
      nickName: settingsForm.nickname,
      email: settingsForm.email,
      sex: settingsForm.gender,
      introduce: settingsForm.bio
    }
    
    const success = await userStore.updateUserInfo(userData)
    if (success) {
      // 更新成功后刷新用户信息显示
      await refreshUserInfo()
      ElMessage.success('设置保存成功！')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

// 刷新用户信息
const refreshUserInfo = async () => {
  // 如果用户已登录，尝试获取最新的用户信息
  if (userStore.isLoggedIn && userStore.userInfo?.id) {
    try {
      await userStore.getUserInfo(userStore.userInfo.id)
      // 更新本地设置表单
      settingsForm.nickname = userStore.userName
      settingsForm.email = userStore.userInfo?.email || userInfo.email
      settingsForm.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : userInfo.gender
      settingsForm.bio = userStore.userInfo?.introduce || userInfo.bio
      
      // 更新用户信息显示
      userInfo.email = userStore.userInfo?.email || ''
      userInfo.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : undefined
      userInfo.joinDate = userStore.userInfo?.createdTime || ''
      userInfo.bio = userStore.userInfo?.introduce || ''
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败')
    }
  }
}

// 监听用户登录状态变化
watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) {
    // 用户登录后获取刷题记录
    fetchUserPracticeRecords()
  }
})

onMounted(() => {
  // 初始化设置表单和用户信息显示
  settingsForm.nickname = userStore.userName
  settingsForm.email = userStore.userInfo?.email || userInfo.email
  settingsForm.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : userInfo.gender
  settingsForm.bio = userStore.userInfo?.introduce || userInfo.bio
  
  // 初始化用户信息显示
  userInfo.email = userStore.userInfo?.email || ''
  userInfo.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : undefined
  userInfo.joinDate = userStore.userInfo?.createdTime || ''
  userInfo.bio = userStore.userInfo?.introduce || ''
  
  // 生成日历数据
  generateCalendarData()
  
  // 刷新用户信息以确保显示最新数据
  refreshUserInfo()
  
  // 获取用户统计数据
  if (userStore.isLoggedIn) {
    fetchUserStatistics()
    fetchUserPracticeRecords()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 头部导航 */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-left h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 主要内容 */
.main-content {
  padding: 24px 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧个人信息 */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 88px;
}

.profile-card {
  border-radius: var(--border-radius);
}

.profile-info {
  text-align: center;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-section .el-button {
  margin-top: 8px;
}

.user-info {
  margin-bottom: 24px;
}

.user-nickname {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-name {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.user-email,
.user-gender,
.join-date,
.user-bio {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 4px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 成就卡片 */
.achievements-card {
  border-radius: var(--border-radius);
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.achievement-item.unlocked {
  background-color: rgba(64, 158, 255, 0.1);
}

.achievement-item:not(.unlocked) {
  opacity: 0.5;
}

.achievement-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 右侧主要内容 */
.profile-main {
  min-height: 600px;
}

.profile-tabs {
  background: white;
  border-radius: var(--border-radius);
  padding: 24px;
}

/* 刷题记录 */
.solutions-section {
  margin-top: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.solutions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.solution-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.solution-item:hover {
  background-color: #e9ecef;
}

.solution-status {
  flex-shrink: 0;
}

.status-icon {
  font-size: 16px;
}

.status-icon.accepted {
  color: #67c23a;
}

.status-icon.failed {
  color: #f56c6c;
}

.solution-info {
  flex: 1;
}

.solution-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.solution-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.solution-result {
  text-align: right;
  font-size: 12px;
}

.result-success {
  color: #67c23a;
}

.result-failed {
  color: #f56c6c;
}

/* 学习统计 */
.statistics-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;
}

.stats-card {
  border-radius: 12px;
}

.difficulty-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.difficulty-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-label {
  font-weight: 600;
}

.difficulty-count {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 提交日历 */
.calendar-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  gap: 2px;
}

.calendar-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
}

.calendar-day.level-0 {
  background-color: #ebedf0;
}

.calendar-day.level-1 {
  background-color: #c6e48b;
}

.calendar-day.level-2 {
  background-color: #7bc96f;
}

.calendar-day.level-3 {
  background-color: #239a3b;
}

.calendar-day.level-4 {
  background-color: #196127;
}

.calendar-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  justify-content: flex-end;
}

.legend-colors {
  display: flex;
  gap: 2px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.level-0 {
  background-color: #ebedf0;
}

.legend-color.level-1 {
  background-color: #c6e48b;
}

.legend-color.level-2 {
  background-color: #7bc96f;
}

.legend-color.level-3 {
  background-color: #239a3b;
}

.legend-color.level-4 {
  background-color: #196127;
}

/* 设置 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;
}

.settings-card {
  border-radius: 12px;
}

/* 添加头像悬停提示 */
.avatar-image {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

/* 图片预览对话框样式 */
.image-preview-dialog {
  border-radius: 8px;
}

.image-preview-dialog .preview-header {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.image-preview-dialog .preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.image-preview-dialog .preview-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 4px;
}

.dialog-footer {
  text-align: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .profile-sidebar {
    position: static;
    order: 2;
  }
  
  .profile-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    height: auto;
    padding: 16px 0;
    gap: 16px;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(26, 1fr);
  }
  
  .solution-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .image-preview-dialog {
    width: 90%;
  }
}
</style>