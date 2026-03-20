<template>
  <div class="blog-write">
    <div class="write-header">
      <h1 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h1>
      <div class="header-actions">
        <button class="btn-save" @click="saveDraft">保存草稿</button>
        <button class="btn-publish" @click="publishArticle">发布文章</button>
      </div>
    </div>

    <div class="write-content">
      <div class="main-editor">
        <div class="title-input">
          <input 
            v-model="article.title" 
            type="text" 
            placeholder="请输入文章标题..."
            maxlength="100"
          />
          <span class="char-count">{{ article.title?.length || 0 }}/100</span>
        </div>

        <div class="summary-input">
          <textarea 
            v-model="article.summary" 
            placeholder="请输入文章摘要（可选）..."
            rows="3"
            maxlength="300"
          ></textarea>
          <span class="char-count">{{ article.summary?.length || 0 }}/300</span>
        </div>

        <div class="content-editor">
          <RichTextEditor
            v-model="article.content"
            :height="500"
            placeholder="开始写作..."
          />
        </div>
      </div>

      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">分类</h3>
          <select v-model="article.categoryId" class="select-input">
            <option :value="null">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.categoryName }}
            </option>
          </select>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">标签</h3>
          <div class="tag-selector">
            <span 
              v-for="tag in tags" 
              :key="tag.id"
              class="tag-option"
              :class="{ selected: selectedTagIds.includes(tag.id) }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.tagName }}
            </span>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">封面图片</h3>
          <div class="cover-upload">
            <input 
              v-model="article.coverImage" 
              type="text" 
              placeholder="输入图片URL..."
              class="input-field"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">关联题目</h3>
          <p class="section-desc">关联相关练习题，帮助读者巩固知识</p>
          <div class="subject-input">
            <input 
              v-model="subjectIdInput"
              type="text" 
              placeholder="输入题目ID..."
              class="input-field"
              @keyup.enter="addSubject"
            />
            <button class="btn-add" @click="addSubject">添加</button>
          </div>
          <div class="subject-list">
            <span 
              v-for="id in article.relatedSubjectIds" 
              :key="id" 
              class="subject-tag"
            >
              #{{ id }}
              <button class="remove-btn" @click="removeSubject(id)">×</button>
            </span>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">文章设置</h3>
          <label class="checkbox-label">
            <input type="checkbox" v-model="article.isTop" :true-value="1" :false-value="0" />
            <span>置顶文章</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="article.allowComment" :true-value="1" :false-value="0" />
            <span>允许评论</span>
          </label>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { blogApi } from '@/api/modules/blog'
import { ElMessage } from 'element-plus'
import RichTextEditor from '@/components/editor/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isEdit = computed(() => !!route.params.id)

const article = ref({
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  categoryId: null,
  tagIds: [],
  relatedSubjectIds: [],
  isTop: 0,
  allowComment: 1,
  status: 0
})

const categories = ref([])
const tags = ref([])
const selectedTagIds = ref([])
const subjectIdInput = ref('')

const toggleTag = (tagId) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index > -1) {
    selectedTagIds.value.splice(index, 1)
  } else {
    selectedTagIds.value.push(tagId)
  }
}

const addSubject = () => {
  const id = Number(subjectIdInput.value.trim())
  if (id && !article.value.relatedSubjectIds.includes(id)) {
    article.value.relatedSubjectIds.push(id)
  }
  subjectIdInput.value = ''
}

const removeSubject = (id) => {
  const index = article.value.relatedSubjectIds.indexOf(id)
  if (index > -1) {
    article.value.relatedSubjectIds.splice(index, 1)
  }
}

const saveDraft = async () => {
  if (!article.value.title) {
    ElMessage.warning('请输入文章标题')
    return
  }

  article.value.status = 0
  article.value.tagIds = selectedTagIds.value
  
  try {
    if (isEdit.value) {
      await blogApi.updateArticle(route.params.id, article.value)
    } else {
      await blogApi.addArticle(article.value)
    }
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const publishArticle = async () => {
  if (!article.value.title) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!article.value.content) {
    ElMessage.warning('请输入文章内容')
    return
  }

  article.value.status = 1
  article.value.tagIds = selectedTagIds.value
  article.value.authorId = userStore.userInfo?.id
  article.value.authorName = userStore.userName

  try {
    if (isEdit.value) {
      await blogApi.updateArticle(route.params.id, article.value)
      ElMessage.success('文章更新成功')
    } else {
      await blogApi.addArticle(article.value)
      ElMessage.success('文章发布成功')
    }
    router.push('/blog')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await blogApi.getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadTags = async () => {
  try {
    const res = await blogApi.getTagList()
    tags.value = res.data || []
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const loadArticle = async () => {
  if (!isEdit.value) return

  try {
    const res = await blogApi.getArticleDetail(route.params.id)
    const data = res.data
    article.value = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage,
      categoryId: data.categoryId,
      tagIds: data.tagIds || [],
      relatedSubjectIds: data.relatedSubjectIds || [],
      isTop: data.isTop,
      allowComment: data.allowComment,
      status: data.status
    }
    selectedTagIds.value = data.tagIds || []
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadTags()])
  await loadArticle()
})
</script>

<style scoped>
.blog-write {
  min-height: 100vh;
  background: var(--color-bg);
}

.write-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-save {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-save:hover {
  background: var(--color-bg-muted);
}

.btn-publish {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-publish:hover {
  opacity: 0.9;
}

.write-content {
  display: flex;
  gap: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.main-editor {
  flex: 1;
  min-width: 0;
}

.title-input {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.title-input input {
  width: 100%;
  padding: var(--spacing-md) 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  outline: none;
  transition: border-color var(--transition-fast);
}

.title-input input:focus {
  border-color: var(--color-accent);
}

.title-input input::placeholder {
  color: var(--color-text-muted);
}

.char-count {
  position: absolute;
  right: 0;
  bottom: var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.summary-input {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.summary-input textarea {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  resize: none;
  outline: none;
}

.summary-input textarea:focus {
  border-color: var(--color-accent);
}

.content-editor {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-section {
  padding: var(--spacing-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.section-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.select-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
}

.input-field {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
}

.input-field:focus {
  border-color: var(--color-accent);
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag-option {
  padding: 4px 10px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-option:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.tag-option.selected {
  background: var(--color-accent);
  color: white;
}

.subject-input {
  display: flex;
  gap: var(--spacing-xs);
}

.subject-input .input-field {
  flex: 1;
}

.btn-add {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-accent);
  background: var(--color-accent-light);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.subject-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: var(--text-xs);
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: var(--radius-sm);
}

.remove-btn {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-accent);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.remove-btn:hover {
  background: var(--color-accent);
  color: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

@media (max-width: 1024px) {
  .write-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
