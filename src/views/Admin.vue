<!--
  Admin 管理后台组件
  功能描述：管理员专用功能页面
  主要功能：
    - 用户管理：查看、编辑、删除用户，管理用户状态
    - 分类管理：创建、编辑、删除题目分类
    - 标签管理：创建、编辑、删除题目标签
    - 题目管理：创建、编辑、删除题目，管理题目信息
    - 数据统计：查看网站整体数据统计和趋势
  权限：仅管理员用户（username包含'admin'）可访问
  使用位置：路由 /admin
-->
<template>
  <div class="admin-page">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="nav-content">
          <div class="nav-left">
            <el-button @click="$router.back()" :icon="ArrowLeft" circle />
            <h1>管理后台</h1>
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
        <el-tabs v-model="activeTab" class="admin-tabs" @tab-change="handleTabChange">
          <!-- 用户管理 -->
          <el-tab-pane label="用户管理" name="users">
            <UserManagement 
              ref="userManagementRef"
              v-model:user-search="userSearch"
              v-model:show-add-user-dialog="showAddUserDialog"
              v-model:editing-user="editingUser"
              v-model:user-form="userForm"
              v-model:users="users"
            />
          </el-tab-pane>
          
          <!-- 分类管理 -->
          <el-tab-pane label="分类管理" name="categories">
            <CategoryManagement
              v-if="loadedTabs.categories"
              v-model:search-keyword="categorySearch"
              v-model:show-add-category-dialog="showAddCategoryDialog"
              v-model:editing-category="editingCategory"
              v-model:category-form="categoryForm"
              v-model:categories="categories"
            />
          </el-tab-pane>
          
          <!-- 标签管理 -->
          <el-tab-pane label="标签管理" name="tags">
            <TagManagement 
              v-if="loadedTabs.tags"
            />
          </el-tab-pane>
          
          <!-- 题目管理 -->
          <el-tab-pane label="题目管理" name="problems">
            <SubjectManagement
              v-if="loadedTabs.problems"
              v-model:problem-search="problemSearch"
              v-model:show-add-problem-dialog="showAddProblemDialog"
              v-model:editing-problem="editingProblem"
              v-model:problem-form="problemForm"
              v-model:problems="problems"
            />
          </el-tab-pane>
          
          <!-- 数据统计 -->
          <el-tab-pane label="数据统计" name="statistics">
            <Statistics 
              v-if="loadedTabs.statistics"
              v-model:stats="stats" 
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import UserManagement from '@/views/modules/admin/UserManagement.vue'
import CategoryManagement from '@/views/modules/admin/CategoryManagement.vue'
import TagManagement from '@/views/modules/admin/TagManagement.vue'
import SubjectManagement from '@/views/modules/admin/SubjectManagement.vue'
import Statistics from '@/views/modules/admin/Statistics.vue'

const router = useRouter()

// 用户管理组件引用
const userManagementRef = ref(null)

// 当前激活的标签页
const activeTab = ref('users')

// 记录已加载的标签页
const loadedTabs = reactive({
  users: true,
  categories: false,
  tags: false,
  problems: false,
  statistics: false
})

// 用户搜索关键词
const userSearch = ref('')

// 分类搜索关键词
const categorySearch = ref('')

// 题目搜索关键词
const problemSearch = ref('')

// 控制对话框显示
const showAddUserDialog = ref(false)
const showAddCategoryDialog = ref(false)
const showAddProblemDialog = ref(false)

// 编辑状态
const editingUser = ref(null)
const editingCategory = ref(null)
const editingProblem = ref(null)

// 用户表单数据
const userForm = reactive({
  id: null,
  userName: '',
  nickName: '',
  email: '',
  phone: '',
  status: 0
})

// 分类表单数据
const categoryForm = reactive({
  id: null,
  name: '',
  description: ''
})

// 题目表单数据
const problemForm = reactive({
  id: null,
  title: '',
  description: '',
  category: '',
  difficulty: '简单'
})

// 模拟用户数据
const users = ref([])

// 模拟分类数据
const categories = ref([
  {
    id: 1,
    name: 'Java基础',
    description: 'Java语言基础知识相关题目',
    problemCount: 15
  },
  {
    id: 2,
    name: 'JVM',
    description: 'Java虚拟机相关知识点',
    problemCount: 12
  },
  {
    id: 3,
    name: '并发编程',
    description: '多线程、并发包相关内容',
    problemCount: 18
  },
  {
    id: 4,
    name: 'Spring',
    description: 'Spring框架相关知识',
    problemCount: 22
  },
  {
    id: 5,
    name: 'MySQL',
    description: 'MySQL数据库相关题目',
    problemCount: 14
  },
  {
    id: 6,
    name: 'Redis',
    description: 'Redis缓存系统相关知识',
    problemCount: 9
  }
])

// 模拟题目数据
const problems = ref([
  {
    id: 1,
    title: 'Java基础：面向对象三大特性',
    description: '请简述Java面向对象编程的三大特性：封装、继承和多态，并举例说明各自的应用场景...',
    category: 'Java基础',
    difficulty: '简单'
  },
  {
    id: 2,
    title: 'JVM内存模型详解',
    description: '请描述JVM的内存结构，包括方法区、堆、栈、本地方法栈和程序计数器的作用及特点...',
    category: 'JVM',
    difficulty: '中等'
  },
  {
    id: 3,
    title: '并发编程：线程池原理与应用',
    description: '详细说明Java线程池的工作原理，以及ThreadPoolExecutor各个参数的含义和使用场景...',
    category: '并发编程',
    difficulty: '困难'
  },
  {
    id: 4,
    title: 'Spring Bean生命周期',
    description: '请描述Spring框架中Bean的完整生命周期，从实例化到销毁的各个阶段及其扩展点...',
    category: 'Spring',
    difficulty: '中等'
  }
])

// 模拟统计数据
const stats = ref({
  totalUsers: 128,
  totalProblems: 86,
  onlineUsers: 24,
  totalSubmissions: 1245
})

// 处理标签页切换
const handleTabChange = (tabName) => {
  // 标记标签页为已加载
  loadedTabs[tabName] = true;
  
  // 当切换到用户管理时刷新数据
  if (tabName === 'users' && userManagementRef.value) {
    userManagementRef.value.fetchUsers()
  }
}

// 监听标签页切换，当切换到用户管理时刷新数据
watch(activeTab, (newTab) => {
  // 标记标签页为已加载
  loadedTabs[newTab] = true;
  
  if (newTab === 'users' && userManagementRef.value) {
    userManagementRef.value.fetchUsers()
  }
})

// 初始化时标记用户管理标签为已加载
onMounted(() => {
  loadedTabs.users = true;
})
</script>

<style scoped>
.admin-page {
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

.admin-tabs {
  background: white;
  border-radius: var(--border-radius);
  padding: 24px;
}
</style>