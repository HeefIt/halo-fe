<!--题库-->
<!--
  QuestionBank 题库页面组件
  功能描述：题目库展示和筛选的主要页面
  主要功能：
    - 多层级分类筛选：主分类 → 子分类 → 标签
    - 难度筛选：简单/中等/困难
    - 题目类型筛选：单选/多选/判断/简答
    - 关键词搜索：按题目名称模糊搜索
    - 分页展示：每页10条题目
    - 筛选条件持久化：保存用户筛选条件到localStorage
    - 每日统计展示：左侧控制面板显示今日刷题统计
    - 随机练习：浮动按钮快速进入随机题目
  使用位置：路由 /home/questions
-->
<template>
  <div class="question-bank-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="content-layout">
          <!-- 左侧筛选栏 -->
          <Sidebar>
            <template #daily-stats>
              <DailyStats />
            </template>
          </Sidebar>
          
          <!-- 中间题目列表 -->
          <ProblemList />
        </div>
      </div>
    </main>
    
    <!-- 悬浮开始刷题按钮 -->
    <FloatingButton />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePracticeStore } from '@/stores/practice'
import { getSubjectsForUser, getDailyStatistics } from '@/api/subject'
import { getCategoryList, getCategoryAndLabel } from '@/api/category'
import { getLabelList } from '@/api/label'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入子组件
import Header from '@/views/components/layout/Header.vue'
import Sidebar from '@/views/components/layout/home/Sidebar.vue'
import DailyStats from '@/views/components/layout/home/DailyStats.vue'
import ProblemList from '@/views/components/layout/home/ProblemList.vue'
import FloatingButton from '@/views/components/layout/home/FloatingButton.vue'

const router = useRouter()
const userStore = useUserStore()
const practiceStore = usePracticeStore()

// 加载状态
const loading = ref(false)
const dailyStatsLoading = ref(false)

// 每日统计信息
const dailyStats = ref({
  problemCount: 0,
  totalTime: 0,
  accuracy: 0.0,
  totalScore: 0
})

// 筛选条件
const filters = reactive({
  categoryId: undefined,
  subjectDifficult: undefined,
  subjectType: undefined
})

// 所有分类数据
const categories = ref([])

// 主分类
const primaryCategories = ref([])

// 二级分类
const secondaryCategories = ref([])

// 当前层级 ('primary', 'secondary', 'label')
const currentLevel = ref('primary')

// 选中的分类
const selectedCategories = reactive({
  primary: null,
  secondary: null
})

// 当前标签列表
const currentLabels = ref([])

// 选中的标签
const selectedLabels = reactive({})

// 面包屑项
const breadcrumbItems = ref([])

// 难度选择状态
const isDifficultySelected = reactive({
  1: false,
  2: false,
  3: false
})

// 类型选择状态
const isTypeSelected = reactive({
  1: false,
  2: false,
  3: false,
  4: false
})

// 搜索关键词
const searchKeyword = ref('')

// 分页
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 题目数据
const problems = ref([])

// 保存筛选条件到localStorage
const saveFiltersToStorage = () => {
  const filtersToSave = {
    categoryId: filters.categoryId,
    labelIds: Object.keys(selectedLabels).filter(id => selectedLabels[id]),
    subjectDifficult: filters.subjectDifficult,
    subjectType: filters.subjectType,
    searchKeyword: searchKeyword.value,
    currentLevel: currentLevel.value,
    primaryCategoryId: selectedCategories.primary?.id,
    secondaryCategoryId: selectedCategories.secondary?.id
  }
  localStorage.setItem('homeFilters', JSON.stringify(filtersToSave))
}

// 从localStorage恢复筛选条件
const restoreFiltersFromStorage = async () => {
  const savedFilters = localStorage.getItem('homeFilters')
  if (savedFilters) {
    try {
      const parsedFilters = JSON.parse(savedFilters)
      
      // 恢复基本筛选条件
      filters.categoryId = parsedFilters.categoryId
      filters.subjectDifficult = parsedFilters.subjectDifficult
      filters.subjectType = parsedFilters.subjectType
      searchKeyword.value = parsedFilters.searchKeyword || ''
      
      // 恢复标签选择状态
      if (parsedFilters.labelIds) {
        parsedFilters.labelIds.forEach(id => {
          selectedLabels[id] = true
        })
      }
      
      // 恢复分类选择状态和UI层级
      if (parsedFilters.categoryId) {
        // 根据保存的categoryId恢复分类选择
        const selectedCategory = categories.value.find(c => c.id === parsedFilters.categoryId)
        if (selectedCategory) {
          // 判断是主分类还是子分类
          if (selectedCategory.parentId === 0) {
            // 是主分类
            selectedCategories.primary = selectedCategory
            currentLevel.value = 'secondary'
            
            // 获取该主分类下的二级分类及标签
            try {
              const res = await getCategoryAndLabel({ id: selectedCategory.id })
              if (res.code === 200) {
                secondaryCategories.value = res.data || []
              }
            } catch (err) {
              console.error('获取子分类失败:', err)
            }
            
            // 如果有标签被选中，说明还需要恢复到标签层级
            if (parsedFilters.labelIds && parsedFilters.labelIds.length > 0) {
              // 找到对应的二级分类
              const secondaryCategory = secondaryCategories.value.find(c => c.id === parsedFilters.categoryId)
              if (secondaryCategory) {
                selectedCategories.secondary = secondaryCategory
                if (secondaryCategory.labelDTOList) {
                  currentLabels.value = secondaryCategory.labelDTOList
                }
                currentLevel.value = 'label'
              }
            }
          } else {
            // 是二级分类
            const primaryCategory = categories.value.find(c => c.id === selectedCategory.parentId)
            if (primaryCategory) {
              selectedCategories.primary = primaryCategory
            }
            selectedCategories.secondary = selectedCategory
            currentLevel.value = 'label'
            
            // 获取该分类下的标签
            if (selectedCategory.labelDTOList) {
              currentLabels.value = selectedCategory.labelDTOList
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved filters:', e)
    }
  }
}

// 更新面包屑导航
const updateBreadcrumb = () => {
  const items = []
  
  if (selectedCategories.primary) {
    items.push({
      name: selectedCategories.primary.categoryName,
      level: 'primary',
      data: selectedCategories.primary
    })
  }
  
  if (selectedCategories.secondary) {
    items.push({
      name: selectedCategories.secondary.categoryName,
      level: 'secondary',
      data: selectedCategories.secondary
    })
  }
  
  if (Object.keys(selectedLabels).some(id => selectedLabels[id])) {
    const selectedLabelNames = currentLabels.value
      .filter(label => selectedLabels[label.id])
      .map(label => label.labelName)
      .join(', ')
    items.push({
      name: selectedLabelNames || '已选择标签',
      level: 'label'
    })
  }
  
  breadcrumbItems.value = items
}

// 获取当前层级标题
const getCurrentLevelTitle = () => {
  switch (currentLevel.value) {
    case 'primary':
      return '题目分类'
    case 'secondary':
      return '二级分类'
    case 'label':
      return '题目标签'
    default:
      return '题目分类'
  }
}

// 选择主分类
const selectPrimaryCategory = async (category) => {
  selectedCategories.primary = category
  selectedCategories.secondary = null
  
  // 获取该主分类下的二级分类及标签
  try {
    const res = await getCategoryAndLabel({ id: category.id })
    if (res.code === 200) {
      secondaryCategories.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取子分类失败')
      secondaryCategories.value = []
    }
  } catch (err) {
    ElMessage.error('获取子分类失败: ' + err.message)
    secondaryCategories.value = []
  }
  
  // 进入二级分类层级
  currentLevel.value = 'secondary'
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 触发查询 - 显示该主分类下的所有题目
  filters.categoryId = category.id
  handleSearch()
}

// 选择二级分类
const selectSecondaryCategory = async (category) => {
  selectedCategories.secondary = category
  
  // 获取该分类下的标签
  if (category.labelDTOList) {
    currentLabels.value = category.labelDTOList
  } else {
    currentLabels.value = []
  }
  
  // 进入标签层级
  currentLevel.value = 'label'
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 触发查询 - 显示该二级分类下的所有题目
  filters.categoryId = category.id
  handleSearch()
}

// 标签选择处理
const handleLabelSelect = (label, isSelected) => {
  selectedLabels[label.id] = isSelected
  updateBreadcrumb()
  handleSearch()
}

// 返回上级
const goBack = () => {
  switch (currentLevel.value) {
    case 'secondary':
      // 从二级分类返回主分类
      currentLevel.value = 'primary'
      selectedCategories.primary = null
      filters.categoryId = undefined // 清除分类筛选
      break
    case 'label':
      // 从标签返回二级分类
      currentLevel.value = 'secondary'
      selectedCategories.secondary = null
      
      // 清空标签选择
      Object.keys(selectedLabels).forEach(key => {
        selectedLabels[key] = false
      })
      
      // 设置筛选条件为二级分类
      if (selectedCategories.secondary) {
        filters.categoryId = selectedCategories.secondary.id
      }
      break
  }
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 触发查询
  handleSearch()
}

// 面包屑点击处理
const handleBreadcrumbClick = (index) => {
  const item = breadcrumbItems.value[index]
  
  if (index === 0) {
    // 点击主分类
    currentLevel.value = 'primary'
    selectedCategories.primary = null
    selectedCategories.secondary = null
    filters.categoryId = undefined // 清除分类筛选
    
    // 清空标签选择
    Object.keys(selectedLabels).forEach(key => {
      selectedLabels[key] = false
    })
  } else if (index === 1) {
    // 点击二级分类
    currentLevel.value = 'secondary'
    selectedCategories.secondary = null
    
    // 设置筛选条件为主分类
    if (selectedCategories.primary) {
      filters.categoryId = selectedCategories.primary.id
    }
    
    // 清空标签选择
    Object.keys(selectedLabels).forEach(key => {
      selectedLabels[key] = false
    })
  }
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 触发查询
  handleSearch()
}

// 全部清除
const clearAllFilters = () => {
  // 重置分类选择
  currentLevel.value = 'primary'
  selectedCategories.primary = null
  selectedCategories.secondary = null
  filters.categoryId = undefined // 清除分类筛选
  
  // 清空标签选择
  Object.keys(selectedLabels).forEach(key => {
    selectedLabels[key] = false
  })
  
  // 清空其他筛选条件
  filters.subjectDifficult = undefined
  filters.subjectType = undefined
  
  for (let key in isDifficultySelected) {
    isDifficultySelected[key] = false
  }
  for (let key in isTypeSelected) {
    isTypeSelected[key] = false
  }
  
  searchKeyword.value = ''
  pagination.pageNo = 1
  localStorage.removeItem('homeFilters') // 清除保存的筛选条件
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 重新获取题目列表
  fetchSubjects()
}

// 处理难度变化
const handleDifficultyChange = (difficulty, isSelected) => {
  if (isSelected) {
    filters.subjectDifficult = difficulty
    // 取消其他难度的选择
    for (let key in isDifficultySelected) {
      if (parseInt(key) !== difficulty) {
        isDifficultySelected[key] = false
      }
    }
  } else {
    filters.subjectDifficult = undefined
  }
  handleSearch()
}

// 处理类型变化
const handleTypeChange = (type, isSelected) => {
  if (isSelected) {
    filters.subjectType = type
    // 取消其他类型的选择
    for (let key in isTypeSelected) {
      if (parseInt(key) !== type) {
        isTypeSelected[key] = false
      }
    }
  } else {
    filters.subjectType = undefined
  }
  handleSearch()
}

// 获取题目列表
const fetchSubjects = async () => {
  loading.value = true
  try {
    // 构造筛选参数
    const labelIds = Object.keys(selectedLabels).filter(id => selectedLabels[id])
    
    const params = {
      pageNum: pagination.pageNo,
      pageSize: pagination.pageSize,
      subjectName: searchKeyword.value || undefined,
      categoryId: filters.categoryId,
      labelIds_query: labelIds.length > 0 ? labelIds : undefined,
      subjectDifficult: filters.subjectDifficult,
      subjectType: filters.subjectType
    }

    // 清除未设置的查询参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '' || 
         (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    const res = await getSubjectsForUser(params)
    if (res.code === 200) {
      problems.value = res.data.result
      pagination.total = res.data.total
      pagination.pageNo = res.data.pageNo
      pagination.pageSize = res.data.pageSize
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch (err) {
    ElMessage.error('获取题目列表失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.result
      
      // 获取主分类 (parentId === 0)
      primaryCategories.value = categories.value.filter(
        category => category.parentId === 0
      )
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (err) {
    ElMessage.error('获取分类列表失败: ' + err.message)
  }
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

// 处理搜索
const handleSearch = () => {
  pagination.pageNo = 1
  saveFiltersToStorage() // 保存筛选条件
  fetchSubjects()
}

// 重置筛选条件
const resetFilters = () => {
  clearAllFilters()
}

// 跳转到题目详情
const goToProblem = (problemId) => {
  // 保存当前题目列表到store
  practiceStore.setProblemList(problems.value)
  practiceStore.setCurrentProblemId(problemId)
  router.push(`/practice/${problemId}`)
}

// 开始随机刷题
const startRandomPractice = async () => {
  // 如果当前有题目，选择ID最小的题目
  if (problems.value && problems.value.length > 0) {
    // 按ID排序，选择最小的
    const sortedProblems = [...problems.value].sort((a, b) => a.id - b.id);
    const firstProblem = sortedProblems[0];
    router.push(`/practice/${firstProblem.id}`);
  } else {
    // 如果没有题目，尝试获取题目列表再选择
    try {
      const params = {
        pageNum: 1,
        pageSize: 10,
        subjectName: searchKeyword.value || undefined,
        categoryId: filters.categoryId
      };

      // 清除未设置的查询参数
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const res = await getSubjectsForUser(params);
      if (res.code === 200 && res.data.result && res.data.result.length > 0) {
        // 按ID排序，选择最小的
        const sortedProblems = [...res.data.result].sort((a, b) => a.id - b.id);
        const firstProblem = sortedProblems[0];
        router.push(`/practice/${firstProblem.id}`);
      } else {
        ElMessage.warning('暂无题目可以练习');
        router.push('/practice');
      }
    } catch (err) {
      ElMessage.error('获取题目列表失败: ' + err.message);
      router.push('/practice');
    }
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNo = 1
  saveFiltersToStorage() // 保存筛选条件
  fetchSubjects()
}

const handleCurrentChange = (val) => {
  pagination.pageNo = val
  saveFiltersToStorage() // 保存筛选条件
  fetchSubjects()
}

// 获取难度标签类型
const getDifficultyType = (difficulty) => {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[difficulty] || ''
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return labelMap[difficulty] || ''
}

// 获取题目类型标签类型
const getSubjectTypeType = (type) => {
  const typeMap = {
    1: 'primary',
    2: 'primary',
    3: 'primary',
    4: 'primary'
  }
  return typeMap[type] || 'primary'
}

// 获取题目类型标签文本
const getSubjectTypeLabel = (type) => {
  const labelMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return labelMap[type] || ''
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
  await restoreFiltersFromStorage() // 恢复筛选条件
  await Promise.all([
    fetchCategories(),
    fetchDailyStatistics() // 获取每日统计信息
  ])
  
  // 更新面包屑
  updateBreadcrumb()
  
  // 自动加载当前页所有题目
  fetchSubjects()
})

// 监听用户信息变化，重新获取每日统计信息
watch(() => userStore.userInfo, (newUserInfo) => {
  if (newUserInfo && newUserInfo.id) {
    fetchDailyStatistics()
  }
}, { immediate: false })

// 向子组件提供数据和方法
provide('primaryCategories', primaryCategories)
provide('secondaryCategories', secondaryCategories)
provide('currentLevel', currentLevel)
provide('selectedCategories', selectedCategories)
provide('currentLabels', currentLabels)
provide('selectedLabels', selectedLabels)
provide('breadcrumbItems', breadcrumbItems)
provide('isDifficultySelected', isDifficultySelected)
provide('isTypeSelected', isTypeSelected)
provide('searchKeyword', searchKeyword)
provide('loading', loading)
provide('problems', problems)
provide('pagination', pagination)
provide('dailyStats', dailyStats)
provide('dailyStatsLoading', dailyStatsLoading)
provide('formatTime', formatTime)

// 向子组件提供方法
provide('selectPrimaryCategory', selectPrimaryCategory)
provide('selectSecondaryCategory', selectSecondaryCategory)
provide('handleLabelSelect', handleLabelSelect)
provide('goBack', goBack)
provide('handleBreadcrumbClick', handleBreadcrumbClick)
provide('clearAllFilters', clearAllFilters)
provide('handleDifficultyChange', handleDifficultyChange)
provide('handleTypeChange', handleTypeChange)
provide('resetFilters', resetFilters)
provide('getCurrentLevelTitle', getCurrentLevelTitle)
provide('handleSearch', handleSearch)
provide('goToProblem', goToProblem)
provide('startRandomPractice', startRandomPractice)
provide('handleSizeChange', handleSizeChange)
provide('handleCurrentChange', handleCurrentChange)
provide('getDifficultyType', getDifficultyType)
provide('getDifficultyLabel', getDifficultyLabel)
provide('getSubjectTypeType', getSubjectTypeType)
provide('getSubjectTypeLabel', getSubjectTypeLabel)
</script>

<style scoped>
.question-bank-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 主内容区 */
.main-content {
  padding: 88px 24px 24px 24px;
  margin-top: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.content-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 1200px) {
  .main-content {
    padding: 88px 16px 24px 16px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .content-layout {
    flex-direction: column;
  }
  
  .problem-list-section {
    order: 1;
  }
}
</style>