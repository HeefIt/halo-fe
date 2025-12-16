<!--
  TagManagement 标签管理组件
  功能描述：管理员管理题目标签的组件
  主要功能：
    - 标签列表查看：分页查看所有标签
    - 标签搬查：按标签名称模糊搬查
    - 标签添加：添加新标签并指定所属分类
    - 标签编辑：改变标签信息、排序、分类
    - 标签删除：删除标签
    - 标签排序：故合時秋分頕並修改排序须殄是不可
  使用位置：Admin.vue的"标签管理"上
-->
<template>
  <div class="tag-management">
    <div class="section-header">
      <h2>标签管理</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标签..."
          :prefix-icon="Search"
          style="width: 200px; margin-right: 16px;"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button type="primary" @click="handleAddTag" style="margin-left: 16px;">
          <el-icon><Plus /></el-icon>添加标签
        </el-button>
      </div>
    </div>

    <el-table :data="tagList" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="labelName" label="标签名称" />
      <el-table-column prop="sortNum" label="排序号" width="100" />
      <el-table-column label="分类" width="200">
        <template #default="scope">
          <span>{{ scope.row.categoryId }} - {{ getCategoryName(scope.row.categoryId) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdBy" label="创建人" width="120" />
      <el-table-column prop="createdTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editTag(scope.row)">编辑</el-button>
          <el-button size=" small" type="danger" @click="deleteTagHandler(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: flex-end;"
    />

    <!-- 添加/编辑标签对话框 -->
    <el-dialog 
      v-model="showAddTagDialog" 
      :title="editingTag ? '编辑标签' : '添加标签'" 
      width="500px"
    >
      <el-form :model="tagForm" label-width="100px" ref="tagFormRef">
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="tagForm.labelName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNum">
          <el-input-number v-model="tagForm.sortNum" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="tagForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categoryList"
              :key="category.id"
              :label="`${category.id} - ${category.categoryName}`"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddTagDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTag">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLabelPage, addLabel, updateLabel, deleteLabel } from '@/api/label'
import { getCategoryPage } from '@/api/category'

// 搜索关键词
const searchKeyword = ref('')

// 控制对话框显示
const showAddTagDialog = ref(false)

// 编辑状态
const editingTag = ref(null)

// 标签表单数据
const tagForm = reactive({
  labelName: '',
  sortNum: 1,
  categoryId: ''
})

// 表单引用
const tagFormRef = ref()

// 加载状态
const loading = ref(false)

// 标签数据
const tagList = ref([])

// 分类数据
const categoryList = ref([])

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    // 获取所有分类（设置一个较大的pageSize）
    const res = await getCategoryPage({ pageNum: 1, pageSize: 1000 })
    
    if (res.success) {
      categoryList.value = res.data.result
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error('获取分类列表失败:', error)
  }
}

// 获取标签列表
const fetchTagList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      labelName: searchKeyword.value || undefined
    }

    const res = await getLabelPage(params)
    
    if (res.success) {
      tagList.value = res.data.result
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取标签列表失败')
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return '未分配分类'
  
  // 确保类型匹配，都转换为字符串进行比较
  const category = categoryList.value.find(c => String(c.id) === String(categoryId))
  return category ? category.categoryName : '未知分类'
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchTagList()
}

// 处理页面大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchTagList()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchTagList()
}

// 添加标签
const handleAddTag = () => {
  editingTag.value = null
  resetTagForm()
  showAddTagDialog.value = true
}

// 编辑标签
const editTag = (tag) => {
  editingTag.value = tag
  // 填充表单数据
  tagForm.labelName = tag.labelName
  tagForm.sortNum = tag.sortNum
  tagForm.categoryId = tag.categoryId
  showAddTagDialog.value = true
}

// 删除标签
const deleteTagHandler = (tag) => {
  ElMessageBox.confirm(`确定要删除标签 "${tag.labelName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用删除接口
      const res = await deleteLabel(tag.id)
      if (res.success) {
        ElMessage.success('标签删除成功')
        // 刷新列表
        fetchTagList()
      } else {
        ElMessage.error(res.message || '删除标签失败')
      }
    } catch (error) {
      ElMessage.error('删除标签失败')
      console.error('删除标签失败:', error)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 保存标签
const saveTag = async () => {
  // 表单验证
  if (tagFormRef.value) {
    await tagFormRef.value.validate((valid) => {
      if (!valid) {
        return false
      }
    })
  }

  try {
    let res;
    if (editingTag.value) {
      // 编辑标签
      res = await updateLabel(editingTag.value.id, {
        labelName: tagForm.labelName,
        sortNum: tagForm.sortNum,
        categoryId: tagForm.categoryId
      })
      if (res.success) {
        ElMessage.success('标签信息已更新')
      } else {
        ElMessage.error(res.message || '更新标签失败')
        return
      }
    } else {
      // 添加新标签
      res = await addLabel({
        labelName: tagForm.labelName,
        sortNum: tagForm.sortNum,
        categoryId: tagForm.categoryId
      })
      if (res.success) {
        ElMessage.success('标签添加成功')
      } else {
        ElMessage.error(res.message || '添加标签失败')
        return
      }
    }
    
    // 重置表单和对话框
    resetTagForm()
    showAddTagDialog.value = false
    editingTag.value = null
    
    // 刷新列表
    fetchTagList()
  } catch (error) {
    ElMessage.error(editingTag.value ? '更新标签失败' : '添加标签失败')
    console.error(editingTag.value ? '更新标签失败:' : '添加标签失败:', error)
  }
}

// 重置标签表单
const resetTagForm = () => {
  tagForm.labelName = ''
  tagForm.sortNum = 1
  tagForm.categoryId = ''
  
  // 清除表单验证
  nextTick(() => {
    if (tagFormRef.value) {
      tagFormRef.value.clearValidate()
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  resetTagForm()
  fetchCategoryList()
  fetchTagList()
})

// 暴露方法给父组件
defineExpose({
  resetTagForm
})
</script>

<style scoped>
.label-management {
  padding: 20px;
}

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