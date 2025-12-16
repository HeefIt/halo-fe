<!--
  SubjectManagement 题目管理组件
  功能描述：管理员管理整个题库题目的组件
  主要功能：
    - 题目列表查看：按题目名称、难度、类型筛选
    - 题目添加：添加新题目（一体器应用支持所有不同类型）
    - 题目编辑：修改题目内容、选项、不断修改相关信息
    - 题目删除：删除一或多个题目
    - 声幡嬢层隐藏：根据不同题目类型区分显示不同潮变
  使用位置：Admin.vue的"题目管理"上
-->
<template>
  <div class="tab-content">
    <div class="section-header">
      <h2>题目管理</h2>
      <div class="actions">
        <el-input
          v-model="searchForm.subjectName"
          placeholder="搜索题目..."
          :prefix-icon="Search"
          style="width: 200px; margin-right: 16px;"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="showAddProblemDialog = true">
          <el-icon><Plus /></el-icon>添加题目
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选条件 -->
    <el-card class="search-filter-card" shadow="never">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="题目难度">
          <el-select v-model="searchForm.subjectDifficult" placeholder="请选择难度" clearable>
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目类型">
          <el-select v-model="searchForm.subjectType" placeholder="请选择类型" clearable>
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="判断题" :value="3" />
            <el-option label="简答题" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 筛选标签 -->
    <div class="filter-tags" v-if="searchForm.subjectDifficult || searchForm.subjectType">
      <el-tag
        v-if="searchForm.subjectDifficult"
        closable
        @close="clearFilter('subjectDifficult')"
        type="info"
        class="filter-tag"
      >
        难度: {{ getDifficultyLabel(searchForm.subjectDifficult) }}
      </el-tag>
      <el-tag
        v-if="searchForm.subjectType"
        closable
        @close="clearFilter('subjectType')"
        type="info"
        class="filter-tag"
      >
        类型: {{ getSubjectTypeLabel(searchForm.subjectType) }}
      </el-tag>
    </div>

    <!-- 题目列表 -->
    <el-table 
      v-loading="loading" 
      :data="subjects" 
      style="width: 100%" 
      border
      @row-dblclick="viewSubjectDetail"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="subjectName" label="题目标题" />
      <el-table-column prop="subjectDifficult" label="难度" width="100">
        <template #default="scope">
          <el-tag :type="getDifficultyType(scope.row.subjectDifficult)">
            {{ getDifficultyLabel(scope.row.subjectDifficult) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="subjectType" label="题目类型" width="100">
        <template #default="scope">
          {{ getSubjectTypeLabel(scope.row.subjectType) }}
        </template>
      </el-table-column>
      <el-table-column prop="settleName" label="出题人" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editProblem(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteProblem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="pagination.pageNo"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: flex-end;"
    />

    <!-- 添加/编辑题目对话框 -->
    <el-dialog 
      v-model="showAddProblemDialog" 
      :title="editingProblem ? '编辑题目' : '添加题目'" 
      width="80%"
      @close="handleDialogClose"
    >
      <el-form :model="addProblemForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目名称">
              <el-input v-model="addProblemForm.subjectName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出题人名">
              <el-input v-model="addProblemForm.settleName" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目难度">
              <el-select v-model="addProblemForm.subjectDifficult" placeholder="请选择题目难度">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="题目类型">
              <el-select v-model="addProblemForm.subjectType" placeholder="请选择题目类型" @change="handleSubjectTypeChange">
                <el-option label="单选" :value="1" />
                <el-option label="多选" :value="2" />
                <el-option label="判断" :value="3" />
                <el-option label="简答" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目分数">
              <el-input-number v-model="addProblemForm.subjectScore" :min="1" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="分类">
          <el-select v-model="addProblemForm.categoryIds" multiple placeholder="请选择分类(必选)">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="`${category.id} - ${category.categoryName}`" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select v-model="addProblemForm.labelIds" multiple placeholder="请选择标签(必选)">
            <el-option 
              v-for="label in labels" 
              :key="label.id" 
              :label="`${label.id} - ${label.labelName}`" 
              :value="label.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="题目解析">
          <el-input v-model="addProblemForm.subjectParse" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- 简答题答案 -->
        <el-form-item 
          v-if="addProblemForm.subjectType === 4" 
          label="题目答案"
        >
          <el-input v-model="addProblemForm.subjectAnswer" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- 选择题选项 -->
        <el-form-item 
          v-if="[1, 2, 3].includes(addProblemForm.subjectType)" 
          label="选项设置"
        >
          <el-table :data="addProblemForm.optionList" style="width: 100%">
            <el-table-column label="选项类型" width="100">
              <template #default="scope">
                <el-select v-model="scope.row.optionType">
                  <el-option 
                    v-for="(option, index) in optionTypes" 
                    :key="index" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="选项内容">
              <template #default="scope">
                <el-input v-model="scope.row.optionContent" />
              </template>
            </el-table-column>
            <el-table-column label="是否正确" width="100">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.isCorrect"
                  :active-value="1"
                  :inactive-value="0"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeOption(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button 
            style="margin-top: 10px;" 
            @click="addOption"
          >
            添加选项
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="saveProblem">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 题目详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="题目详情" width="80%">
      <el-form :model="subjectDetail" label-width="100px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目名称">
              <el-input v-model="subjectDetail.subjectName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出题人名">
              <el-input v-model="subjectDetail.settleName" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目难度">
              <el-select v-model="subjectDetail.subjectDifficult" placeholder="请选择题目难度">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="题目类型">
              <el-select v-model="subjectDetail.subjectType" placeholder="请选择题目类型">
                <el-option label="单选" :value="1" />
                <el-option label="多选" :value="2" />
                <el-option label="判断" :value="3" />
                <el-option label="简答" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目分数">
              <el-input-number v-model="subjectDetail.subjectScore" :min="1" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="分类">
          <el-select v-model="subjectDetail.categoryIds" multiple placeholder="请选择分类">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="`${category.id} - ${category.categoryName}`" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select v-model="subjectDetail.labelIds" multiple placeholder="请选择标签">
            <el-option 
              v-for="label in labels" 
              :key="label.id" 
              :label="`${label.id} - ${label.labelName}`" 
              :value="label.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="题目解析">
          <el-input v-model="subjectDetail.subjectParse" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- 简答题答案 -->
        <el-form-item 
          v-if="subjectDetail.subjectType === 4" 
          label="题目答案"
        >
          <el-input v-model="subjectDetail.subjectAnswer" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- 选择题选项 -->
        <el-form-item 
          v-if="[1, 2, 3].includes(subjectDetail.subjectType)" 
          label="选项设置"
        >
          <el-table :data="subjectDetail.optionList" style="width: 100%">
            <el-table-column label="选项类型" width="100">
              <template #default="scope">
                <el-select v-model="scope.row.optionType">
                  <el-option 
                    v-for="(option, index) in optionTypes" 
                    :key="index" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="选项内容">
              <template #default="scope">
                <el-input v-model="scope.row.optionContent" />
              </template>
            </el-table-column>
            <el-table-column label="是否正确" width="100">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.isCorrect"
                  :active-value="1"
                  :inactive-value="0"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubjects, addSubject, getSubjectInfo, updateSubject, deleteSubject } from '@/api/subject.js'
import { getCategoryList } from '@/api/category.js'
import { getLabelList } from '@/api/label.js'

// 加载状态
const loading = ref(false)

// 题目数据
const subjects = ref([])

// 分类数据
const categories = ref([])

// 标签数据
const labels = ref([])

// 选项类型
const optionTypes = [
  { label: 'A', value: 1 },
  { label: 'B', value: 2 },
  { label: 'C', value: 3 },
  { label: 'D', value: 4 },
  { label: 'E', value: 5 },
  { label: 'F', value: 6 },
  { label: 'G', value: 7 },
  { label: 'H', value: 8 }
]

// 分页数据
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  subjectName: '',
  subjectDifficult: undefined,
  subjectType: undefined
})

// 控制对话框显示
const showAddProblemDialog = ref(false)

// 取消按钮处理
const handleCancel = () => {
  showAddProblemDialog.value = false
}

// 监听对话框关闭事件
const handleDialogClose = () => {
  if (!editingProblem.value) {
    // 当新增题目对话框关闭时，重置表单
    resetAddProblemForm()
  }
  editingProblem.value = null
}

// 控制详情对话框显示
const showDetailDialog = ref(false)

// 编辑状态
const editingProblem = ref(null)

// 新增题目表单数据（独立于编辑和详情）
const addProblemForm = reactive({
  subjectName: '',
  subjectDifficult: 1,
  settleName: '',
  subjectType: 1,
  subjectScore: 10,
  subjectParse: '',
  subjectAnswer: '',
  categoryIds: [],
  labelIds: [],
  optionList: []
})

// 题目详情数据
const subjectDetail = ref({})

// 获取题目列表
const fetchSubjects = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNo,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    // 清除未设置的查询参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })

    const res = await getSubjects(params)
    if (res.code === 200) {
      subjects.value = res.data.result
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

// 处理搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchSubjects()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    subjectName: '',
    subjectDifficult: undefined,
    subjectType: undefined
  })
  pagination.pageNo = 1
  fetchSubjects()
}

// 清除特定筛选条件
const clearFilter = (key) => {
  searchForm[key] = undefined
  handleSearch()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNo = 1
  fetchSubjects()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.pageNo = val
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

// 查看题目详情
const viewSubjectDetail = async (row) => {
  try {
    const response = await getSubjectInfo(row.id)
    if (response.success) {
      subjectDetail.value = response.data
      
      // 确保分类和标签数据显示正确
      if (subjectDetail.value.categoryIds && !Array.isArray(subjectDetail.value.categoryIds)) {
        subjectDetail.value.categoryIds = [subjectDetail.value.categoryIds]
      } else if (!subjectDetail.value.categoryIds) {
        subjectDetail.value.categoryIds = []
      }
      
      if (subjectDetail.value.labelIds && !Array.isArray(subjectDetail.value.labelIds)) {
        subjectDetail.value.labelIds = [subjectDetail.value.labelIds]
      } else if (!subjectDetail.value.labelIds) {
        subjectDetail.value.labelIds = []
      }
      
      showDetailDialog.value = true
    } else {
      ElMessage.error(response.message || '获取题目详情失败')
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  }
}

// 编辑题目
const editProblem = async (problem) => {
  try {
    // 先获取题目详情
    const response = await getSubjectInfo(problem.id)
    if (response.success) {
      editingProblem.value = problem
      const detail = response.data
      
      // 填充表单数据
      Object.assign(addProblemForm, {
        id: detail.id,
        subjectName: detail.subjectName,
        subjectDifficult: detail.subjectDifficult,
        settleName: detail.settleName,
        subjectType: detail.subjectType,
        subjectScore: detail.subjectScore,
        subjectParse: detail.subjectParse,
        subjectAnswer: detail.subjectAnswer,
        categoryIds: Array.isArray(detail.categoryIds) ? detail.categoryIds : (detail.categoryIds || []),
        labelIds: Array.isArray(detail.labelIds) ? detail.labelIds : (detail.labelIds || []),
        optionList: detail.optionList || []
      })
      
      showAddProblemDialog.value = true
    } else {
      ElMessage.error(response.message || '获取题目详情失败')
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  }
}

// 删除题目
const deleteProblem = (problem) => {
  ElMessageBox.confirm(`确定要删除题目 "${problem.subjectName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSubject({ id: problem.id })
      if (res.success) {
        ElMessage.success('题目删除成功')
        // 重新获取题目列表
        fetchSubjects()
      } else {
        ElMessage.error(res.message || '删除题目失败')
      }
    } catch (error) {
      ElMessage.error('删除题目失败: ' + error.message)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 保存题目
const saveProblem = async () => {
  if (editingProblem.value) {
    // 编辑题目
    try {
      // 确保分类和标签信息正确传递，同时确保包含题目ID
      const requestData = {
        ...addProblemForm,
        id: addProblemForm.id,
        categoryIds: addProblemForm.categoryIds || [],
        labelIds: addProblemForm.labelIds || []
      }
              
      const response = await updateSubject(requestData)
      if (response.success) {
        ElMessage.success('题目信息已更新')
        // 关闭对话框并重置表单
        showAddProblemDialog.value = false
        resetAddProblemForm()
        // 重新获取题目列表
        fetchSubjects()
      } else {
        ElMessage.error(response.message || '更新题目失败')
      }
    } catch (error) {
      console.error('更新题目失败:', error)
      ElMessage.error('更新题目失败')
    }
  } else {
    // 添加新题目
    
    // 验证分类和标签是否已选择
    if (!addProblemForm.categoryIds || addProblemForm.categoryIds.length === 0) {
      ElMessage.error('请至少选择一个分类')
      return
    }
    
    if (!addProblemForm.labelIds || addProblemForm.labelIds.length === 0) {
      ElMessage.error('请至少选择一个标签')
      return
    }
    
    try {
      // 确保分类和标签信息正确传递
      const requestData = {
        ...addProblemForm,
        categoryIds: addProblemForm.categoryIds || [],
        labelIds: addProblemForm.labelIds || []
      }
              
      const response = await addSubject(requestData)
      if (response.success) {
        ElMessage.success('题目添加成功')
        // 关闭对话框并重置表单
        showAddProblemDialog.value = false
        resetAddProblemForm()
        // 重新获取题目列表
        fetchSubjects()
      } else {
        ElMessage.error(response.message || '题目添加失败')
      }
    } catch (error) {
      console.error('添加题目失败:', error)
      ElMessage.error('题目添加失败')
    }
  }
}

// 处理题目类型变更
const handleSubjectTypeChange = (newType) => {
  // 当题目类型改变时，清空选项列表
  if ([1, 2, 3].includes(newType)) {
    addProblemForm.optionList = []
  }
}

// 添加选项
const addOption = () => {
  addProblemForm.optionList.push({
    optionType: addProblemForm.optionList.length + 1,
    optionContent: '',
    isCorrect: 0
  })
}

// 删除选项
const removeOption = (index) => {
  addProblemForm.optionList.splice(index, 1)
}

// 重置新增题目表单
const resetAddProblemForm = () => {
  Object.assign(addProblemForm, {
    subjectName: '',
    subjectDifficult: 1,
    settleName: '',
    subjectType: 1,
    subjectScore: 10,
    subjectParse: '',
    subjectAnswer: '',
    categoryIds: [],
    labelIds: [],
    optionList: []
  })
}

// 获取分类列表
const loadCategories = async () => {
  try {
    const response = await getCategoryList()
    if (response.success) {
      categories.value = response.data.result || response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 获取标签列表
const loadLabels = async () => {
  try {
    const response = await getLabelList()
    if (response.success) {
      labels.value = response.data.result || response.data
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  }
}

// 页面加载时获取题目列表
onMounted(() => {
  fetchSubjects()
  loadCategories()
  loadLabels()
})

// 暴露方法给父组件
defineExpose({
  resetAddProblemForm
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

.search-filter-card {
  margin-bottom: 20px;
}

.search-filter-card .el-form-item {
  margin-right: 20px;
}

.filter-tags {
  margin-bottom: 20px;
}

.filter-tag {
  margin-right: 10px;
}
</style>