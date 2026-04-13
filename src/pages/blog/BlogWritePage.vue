<template>
  <div class="blog-write">
    <div class="write-header">
      <div class="header-copy">
        <button class="header-back" type="button" @click="goBack()">{{ backLabel }}</button>
        <div class="page-title-row">
          <h1 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h1>
          <span class="page-status">{{ isEdit ? '编辑中' : '新文章' }}</span>
        </div>
      </div>

      <div class="header-actions">
        <div class="header-stats">
          <span>正文 {{ contentLength }} 字</span>
          <span>预计 {{ estimatedReadMinutes }} 分钟</span>
        </div>
        <button class="btn-save" @click="saveDraft">保存草稿</button>
        <button class="btn-publish" @click="publishArticle">发布文章</button>
      </div>
    </div>

    <div class="write-content">
      <div class="main-editor">
        <section class="editor-section editor-section--title">
          <div class="section-head">
            <h2 class="section-heading">标题</h2>
            <span class="char-count">{{ article.title?.length || 0 }}/100</span>
          </div>

          <div class="title-input">
            <input 
              v-model="article.title" 
              type="text" 
              placeholder="输入标题"
              maxlength="100"
            />
          </div>
        </section>

        <section class="editor-section editor-section--summary">
          <div class="section-head">
            <h2 class="section-heading">摘要</h2>
            <div class="section-actions">
              <button class="btn-helper" type="button" @click="generateSummary">从正文提取</button>
              <span class="char-count">{{ article.summary?.length || 0 }}/300</span>
            </div>
          </div>

          <div class="summary-input">
            <textarea 
              v-model="article.summary" 
              placeholder="输入摘要"
              rows="3"
              maxlength="300"
            ></textarea>
          </div>
        </section>

        <section class="editor-section editor-section--editor">
          <div class="section-head">
            <h2 class="section-heading">正文</h2>
          </div>

          <div class="content-editor">
            <RichTextEditor
              v-model="article.content"
              :height="720"
              placeholder="开始写正文"
            />
          </div>
        </section>
      </div>

      <aside class="sidebar">
        <div class="sidebar-section sidebar-section--overview">
          <h3 class="section-title">写作概览</h3>
          <div class="overview-grid">
            <div class="overview-item">
              <span>标题字数</span>
              <strong>{{ article.title?.length || 0 }}</strong>
            </div>
            <div class="overview-item">
              <span>正文长度</span>
              <strong>{{ contentLength }}</strong>
            </div>
            <div class="overview-item">
              <span>预计阅读</span>
              <strong>{{ estimatedReadMinutes }} 分钟</strong>
            </div>
            <div class="overview-item">
              <span>已选标签</span>
              <strong>{{ selectedTagIds.length }}</strong>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">分类</h3>
          <select
            ref="categorySelectRef"
            v-model="article.categoryId"
            class="select-input"
            @change="handleCategoryChange"
          >
            <option :value="null">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.categoryName }}
            </option>
          </select>
          <p v-if="publishValidation.categoryId" class="field-hint field-hint--error">{{ publishValidation.categoryId }}</p>
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
            <div v-if="article.coverImage" class="cover-preview">
              <img :src="article.coverImage" alt="封面预览" class="cover-preview-image" />
            </div>
            <div v-else class="cover-empty">
              <span>上传一张封面，列表展示会更完整</span>
            </div>
            <div class="cover-actions">
              <button class="btn-upload" type="button" @click="openCoverPicker" :disabled="coverUploading">
                {{ coverUploading ? '上传中...' : '上传本地图片' }}
              </button>
              <button
                v-if="article.coverImage"
                class="btn-link-action"
                type="button"
                @click="clearCoverImage"
                :disabled="coverUploading"
              >
                移除封面
              </button>
            </div>
            <input
              ref="coverInputRef"
              type="file"
              accept="image/*"
              class="cover-file-input"
              @change="handleCoverFileChange"
            />
            <input 
              v-model="article.coverImage" 
              type="text" 
              placeholder="也可以直接粘贴图片地址"
              class="input-field"
            />
            <p class="field-hint">支持 JPG、PNG、WebP。上传后会自动回填封面地址。</p>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">关联题目</h3>
          <div class="subject-input">
            <input 
              v-model="subjectIdInput"
              type="text" 
              placeholder="输入题目 ID"
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
          <h3 class="section-title">发布设置</h3>
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
import { fileApi } from '@/api/modules/file'
import { ElMessage } from 'element-plus'
import RichTextEditor from '@/components/editor/RichTextEditor.vue'
import { useSmartBack } from '@/composables/useSmartBack'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isEdit = computed(() => !!route.params.id)
const editFallback = computed(() => (isEdit.value ? `/blog/article/${route.params.id}` : '/blog'))
const { backLabel, goBack } = useSmartBack(route, router, { fallback: editFallback.value })

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
const coverInputRef = ref(null)
const categorySelectRef = ref(null)
const coverUploading = ref(false)
const publishValidation = ref({
  categoryId: ''
})

const plainContent = computed(() => {
  return String(article.value.content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
})

const contentLength = computed(() => plainContent.value.length)
const estimatedReadMinutes = computed(() => {
  if (!plainContent.value) {
    return 0
  }
  return Math.max(1, Math.ceil(plainContent.value.length / 450))
})

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

const generateSummary = () => {
  if (!plainContent.value) {
    ElMessage.warning('正文还没有内容，暂时无法提取摘要')
    return
  }
  article.value.summary = plainContent.value.slice(0, 140)
  ElMessage.success('已根据正文提取摘要，可继续手动调整')
}

const openCoverPicker = () => {
  if (coverUploading.value) return
  coverInputRef.value?.click()
}

const clearCoverImage = () => {
  article.value.coverImage = ''
  if (coverInputRef.value) {
    coverInputRef.value.value = ''
  }
}

const handleCoverFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type?.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    event.target.value = ''
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('封面图片大小不能超过 5MB')
    event.target.value = ''
    return
  }

  coverUploading.value = true
  try {
    const response = await fileApi.uploadImage(file, 'blog-cover')
    const filePath = response?.data?.filePath
    if (!filePath) {
      throw new Error(response?.message || '未获取到图片地址')
    }
    article.value.coverImage = filePath
    ElMessage.success('封面上传成功')
  } catch (error) {
    console.error('封面上传失败:', error)
    const message = error?.response?.data?.message || error?.message || '封面上传失败'
    ElMessage.error(message)
  } finally {
    coverUploading.value = false
    event.target.value = ''
  }
}

const validatePublishArticle = () => {
  publishValidation.value.categoryId = ''

  if (!article.value.categoryId) {
    publishValidation.value.categoryId = '发布前请选择文章分类'
    categorySelectRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
    categorySelectRef.value?.focus()
    ElMessage.warning('发布前请选择文章分类')
    return false
  }

  return true
}

const handleCategoryChange = () => {
  if (article.value.categoryId) {
    publishValidation.value.categoryId = ''
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
    const message = error?.response?.data?.message || error?.message || '保存失败'
    ElMessage.error(message)
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
  if (!validatePublishArticle()) {
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
      router.push({
        path: `/blog/article/${route.params.id}`,
        query: {
          back: route.query.back || '/blog'
        }
      })
    } else {
      await blogApi.addArticle(article.value)
      ElMessage.success('文章发布成功')
      router.push('/blog')
    }
  } catch (error) {
    console.error('发布失败:', error)
    const message = error?.response?.data?.message || error?.message || '发布失败'
    ElMessage.error(message)
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
    const message = error?.response?.data?.message || error?.message || '加载文章失败'
    ElMessage.error(message)
    router.push('/blog')
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
  background:
    radial-gradient(circle at top left, rgba(23, 78, 166, 0.06), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.24), transparent 18%),
    var(--app-bg);
}

.write-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 18px 32px;
  background: var(--internal-panel-bg);
  border-bottom: 1px solid var(--internal-panel-border);
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
}

.header-copy {
  min-width: 0;
}

.header-back {
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.header-back:hover {
  color: var(--color-accent);
}

.page-title-row,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title-row {
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(28px, 2.8vw, 38px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--text-1);
}

.page-status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: 999px;
  background: var(--internal-panel-bg-alt);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 700;
}

.overview-item span {
  color: var(--text-2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-stats span {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: 999px;
  background: var(--internal-panel-bg-alt);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 700;
}

.btn-save {
  min-height: 42px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-2);
  background: var(--internal-panel-bg-alt);
  border: 1px solid var(--internal-panel-border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
}

.btn-save:hover {
  border-color: var(--internal-panel-border-strong);
  background: var(--internal-panel-bg-hover);
}

.btn-publish {
  min-height: 42px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.btn-publish:hover {
  transform: translateY(-1px);
  opacity: 0.94;
}

.write-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  max-width: 1500px;
  margin: 0 auto;
  padding: 28px;
}

.main-editor {
  min-width: 0;
  display: grid;
  gap: 20px;
}

.editor-section {
  padding: 24px;
  background: var(--internal-panel-bg);
  border: 1px solid var(--internal-panel-border);
  border-radius: 14px;
  box-shadow: var(--internal-panel-shadow);
}

.editor-section--editor {
  padding-bottom: 18px;
}

.section-heading {
  margin: 0;
  color: var(--text-1);
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-input {
  position: relative;
  margin-top: 18px;
}

.title-input input {
  width: 100%;
  padding: 0;
  font-size: clamp(30px, 3vw, 46px);
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -0.05em;
  color: var(--text-1);
  background: transparent;
  border: none;
  outline: none;
}

.title-input input::placeholder {
  color: var(--text-3);
}

.char-count {
  color: var(--text-3);
  font-size: 12px;
  font-weight: 700;
}

.summary-input {
  position: relative;
  margin-top: 18px;
}

.summary-input textarea {
  width: 100%;
  min-height: 108px;
  padding: 16px 18px;
  font-size: 15px;
  color: var(--text-1);
  background: var(--internal-panel-bg-alt);
  border: 1px solid var(--internal-panel-border);
  border-radius: 12px;
  resize: none;
  outline: none;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.summary-input textarea:focus {
  border-color: var(--color-accent);
  background: var(--internal-panel-bg);
}

.content-editor {
  margin-top: 18px;
  background: var(--internal-panel-bg);
  border: 1px solid var(--internal-panel-border);
  border-radius: 14px;
  overflow: hidden;
}

.btn-helper {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: 999px;
  background: var(--internal-panel-bg-alt);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.sidebar {
  position: sticky;
  top: 96px;
  align-self: start;
}

.sidebar-section {
  padding: 18px;
  background: var(--internal-panel-bg);
  border: 1px solid var(--internal-panel-border);
  border-radius: 14px;
  margin-bottom: 14px;
  box-shadow: var(--internal-panel-shadow);
}

.sidebar-section--overview {
  padding-bottom: 14px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.overview-item {
  padding: 12px;
  border-radius: 12px;
  background: var(--internal-panel-bg-alt);
  border: 1px solid var(--internal-panel-border);
}

.overview-item span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.overview-item strong {
  color: var(--text-1);
  font-size: 20px;
  line-height: 1.1;
}

.section-title {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
}

.select-input {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  font-size: 14px;
  color: var(--text-1);
  background: var(--internal-panel-bg-alt);
  border: 1px solid var(--internal-panel-border);
  border-radius: 10px;
  outline: none;
}

.input-field {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  font-size: 14px;
  color: var(--text-1);
  background: var(--internal-panel-bg-alt);
  border: 1px solid var(--internal-panel-border);
  border-radius: 10px;
  outline: none;
}

.input-field:focus {
  border-color: var(--color-accent);
}

.field-hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-3);
}

.field-hint--error {
  color: #dc2626;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 7px 12px;
  font-size: 13px;
  color: var(--text-2);
  background: var(--internal-panel-bg-alt);
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-option:hover {
  border-color: var(--internal-panel-border);
  background: var(--internal-panel-bg-hover);
  color: var(--color-accent);
}

.tag-option.selected {
  border-color: var(--color-accent-subtle);
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.cover-upload {
  display: grid;
  gap: 12px;
}

.cover-preview,
.cover-empty {
  border: 1px dashed var(--internal-panel-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--internal-panel-bg-alt);
}

.cover-preview {
  aspect-ratio: 16 / 9;
}

.cover-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-empty {
  min-height: 152px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
  line-height: 1.6;
}

.cover-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-upload,
.btn-link-action {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.btn-upload {
  border: none;
  background: var(--color-accent);
  color: #fff;
}

.btn-upload:disabled,
.btn-link-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-link-action {
  border: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
  color: var(--text-2);
}

.cover-file-input {
  display: none;
}

.subject-input {
  display: flex;
  gap: 8px;
}

.subject-input .input-field {
  flex: 1;
}

.btn-add {
  min-width: 72px;
  min-height: 42px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.subject-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: 999px;
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
  gap: 10px;
  font-size: 14px;
  color: var(--text-2);
  cursor: pointer;
  margin-bottom: 10px;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

@media (max-width: 1024px) {
  .write-header,
  .write-content {
    flex-direction: column;
  }

  .write-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .write-header {
    padding: 16px;
  }

  .write-content {
    padding: 16px;
  }

  .editor-section,
  .sidebar-section {
    padding: 16px;
  }

  .page-title {
    font-size: 30px;
  }

  .page-title-row,
  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions,
  .header-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .btn-save,
  .btn-publish {
    flex: 1;
  }

  .overview-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
