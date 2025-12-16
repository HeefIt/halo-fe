<!--
  CategoryManagement 分类管理组件
  功能描述：管理员管理题目分类的组件
  主要功能：
    - 分类列表查看：按分类名称、类型、父级管理
    - 分类搬查：按分类名称模糊搬查
    - 分类添加：添加新分类（支持主分筫与一级分管）
    - 分类编辑：修改分类信息
    - 分类删除：删除分类（其下题目会变为未分筫状态）
  使用位置：Admin.vue的"分类管理"上
-->
<template>
  <div class="category-management">
    <div class="section-header">
      <h2>分类管理</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索分类..."
          :prefix-icon="Search"
          style="width: 200px; margin-right: 16px;"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button type="primary" @click="handleAddCategory" style="margin-left: 16px;">
          <el-icon><Plus /></el-icon>添加分类
        </el-button>
      </div>
    </div>

    <el-table :data="categoryList" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="categoryName" label="分类名称" />
      <el-table-column prop="categoryType" label="分类类型" width="120" />
      <el-table-column prop="imageUrl" label="图标链接" />
      <el-table-column prop="parentId" label="父级ID" width="100" />
      <el-table-column prop="createdBy" label="创建人" width="120" />
      <el-table-column prop="createdTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editCategory(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCategoryHandler(scope.row)">删除</el-button>
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

    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      v-model="showAddCategoryDialog" 
      :title="editingCategory ? '编辑分类' : '添加分类'" 
      width="500px"
    >
      <el-form :model="categoryForm" label-width="100px" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类类型" prop="categoryType">
          <el-select v-model="categoryForm.categoryType" placeholder="请选择分类类型" style="width: 100%">
            <el-option label="类别1" :value="1" />
            <el-option label="类别2" :value="2" />
            <el-option label="类别3" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标链接" prop="imageUrl">
          <el-input v-model="categoryForm.imageUrl" placeholder="请输入图标链接" />
        </el-form-item>
        <el-form-item label="父级ID" prop="parentId">
          <el-input-number v-model="categoryForm.parentId" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddCategoryDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryPage, addCategory, updateCategory, deleteCategory } from '@/api/category'

// 搜索关键词
const searchKeyword = ref('')

// 控制对话框显示
const showAddCategoryDialog = ref(false)

// 编辑状态
const editingCategory = ref(null)

// 分类表单数据
const categoryForm = reactive({
  categoryName: '',
  categoryType: 1,
  imageUrl: '',
  parentId: 0
})

// 表单引用 (一个引用地址变量---关键是ref()  默认是空引用--具体引用谁需要在template中<ref标签定义>)
const categoryFormRef = ref()

// 加载状态
const loading = ref(false)

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
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      categoryName: searchKeyword.value || undefined
    }

    const res = await getCategoryPage(params)
    
    if (res.success) {
      categoryList.value = res.data.result
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchCategoryList()
}

// 处理页面大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchCategoryList()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchCategoryList()
}

// 添加分类
const handleAddCategory = () => {
  editingCategory.value = null
  resetCategoryForm()
  showAddCategoryDialog.value = true
}

// 编辑分类
const editCategory = (category) => {
  editingCategory.value = category
  // 填充表单数据
  categoryForm.categoryName = category.categoryName
  categoryForm.categoryType = category.categoryType
  categoryForm.imageUrl = category.imageUrl
  categoryForm.parentId = category.parentId
  showAddCategoryDialog.value = true
}

// 删除分类
const deleteCategoryHandler = (category) => {
  ElMessageBox.confirm(`确定要删除分类 "${category.categoryName}" 吗？该分类下的题目不会被删除，但会变为未分类状态。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用删除接口
      const res = await deleteCategory(category.id)
      if (res.success) {
        ElMessage.success('分类删除成功')
        // 刷新列表
        fetchCategoryList()
      } else {
        ElMessage.error(res.message || '删除分类失败')
      }
    } catch (error) {
      ElMessage.error('删除分类失败')
      console.error('删除分类失败:', error)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 保存分类
const saveCategory = async () => {
  // 表单验证
  if (categoryFormRef.value) {
    await categoryFormRef.value.validate((valid) => {
      if (!valid) {
        return false
      }
    })
  }

  try {
    let res;
    if (editingCategory.value) {
      // 编辑分类
      res = await updateCategory(editingCategory.value.id, {
        categoryName: categoryForm.categoryName,
        categoryType: categoryForm.categoryType,
        imageUrl: categoryForm.imageUrl,
        parentId: categoryForm.parentId
      })
      if (res.success) {
        ElMessage.success('分类信息已更新')
      } else {
        ElMessage.error(res.message || '更新分类失败')
        return
      }
    } else {
      // 添加新分类
      res = await addCategory({
        categoryName: categoryForm.categoryName,
        categoryType: categoryForm.categoryType,
        imageUrl: categoryForm.imageUrl,
        parentId: categoryForm.parentId
      })
      if (res.success) {
        ElMessage.success('分类添加成功')
      } else {
        ElMessage.error(res.message || '添加分类失败')
        return
      }
    }
    
    // 重置表单和对话框
    resetCategoryForm()
    showAddCategoryDialog.value = false
    editingCategory.value = null
    
    // 刷新列表
    fetchCategoryList()
  } catch (error) {
    ElMessage.error(editingCategory.value ? '更新分类失败' : '添加分类失败')
    console.error(editingCategory.value ? '更新分类失败:' : '添加分类失败:', error)
  }
}

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.categoryName = ''
  categoryForm.categoryType = 1
  categoryForm.imageUrl = ''
  categoryForm.parentId = 0
  
  // 清除表单验证
  nextTick(() => {
    if (categoryFormRef.value) {
      categoryFormRef.value.clearValidate()
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  resetCategoryForm()
  fetchCategoryList()
})

// 暴露方法给父组件
defineExpose({
  resetCategoryForm
})
</script>

<style scoped>
.category-management {
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