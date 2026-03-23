<!--题库-->
<!--
  QuestionBank 题库页面组件
  功能描述：题目库展示和筛选的主要页面
  主要功能：
    - 多层级分类筛选：主分类 → 子分类 → 标签
    - 难度筛选：简单/中等/困难
    - 题目类型筛选：单选/多选/判断/简答
    - 关键词搜索：按题目名称模糊搜索
    - 分页展示：每页 10 条目
    - 筛选条件持久化：保存用户筛选条件到 localStorage
    - 随机练习：快速进入当前结果集中的题目
  使用位置：路由 /home/questions
-->
<template>
  <div
    class="question-bank-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <section class="question-workbar animate-slide-up">
          <div class="toolbar-row">
            <div class="toolbar-title-block">
              <div class="toolbar-heading">
                <h1 class="toolbar-title">题库</h1>
                <span class="toolbar-count">{{ pagination.total }} 题</span>
              </div>
              <p class="toolbar-subtitle">{{ scopeText }}</p>
            </div>

            <div class="toolbar-search">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索题目名称或知识点"
                :prefix-icon="Search"
                clearable
                @keyup.enter="handleSearch"
              />
            </div>

            <div class="toolbar-actions">
              <button class="toolbar-action toolbar-action-primary" @click="handleSearch">
                筛选
              </button>
              <button class="toolbar-action toolbar-action-secondary" @click="clearAllFilters">
                重置
              </button>
              <button class="toolbar-action toolbar-action-secondary" @click="startRandomPractice">
                随机练习
              </button>
            </div>
          </div>

          <div class="filter-rail">
            <div class="filter-line">
              <span class="filter-key">分类</span>
              <div class="filter-items filter-items-scroll">
                <button
                  class="filter-chip"
                  :class="{ active: !selectedCategories.primary }"
                  @click="clearAllFilters"
                >
                  全部
                </button>
                <button
                  v-for="category in primaryCategories"
                  :key="category.id"
                  class="filter-chip"
                  :class="{ active: selectedCategories.primary?.id === category.id }"
                  @click="selectPrimaryCategory(category)"
                >
                  {{ category.categoryName }}
                </button>
              </div>
            </div>

            <div class="filter-line" v-if="selectedCategories.primary && secondaryCategories.length > 0">
              <span class="filter-key">方向</span>
              <div class="filter-items filter-items-scroll">
                <button
                  class="filter-chip"
                  :class="{ active: !selectedCategories.secondary }"
                  @click="goBack"
                >
                  {{ selectedCategories.primary.categoryName }} 全部
                </button>
                <button
                  v-for="category in secondaryCategories"
                  :key="category.id"
                  class="filter-chip filter-chip-strong"
                  :class="{ active: selectedCategories.secondary?.id === category.id }"
                  @click="selectSecondaryCategory(category)"
                >
                  {{ category.categoryName }}
                </button>
              </div>
            </div>

            <div class="filter-line">
              <span class="filter-key">筛选</span>
              <div class="filter-items">
                <button
                  v-for="option in difficultyOptions"
                  :key="`difficulty-${option.value}`"
                  class="filter-chip filter-chip-soft"
                  :class="[option.className, { active: isDifficultySelected[option.value] }]"
                  @click="handleDifficultyChange(option.value, !isDifficultySelected[option.value])"
                >
                  {{ option.label }}
                </button>
                <button
                  v-for="option in subjectTypeOptions"
                  :key="`type-${option.value}`"
                  class="filter-chip filter-chip-soft"
                  :class="{ active: isTypeSelected[option.value] }"
                  @click="handleTypeChange(option.value, !isTypeSelected[option.value])"
                >
                  {{ option.label }}
                </button>
                <button
                  v-if="currentLabels.length > 0"
                  class="filter-chip filter-chip-toggle"
                  :class="{ active: showLabelRail || selectedLabelCount > 0 }"
                  @click="showLabelRail = !showLabelRail"
                >
                  标签
                  <span v-if="selectedLabelCount > 0">{{ selectedLabelCount }}</span>
                </button>
              </div>
            </div>

            <div class="filter-line" v-if="currentLabels.length > 0 && (showLabelRail || selectedLabelCount > 0)">
              <span class="filter-key">标签</span>
              <div class="filter-items">
                <button
                  v-for="label in currentLabels"
                  :key="label.id"
                  class="filter-chip filter-chip-soft"
                  :class="{ active: selectedLabels[label.id] }"
                  @click="handleLabelSelect(label, !selectedLabels[label.id])"
                >
                  {{ label.labelName }}
                </button>
              </div>
            </div>
          </div>

          <div class="active-strip" v-if="breadcrumbItems.length > 0 || activeFilterEntries.length > 0">
            <div class="scope-path" v-if="breadcrumbItems.length > 0">
              <button class="scope-node" @click="clearAllFilters">全部题目</button>
              <template v-for="(item, index) in breadcrumbItems" :key="`${item.level}-${index}`">
                <span class="scope-separator">/</span>
                <button class="scope-node" @click="handleBreadcrumbClick(index)">
                  {{ item.name }}
                </button>
              </template>
            </div>

            <div class="active-pills" v-if="activeFilterEntries.length > 0">
              <button
                v-for="entry in activeFilterEntries"
                :key="entry.key"
                class="active-pill"
                @click="removeFilterEntry(entry)"
              >
                <span>{{ entry.label }}</span>
                <span class="active-pill-close">×</span>
              </button>
            </div>
          </div>
        </section>

        <div class="content-layout animate-slide-up" style="animation-delay: 80ms">
          <ProblemList />
        </div>
      </div>
    </main>

    <FloatingButton />
  </div>
</template>

<script setup>
import { computed, onMounted, provide, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getCategoryAndLabel, getCategoryList } from '@/api/modules/question/category'
import { getSubjectsForUser } from '@/api/modules/question/subject'
import { usePracticeStore } from '@/stores/modules/practice'
import { useThemeStore } from '@/stores/modules/theme'

import Header from '@/layouts/AppHeader.vue'
import FloatingButton from '@/components/home/FloatingButton.vue'
import ProblemList from '@/components/home/ProblemList.vue'

const router = useRouter()
const practiceStore = usePracticeStore()
const themeStore = useThemeStore()

const loading = ref(false)
const showLabelRail = ref(false)

const filters = reactive({
  categoryId: undefined,
  subjectDifficult: undefined,
  subjectType: undefined
})

const categories = ref([])
const primaryCategories = ref([])
const secondaryCategories = ref([])
const currentLevel = ref('primary')

const selectedCategories = reactive({
  primary: null,
  secondary: null
})

const currentLabels = ref([])
const selectedLabels = reactive({})
const breadcrumbItems = ref([])

const isDifficultySelected = reactive({
  1: false,
  2: false,
  3: false
})

const isTypeSelected = reactive({
  1: false,
  2: false,
  3: false,
  4: false
})

const searchKeyword = ref('')

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const problems = ref([])

const difficultyOptions = [
  { value: 1, label: '简单', className: 'is-easy' },
  { value: 2, label: '中等', className: 'is-medium' },
  { value: 3, label: '困难', className: 'is-hard' }
]

const subjectTypeOptions = [
  { value: 1, label: '单选题' },
  { value: 2, label: '多选题' },
  { value: 3, label: '判断题' },
  { value: 4, label: '简答题' }
]

const selectedLabelIds = computed(() => {
  return Object.keys(selectedLabels).filter((id) => selectedLabels[id])
})

const selectedLabelCount = computed(() => selectedLabelIds.value.length)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.categoryId) count += 1
  if (filters.subjectDifficult) count += 1
  if (filters.subjectType) count += 1
  if (searchKeyword.value?.trim()) count += 1
  count += selectedLabelCount.value
  return count
})

const scopeText = computed(() => {
  if (breadcrumbItems.value.length > 0) {
    return breadcrumbItems.value.map((item) => item.name).join(' / ')
  }
  return '全部题目'
})

const currentDeskMode = computed(() => {
  if (searchKeyword.value?.trim()) {
    return `关键词：${searchKeyword.value.trim()}`
  }
  return `当前范围：${scopeText.value}`
})

const filterSummaryList = computed(() => {
  const list = []

  if (selectedCategories.primary) {
    list.push(selectedCategories.primary.categoryName)
  }

  if (selectedCategories.secondary) {
    list.push(selectedCategories.secondary.categoryName)
  }

  if (filters.subjectDifficult) {
    list.push(getDifficultyLabel(filters.subjectDifficult))
  }

  if (filters.subjectType) {
    list.push(getSubjectTypeLabel(filters.subjectType))
  }

  currentLabels.value.forEach((label) => {
    if (selectedLabels[label.id]) {
      list.push(label.labelName)
    }
  })

  if (searchKeyword.value?.trim()) {
    list.unshift(`关键词：${searchKeyword.value.trim()}`)
  }

  return list.slice(0, 6)
})

const activeFilterEntries = computed(() => {
  const list = []

  if (searchKeyword.value?.trim()) {
    list.push({
      key: 'search',
      type: 'search',
      label: `关键词 ${searchKeyword.value.trim()}`
    })
  }

  if (filters.subjectDifficult) {
    list.push({
      key: `difficulty-${filters.subjectDifficult}`,
      type: 'difficulty',
      value: filters.subjectDifficult,
      label: getDifficultyLabel(filters.subjectDifficult)
    })
  }

  if (filters.subjectType) {
    list.push({
      key: `type-${filters.subjectType}`,
      type: 'type',
      value: filters.subjectType,
      label: getSubjectTypeLabel(filters.subjectType)
    })
  }

  currentLabels.value.forEach((label) => {
    if (selectedLabels[label.id]) {
      list.push({
        key: `label-${label.id}`,
        type: 'label',
        value: label.id,
        label: label.labelName
      })
    }
  })

  return list
})

/**
 * 将当前筛选条件持久化到本地，避免用户刷新后丢失上下文。
 */
function saveFiltersToStorage() {
  const filtersToSave = {
    categoryId: filters.categoryId,
    labelIds: selectedLabelIds.value,
    subjectDifficult: filters.subjectDifficult,
    subjectType: filters.subjectType,
    searchKeyword: searchKeyword.value,
    currentLevel: currentLevel.value,
    primaryCategoryId: selectedCategories.primary?.id,
    secondaryCategoryId: selectedCategories.secondary?.id
  }

  localStorage.setItem('homeFilters', JSON.stringify(filtersToSave))
}

/**
 * 根据已保存的筛选条件恢复题库上下文，同时修复筛选按钮的选中状态。
 */
async function restoreFiltersFromStorage() {
  const savedFilters = localStorage.getItem('homeFilters')
  if (!savedFilters) {
    return
  }

  try {
    const parsedFilters = JSON.parse(savedFilters)

    filters.categoryId = parsedFilters.categoryId
    filters.subjectDifficult = parsedFilters.subjectDifficult
    filters.subjectType = parsedFilters.subjectType
    searchKeyword.value = parsedFilters.searchKeyword || ''

    if (filters.subjectDifficult) {
      isDifficultySelected[filters.subjectDifficult] = true
    }

    if (filters.subjectType) {
      isTypeSelected[filters.subjectType] = true
    }

    selectedLabelIds.value.forEach((id) => {
      selectedLabels[id] = false
    })

    if (Array.isArray(parsedFilters.labelIds)) {
      parsedFilters.labelIds.forEach((id) => {
        selectedLabels[id] = true
      })
      showLabelRail.value = parsedFilters.labelIds.length > 0
    }

    if (parsedFilters.primaryCategoryId) {
      selectedCategories.primary = categories.value.find((item) => item.id === parsedFilters.primaryCategoryId) || null
    }

    if (selectedCategories.primary) {
      const res = await getCategoryAndLabel({ id: selectedCategories.primary.id })
      if (res.code === 200) {
        secondaryCategories.value = res.data || []
      }
    }

    if (parsedFilters.secondaryCategoryId) {
      selectedCategories.secondary =
        secondaryCategories.value.find((item) => item.id === parsedFilters.secondaryCategoryId) ||
        categories.value.find((item) => item.id === parsedFilters.secondaryCategoryId) ||
        null

      if (selectedCategories.secondary?.labelDTOList) {
        currentLabels.value = selectedCategories.secondary.labelDTOList
      }
    }

    if (selectedCategories.secondary) {
      currentLevel.value = 'label'
    } else if (selectedCategories.primary) {
      currentLevel.value = 'secondary'
    } else {
      currentLevel.value = parsedFilters.currentLevel || 'primary'
    }
  } catch (err) {
    console.error('恢复题库筛选条件失败:', err)
  }
}

/**
 * 更新筛选面包屑，让用户清楚知道自己当前停留在哪一层。
 */
function updateBreadcrumb() {
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

  if (selectedLabelCount.value > 0) {
    const labelNames = currentLabels.value
      .filter((label) => selectedLabels[label.id])
      .map((label) => label.labelName)
      .join('、')

    items.push({
      name: labelNames || '已选择标签',
      level: 'label'
    })
  }

  breadcrumbItems.value = items
}

/**
 * 选择主分类后，拉取其下的二级分类并立即刷新结果集。
 */
async function selectPrimaryCategory(category) {
  selectedCategories.primary = category
  selectedCategories.secondary = null
  currentLabels.value = []
  showLabelRail.value = false

  Object.keys(selectedLabels).forEach((key) => {
    selectedLabels[key] = false
  })

  try {
    const res = await getCategoryAndLabel({ id: category.id })
    if (res.code === 200) {
      secondaryCategories.value = res.data || []
    } else {
      secondaryCategories.value = []
      ElMessage.error(res.message || '获取子分类失败')
    }
  } catch (err) {
    secondaryCategories.value = []
    ElMessage.error(`获取子分类失败: ${err.message}`)
  }

  currentLevel.value = 'secondary'
  filters.categoryId = category.id
  updateBreadcrumb()
  handleSearch()
}

/**
 * 选择二级分类后进入标签层，并将题目结果限定到该分类下。
 */
function selectSecondaryCategory(category) {
  selectedCategories.secondary = category
  currentLabels.value = category.labelDTOList || []
  showLabelRail.value = false

  Object.keys(selectedLabels).forEach((key) => {
    selectedLabels[key] = false
  })

  currentLevel.value = 'label'
  filters.categoryId = category.id
  updateBreadcrumb()
  handleSearch()
}

/**
 * 标签勾选后刷新结果集，保持当前分类上下文不丢失。
 */
function handleLabelSelect(label, isSelected) {
  selectedLabels[label.id] = isSelected
  showLabelRail.value = true
  updateBreadcrumb()
  handleSearch()
}

/**
 * 返回上级筛选层级时，同步恢复正确的分类筛选条件。
 */
function goBack() {
  if (currentLevel.value === 'secondary') {
    currentLevel.value = 'primary'
    selectedCategories.primary = null
    selectedCategories.secondary = null
    currentLabels.value = []
    filters.categoryId = undefined
    showLabelRail.value = false
  } else if (currentLevel.value === 'label') {
    currentLevel.value = 'secondary'
    currentLabels.value = []
    selectedCategories.secondary = null
    filters.categoryId = selectedCategories.primary?.id
    showLabelRail.value = false

    Object.keys(selectedLabels).forEach((key) => {
      selectedLabels[key] = false
    })
  }

  updateBreadcrumb()
  handleSearch()
}

/**
 * 点击面包屑后直接回退到对应的筛选层级。
 */
function handleBreadcrumbClick(index) {
  if (index === 0) {
    currentLevel.value = 'primary'
    selectedCategories.primary = null
    selectedCategories.secondary = null
    currentLabels.value = []
    filters.categoryId = undefined
    showLabelRail.value = false
  } else if (index === 1) {
    currentLevel.value = 'secondary'
    selectedCategories.secondary = null
    currentLabels.value = []
    filters.categoryId = selectedCategories.primary?.id
    showLabelRail.value = false
  }

  Object.keys(selectedLabels).forEach((key) => {
    selectedLabels[key] = false
  })

  updateBreadcrumb()
  handleSearch()
}

/**
 * 删除单个已生效筛选，让用户快速回退局部条件。
 */
function removeFilterEntry(entry) {
  if (entry.type === 'search') {
    searchKeyword.value = ''
  } else if (entry.type === 'difficulty') {
    filters.subjectDifficult = undefined
    Object.keys(isDifficultySelected).forEach((key) => {
      isDifficultySelected[key] = false
    })
  } else if (entry.type === 'type') {
    filters.subjectType = undefined
    Object.keys(isTypeSelected).forEach((key) => {
      isTypeSelected[key] = false
    })
  } else if (entry.type === 'label') {
    selectedLabels[entry.value] = false
  }

  updateBreadcrumb()
  handleSearch()
}

/**
 * 清空所有筛选状态，并重新加载完整题目列表。
 */
function clearAllFilters() {
  currentLevel.value = 'primary'
  selectedCategories.primary = null
  selectedCategories.secondary = null
  currentLabels.value = []
  filters.categoryId = undefined
  filters.subjectDifficult = undefined
  filters.subjectType = undefined
  searchKeyword.value = ''
  pagination.pageNo = 1
  showLabelRail.value = false

  Object.keys(selectedLabels).forEach((key) => {
    selectedLabels[key] = false
  })

  Object.keys(isDifficultySelected).forEach((key) => {
    isDifficultySelected[key] = false
  })

  Object.keys(isTypeSelected).forEach((key) => {
    isTypeSelected[key] = false
  })

  localStorage.removeItem('homeFilters')
  updateBreadcrumb()
  fetchSubjects()
}

/**
 * 难度筛选采用单选逻辑，切换后立即刷新结果。
 */
function handleDifficultyChange(difficulty, isSelected) {
  Object.keys(isDifficultySelected).forEach((key) => {
    isDifficultySelected[key] = Number(key) === difficulty ? isSelected : false
  })

  filters.subjectDifficult = isSelected ? difficulty : undefined
  handleSearch()
}

/**
 * 题型筛选采用单选逻辑，避免顶部面板出现过多组合状态。
 */
function handleTypeChange(type, isSelected) {
  Object.keys(isTypeSelected).forEach((key) => {
    isTypeSelected[key] = Number(key) === type ? isSelected : false
  })

  filters.subjectType = isSelected ? type : undefined
  handleSearch()
}

/**
 * 根据当前筛选条件获取题目列表，并同步分页信息。
 */
async function fetchSubjects() {
  loading.value = true

  try {
    const params = {
      pageNum: pagination.pageNo,
      pageSize: pagination.pageSize,
      subjectName: searchKeyword.value || undefined,
      categoryId: filters.categoryId,
      labelIds_query: selectedLabelIds.value.length > 0 ? selectedLabelIds.value : undefined,
      subjectDifficult: filters.subjectDifficult,
      subjectType: filters.subjectType
    }

    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === '' ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    const res = await getSubjectsForUser(params)
    if (res.code === 200) {
      problems.value = res.data.result || []
      pagination.total = res.data.total || 0
      pagination.pageNo = res.data.pageNo || 1
      pagination.pageSize = res.data.pageSize || pagination.pageSize
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch (err) {
    ElMessage.error(`获取题目列表失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

/**
 * 获取全部分类数据，并拆分出主分类集合给顶部筛选轨使用。
 */
async function fetchCategories() {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.result || []
      primaryCategories.value = categories.value.filter((item) => item.parentId === 0)
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (err) {
    ElMessage.error(`获取分类列表失败: ${err.message}`)
  }
}

/**
 * 应用筛选时回到第一页，保证结果列表和分页状态一致。
 */
function handleSearch() {
  pagination.pageNo = 1
  saveFiltersToStorage()
  fetchSubjects()
}

/**
 * 进入答题页前，将当前列表缓存到 store，方便练习过程中切换题目。
 */
function goToProblem(problemId) {
  practiceStore.setProblemList(problems.value)
  practiceStore.clearPracticeSession()
  practiceStore.setPracticeContext(buildPracticeContext())
  practiceStore.setCurrentProblemId(problemId)
  router.push(`/practice/${problemId}`)
}

/**
 * 优先从当前结果集中挑选题目进入练习，避免用户跳出筛选上下文。
 */
async function startRandomPractice() {
  if (problems.value.length > 0) {
    const sortedProblems = [...problems.value].sort((a, b) => a.id - b.id)
    practiceStore.setProblemList(sortedProblems)
    practiceStore.clearPracticeSession()
    practiceStore.setPracticeContext(buildPracticeContext(5))
    router.push(`/practice/${sortedProblems[0].id}`)
    return
  }

  try {
    await fetchSubjects()
    if (problems.value.length > 0) {
      const sortedProblems = [...problems.value].sort((a, b) => a.id - b.id)
      practiceStore.setProblemList(sortedProblems)
      practiceStore.clearPracticeSession()
      practiceStore.setPracticeContext(buildPracticeContext(5))
      router.push(`/practice/${sortedProblems[0].id}`)
      return
    }

    ElMessage.warning('暂无题目可以练习')
    router.push('/practice')
  } catch (err) {
    ElMessage.error(`获取题目列表失败: ${err.message}`)
    router.push('/practice')
  }
}

/**
 * 构造练习会话上下文，便于答题页创建真实练习记录。
 *
 * @param {number} sourceType 练习来源类型
 * @returns {Object} 练习上下文快照
 */
function buildPracticeContext(sourceType = 1) {
  const category = selectedCategories.secondary || selectedCategories.primary
  return {
    sourceType,
    subjectType: filters.subjectType || 0,
    categoryId: category?.id || null,
    categoryNameSnapshot: category?.categoryName || scopeText.value || '全部题目',
    labelNames: currentLabels.value
      .filter((label) => selectedLabels[label.id])
      .map((label) => label.labelName)
  }
}

/**
 * 修改每页条数后重置分页并重新查询。
 */
function handleSizeChange(val) {
  pagination.pageSize = val
  pagination.pageNo = 1
  saveFiltersToStorage()
  fetchSubjects()
}

/**
 * 切换分页时保留筛选条件，只更新当前页码。
 */
function handleCurrentChange(val) {
  pagination.pageNo = val
  saveFiltersToStorage()
  fetchSubjects()
}

/**
 * 将难度值转换为 Element Plus 标签类型，方便列表样式复用。
 */
function getDifficultyType(difficulty) {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[difficulty] || ''
}

/**
 * 将难度值转换成可读文案，避免模板里堆映射逻辑。
 */
function getDifficultyLabel(difficulty) {
  const labelMap = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return labelMap[difficulty] || ''
}

/**
 * 统一题型标签类型，当前保持主色标签风格。
 */
function getSubjectTypeType() {
  return 'primary'
}

/**
 * 将题型值转换成中文文案，供顶部筛选和列表同时使用。
 */
function getSubjectTypeLabel(type) {
  const labelMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return labelMap[type] || ''
}

onMounted(async () => {
  await fetchCategories()
  await restoreFiltersFromStorage()
  updateBreadcrumb()
  await fetchSubjects()
})

provide('loading', loading)
provide('problems', problems)
provide('pagination', pagination)
provide('activeFilterCount', activeFilterCount)
provide('selectedLabelCount', selectedLabelCount)
provide('currentDeskMode', currentDeskMode)
provide('filterSummaryList', filterSummaryList)

provide('goToProblem', goToProblem)
provide('handleSizeChange', handleSizeChange)
provide('handleCurrentChange', handleCurrentChange)
provide('getDifficultyType', getDifficultyType)
provide('getDifficultyLabel', getDifficultyLabel)
provide('getSubjectTypeType', getSubjectTypeType)
provide('getSubjectTypeLabel', getSubjectTypeLabel)
</script>

<style scoped>
.question-bank-page {
  --qb-accent: #2563eb;
  --qb-accent-soft: rgba(37, 99, 235, 0.08);
  --qb-accent-border: rgba(37, 99, 235, 0.16);
  --qb-page-bg: #f4f6fa;
  --qb-border: rgba(15, 23, 42, 0.08);
  --qb-line: rgba(15, 23, 42, 0.06);
  --qb-surface: rgba(244, 246, 250, 0.92);
  --qb-surface-elevated: #ffffff;
  --qb-surface-hover: #eef2f7;
  --qb-text-main: var(--color-text);
  --qb-text-sub: var(--color-text-secondary);
  --qb-text-faint: var(--color-text-muted);
  min-height: 100vh;
  background: var(--qb-page-bg);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.question-workbar {
  position: sticky;
  top: 84px;
  z-index: 10;
  margin-bottom: 18px;
  padding: 8px 0 12px;
  background: var(--qb-surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--qb-border);
}

.toolbar-row {
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.toolbar-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-title {
  color: var(--qb-text-main);
  font-size: clamp(28px, 2.4vw, 36px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.toolbar-count {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--qb-border);
  background: var(--qb-surface-elevated);
  color: var(--qb-text-sub);
  font-size: 12px;
  font-weight: 700;
}

.toolbar-subtitle {
  margin-top: 5px;
  color: var(--qb-text-sub);
  font-size: 13px;
  line-height: 1.4;
}

.toolbar-search :deep(.el-input__wrapper) {
  min-height: 40px;
  border-radius: 0;
  background: var(--qb-surface-elevated);
  box-shadow: 0 0 0 1px var(--qb-border) inset;
}

.toolbar-search :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--qb-accent) inset,
    0 0 0 2px rgba(37, 99, 235, 0.08);
}

.toolbar-search :deep(.el-input__inner),
.toolbar-search :deep(.el-input__inner::placeholder),
.toolbar-search :deep(.el-input__prefix-inner),
.toolbar-search :deep(.el-input__suffix-inner) {
  color: var(--qb-text-sub);
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid var(--qb-border);
  background: var(--qb-surface-elevated);
  color: var(--qb-text-main);
  font-size: 13px;
  font-weight: 700;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.toolbar-action-primary {
  border-color: var(--qb-accent);
  background: var(--qb-accent);
  color: #ffffff;
}

.toolbar-action-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.toolbar-action-secondary:hover,
.filter-chip:hover,
.active-pill:hover {
  background: var(--qb-surface-hover);
}

.filter-rail {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.filter-line {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.filter-key {
  padding-top: 8px;
  color: var(--qb-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.filter-items-scroll {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid var(--qb-border);
  background: var(--qb-surface-elevated);
  color: var(--qb-text-sub);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.filter-chip.active {
  border-color: var(--qb-accent-border);
  background: var(--qb-accent-soft);
  color: var(--qb-accent);
}

.filter-chip-strong.active {
  border-color: #334155;
  background: #334155;
  color: #ffffff;
}

.filter-chip-toggle span {
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
}

.filter-chip-soft.is-easy.active {
  border-color: rgba(34, 197, 94, 0.18);
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.filter-chip-soft.is-medium.active {
  border-color: rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.filter-chip-soft.is-hard.active {
  border-color: rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.active-strip {
  display: grid;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--qb-line);
}

.scope-path,
.active-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.scope-node {
  padding: 0;
  border: none;
  background: none;
  color: var(--qb-text-sub);
  font-size: 12px;
  font-weight: 700;
}

.scope-node:hover {
  color: var(--qb-accent);
}

.scope-separator {
  color: var(--qb-text-faint);
  font-size: 12px;
}

.active-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid var(--qb-border);
  background: var(--qb-surface-elevated);
  color: var(--qb-text-sub);
  font-size: 12px;
  font-weight: 600;
}

.active-pill-close {
  color: var(--qb-text-faint);
  font-size: 12px;
}

.content-layout {
  display: flex;
}

.question-bank-page.is-dark {
  --qb-accent: #60a5fa;
  --qb-accent-soft: rgba(96, 165, 250, 0.14);
  --qb-accent-border: rgba(96, 165, 250, 0.22);
  --qb-page-bg: #0a1220;
  --qb-border: rgba(148, 163, 184, 0.14);
  --qb-line: rgba(148, 163, 184, 0.1);
  --qb-surface: rgba(10, 18, 32, 0.92);
  --qb-surface-elevated: #111b2e;
  --qb-surface-hover: #162338;
  --qb-text-main: var(--text-1);
  --qb-text-sub: var(--text-2);
  --qb-text-faint: var(--text-3);
}

.question-bank-page.is-dark .toolbar-search :deep(.el-input__wrapper) {
  background: var(--qb-surface-elevated);
}

.question-bank-page.is-dark .toolbar-search :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.42) inset,
    0 0 0 2px rgba(96, 165, 250, 0.1);
}

.question-bank-page.is-dark .filter-chip-strong.active {
  background: #475569;
  border-color: #475569;
}

.question-bank-page.is-dark .filter-chip-soft.is-easy.active {
  color: #86efac;
}

.question-bank-page.is-dark .filter-chip-soft.is-medium.active {
  color: #fcd34d;
}

.question-bank-page.is-dark .filter-chip-soft.is-hard.active {
  color: #fca5a5;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .question-workbar {
    position: static;
  }

  .toolbar-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filter-line {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .filter-key {
    padding-top: 0;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }

  .toolbar-action {
    flex: 1 1 calc(50% - 4px);
  }

  .toolbar-action:last-child {
    flex-basis: 100%;
  }
}
</style>
