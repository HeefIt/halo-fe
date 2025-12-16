3<!--
  Home 首页组件
  功能描述：应用首页，登录后的欢迎页面
  主要功能：
    - 显示欢迎信息
    - 提供四个功能导航卡片（题库练习、学习计划、排行榜、我的练习）
    - 展示今日刷题统计信息（刷题数、耗时、正确率、得分）
    - 自动加载每日统计数据
  使用位置：路由 /home
-->
<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="welcome-section">
          <h1 class="welcome-title">欢迎来到 Halo 刷题网</h1>
          <p class="welcome-subtitle">选择一个功能开始您的学习之旅</p>
        </div>
        
        <!-- 功能导航网格 -->
        <div class="features-grid">
          <el-row :gutter="30">
            <el-col :span="12" :md="6">
              <div class="feature-card" @click="goTo('/home/questions')">
                <div class="feature-icon">
                  <el-icon><Collection /></el-icon>
                </div>
                <h3 class="feature-title">题库练习</h3>
                <p class="feature-description">海量题目随时练习</p>
              </div>
            </el-col>
            <el-col :span="12" :md="6">
              <div class="feature-card" @click="goTo('/study-plan')">
                <div class="feature-icon">
                  <el-icon><Calendar /></el-icon>
                </div>
                <h3 class="feature-title">学习计划</h3>
                <p class="feature-description">制定专属学习计划</p>
              </div>
            </el-col>
            <el-col :span="12" :md="6">
              <div class="feature-card" @click="goTo('/ranking')">
                <div class="feature-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <h3 class="feature-title">排行榜</h3>
                <p class="feature-description">查看学习排名</p>
              </div>
            </el-col>
            <el-col :span="12" :md="6">
              <div class="feature-card" @click="goTo('/practice-history')">
                <div class="feature-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <h3 class="feature-title">我的练习</h3>
                <p class="feature-description">查看练习历史记录</p>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 每日统计 -->
        <el-card class="stats-card">
          <template #header>
            <div class="stats-header">
              <span>今日刷题统计 (每日凌晨1点结算)</span>
            </div>
          </template>
          
          <div class="stats-content">
            <el-skeleton :loading="dailyStatsLoading" animated>
              <template #template>
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-skeleton">
                      <el-skeleton-item variant="text" style="width: 60%; height: 20px; margin-bottom: 8px;" />
                      <el-skeleton-item variant="text" style="width: 80%; height: 16px;" />
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-skeleton">
                      <el-skeleton-item variant="text" style="width: 60%; height: 20px; margin-bottom: 8px;" />
                      <el-skeleton-item variant="text" style="width: 80%; height: 16px;" />
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-skeleton">
                      <el-skeleton-item variant="text" style="width: 60%; height: 20px; margin-bottom: 8px;" />
                      <el-skeleton-item variant="text" style="width: 80%; height: 16px;" />
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-skeleton">
                      <el-skeleton-item variant="text" style="width: 60%; height: 20px; margin-bottom: 8px;" />
                      <el-skeleton-item variant="text" style="width: 80%; height: 16px;" />
                    </div>
                  </el-col>
                </el-row>
              </template>
              <template #default>
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">刷题数</div>
                      <div class="stat-value">{{ dailyStats.problemCount }}</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">刷题时间</div>
                      <div class="stat-value">{{ formatTime(dailyStats.totalTime) }}</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">正确率</div>
                      <div class="stat-value">{{ dailyStats.accuracy }}%</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-label">今日得分</div>
                      <div class="stat-value">{{ dailyStats.totalScore }}</div>
                    </div>
                  </el-col>
                </el-row>
              </template>
            </el-skeleton>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDailyStatistics } from '@/api/subject'
import { Collection, Calendar, Trophy, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Header from '@/views/components/layout/Header.vue'

const router = useRouter()
const userStore = useUserStore()

// 加载状态
const dailyStatsLoading = ref(false)

// 每日统计信息
const dailyStats = ref({
  problemCount: 0,
  totalTime: 0,
  accuracy: 0.0,
  totalScore: 0
})

// 跳转到指定路径
const goTo = (path) => {
  router.push(path)
}

// 获取每日统计信息
const fetchDailyStatistics = async () => {
  dailyStatsLoading.value = true
  try {
    const res = await getDailyStatistics(userStore.userInfo.id)
    if (res.code === 200) {
      dailyStats.value = res.data
    } else {
      ElMessage.error(res.message || '获取每日统计信息失败')
    }
  } catch (err) {
    ElMessage.error('获取每日统计信息失败: ' + err.message)
  } finally {
    dailyStatsLoading.value = false
  }
}

// 格式化时间显示
const formatTime = (seconds) => {
  if (!seconds) return '0秒'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  let result = ''
  if (hours > 0) {
    result += `${hours}小时`
  }
  if (minutes > 0) {
    result += `${minutes}分钟`
  }
  if (remainingSeconds > 0 || result === '') {
    result += `${remainingSeconds}秒`
  }
  
  return result
}

// 组件挂载时初始化数据
onMounted(async () => {
  await fetchDailyStatistics()
})

// 监听用户信息变化，重新获取每日统计信息
watch(() => userStore.userInfo, (newUserInfo) => {
  if (newUserInfo && newUserInfo.id) {
    fetchDailyStatistics()
  }
}, { immediate: false })
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 主内容区 */
.main-content {
  padding: 88px 24px 24px 24px;
  margin-top: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.welcome-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
}

.features-grid {
  margin-bottom: 40px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.feature-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.stats-card {
  border-radius: 12px;
}

.stats-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-skeleton {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
  }
  
  .feature-card {
    padding: 20px 15px;
  }
  
  .feature-icon {
    font-size: 36px;
  }
  
  .feature-title {
    font-size: 18px;
  }
  
  .stat-item {
    padding: 15px 0;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>
