<template>
  <div class="role-chat-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="role-chat-main">
      <AIToolHeader
        title="角色对话"
        badge="新入口"
        subtitle="选一个角色，直接进入更有场景感的对话。"
      />

      <section class="role-stage">
        <div class="role-stage__lead">
          <span class="role-stage__kicker">Role Workspace</span>
          <h2>让每场对话都从明确人设开始</h2>
          <p>选定角色，再补几项参数，就能把语气和场景调准。</p>

          <div class="role-stage__facts">
            <div class="fact-strip">
              <span>预设角色</span>
              <strong>{{ templates.length }}</strong>
            </div>
            <div class="fact-strip">
              <span>当前选择</span>
              <strong>{{ selectedTemplate?.roleName || '未选择' }}</strong>
            </div>
            <div class="fact-strip">
              <span>进入方式</span>
              <strong>创建后直达聊天</strong>
            </div>
          </div>
        </div>

        <aside class="role-stage__rail">
          <span class="role-stage__rail-label">当前角色说明</span>
          <strong>{{ selectedTemplate?.roleCategory || 'role' }}</strong>
          <p>{{ selectedTemplate?.roleDesc || '选择角色后，这里会显示角色简介。' }}</p>
          <button class="rail-link" type="button" @click="router.push('/ai/chatbot')">
            回到通用工作台
          </button>
        </aside>
      </section>

      <section class="role-layout">
        <div class="role-gallery">
          <div class="section-head">
            <div>
              <span class="section-kicker">Templates</span>
              <h3 class="section-title">系统角色</h3>
            </div>
            <span class="section-note">按角色切换</span>
          </div>

          <div v-if="templates.length" class="role-grid">
            <button
              v-for="template in templates"
              :key="template.id"
              class="role-card"
              :class="{ active: String(template.id) === String(selectedTemplateId) }"
              type="button"
              @click="handleTemplateSelect(template.id)"
            >
              <div class="role-card__head">
                <span class="role-card__avatar">{{ template.avatar || 'AI' }}</span>
                <span class="role-card__tag">{{ template.roleCategory || 'role' }}</span>
              </div>
              <strong class="role-card__title">{{ template.roleName }}</strong>
              <p class="role-card__desc">{{ template.roleDesc }}</p>
            </button>
          </div>

          <div v-else class="empty-card">
            <strong>暂无角色模板</strong>
            <p>请先初始化角色模板数据。</p>
          </div>
        </div>

        <aside class="role-config">
          <div class="section-head section-head--tight">
            <div>
              <span class="section-kicker">Compose</span>
              <h3 class="section-title">对话设定</h3>
            </div>
          </div>

          <div v-if="selectedTemplate" class="config-panel">
            <div class="config-hero">
              <div class="config-hero__avatar">{{ selectedTemplate.avatar || 'AI' }}</div>
              <div class="config-hero__copy">
                <strong>{{ selectedTemplate.roleName }}</strong>
                <span>{{ selectedTemplate.roleCategory || 'role chat' }}</span>
              </div>
            </div>

            <div class="config-block">
              <span class="config-label">角色简介</span>
              <p>{{ selectedTemplate.roleDesc }}</p>
            </div>

            <div class="config-block">
              <span class="config-label">开场预览</span>
              <p>{{ selectedTemplate.openingMessage || '创建后将直接进入角色会话。' }}</p>
            </div>

            <div v-if="schemaFields.length" class="config-form">
              <div v-for="field in schemaFields" :key="field.key" class="form-item">
                <label :for="field.key">
                  {{ field.label }}
                  <span v-if="field.required" class="required-mark">*</span>
                </label>

                <select
                  v-if="field.type === 'select'"
                  :id="field.key"
                  v-model="formValues[field.key]"
                  class="form-control"
                >
                  <option value="">请选择</option>
                  <option v-for="option in normalizeOptions(field.options)" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>

                <textarea
                  v-else-if="field.type === 'textarea'"
                  :id="field.key"
                  v-model="formValues[field.key]"
                  class="form-control form-control--textarea"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                />

                <input
                  v-else
                  :id="field.key"
                  v-model="formValues[field.key]"
                  class="form-control"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                />
              </div>
            </div>

            <div class="config-form">
              <div class="form-item">
                <label for="customPrompt">补充要求</label>
                <textarea
                  id="customPrompt"
                  v-model="customPrompt"
                  class="form-control form-control--textarea"
                  placeholder="例如：多问项目难点、语气更温柔、每轮追问更强一些。"
                />
              </div>
            </div>

            <div class="config-footer">
              <button class="secondary-btn" type="button" @click="resetForm">
                重置参数
              </button>
              <button class="primary-btn" type="button" :disabled="isCreating" @click="handleCreateSession">
                {{ isCreating ? '创建中...' : '进入角色对话' }}
              </button>
            </div>
          </div>

          <div v-else class="empty-card empty-card--compact">
            <strong>请选择一个角色</strong>
            <p>选定后即可填写参数并创建新的角色对话会话。</p>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import { createRoleSession, getRoleTemplateList } from '@/api/modules/ai/role'
import AIToolHeader from './components/AIToolHeader.vue'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const templates = ref([])
const selectedTemplateId = ref(null)
const formValues = ref({})
const customPrompt = ref('')
const isCreating = ref(false)

const selectedTemplate = computed(() => {
  return templates.value.find(item => String(item.id) === String(selectedTemplateId.value)) || null
})

const schemaFields = computed(() => {
  if (!selectedTemplate.value?.variableSchemaJson) {
    return []
  }

  try {
    const parsed = JSON.parse(selectedTemplate.value.variableSchemaJson)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('解析角色变量配置失败:', error)
    return []
  }
})

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) {
    return []
  }

  return options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }

    return {
      label: option.label || option.value || '',
      value: option.value || option.label || ''
    }
  })
}

const initializeFormByTemplate = (template) => {
  const nextValues = {}
  if (template?.variableSchemaJson) {
    try {
      const parsed = JSON.parse(template.variableSchemaJson)
      if (Array.isArray(parsed)) {
        parsed.forEach(field => {
          nextValues[field.key] = field.defaultValue || ''
        })
      }
    } catch (error) {
      console.error('初始化角色参数失败:', error)
    }
  }

  formValues.value = nextValues
  customPrompt.value = ''
}

const handleTemplateSelect = (templateId) => {
  selectedTemplateId.value = String(templateId)
  initializeFormByTemplate(selectedTemplate.value)
}

const resetForm = () => {
  initializeFormByTemplate(selectedTemplate.value)
}

const buildVariablesPayload = () => {
  const payload = {}
  schemaFields.value.forEach(field => {
    const rawValue = formValues.value[field.key]
    if (rawValue !== undefined && rawValue !== null && String(rawValue).trim()) {
      payload[field.key] = String(rawValue).trim()
    }
  })
  return payload
}

const handleCreateSession = async () => {
  if (!selectedTemplate.value || isCreating.value) {
    return
  }

  const missingField = schemaFields.value.find(field => field.required && !String(formValues.value[field.key] || '').trim())
  if (missingField) {
    ElMessage.warning(`请先填写${missingField.label}`)
    return
  }

  try {
    isCreating.value = true
    const response = await createRoleSession({
      roleTemplateId: selectedTemplate.value.id,
      variables: buildVariablesPayload(),
      customPrompt: customPrompt.value.trim()
    }, userStore.userInfo?.id)

    if (response.code !== 200 || !response.data?.sessionId) {
      throw new Error(response.message || '创建角色会话失败')
    }

    ElMessage.success('角色会话已创建')
    router.push({
      path: '/ai/chatbot',
      query: {
        sessionId: response.data.sessionId
      }
    })
  } catch (error) {
    console.error('创建角色会话失败:', error)
    ElMessage.error(error.message || '创建角色会话失败')
  } finally {
    isCreating.value = false
  }
}

const loadTemplates = async () => {
  try {
    const response = await getRoleTemplateList()
    if (response.code === 200 && Array.isArray(response.data)) {
      templates.value = response.data
      if (templates.value.length > 0) {
        selectedTemplateId.value = String(templates.value[0].id)
        initializeFormByTemplate(templates.value[0])
      }
      return
    }
    ElMessage.error(response.message || '加载角色模板失败')
  } catch (error) {
    console.error('加载角色模板失败:', error)
    ElMessage.error('加载角色模板失败')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.role-chat-page {
  --ai-accent: #1d4ed8;
  --ai-accent-soft: rgba(29, 78, 216, 0.08);
  --ai-accent-line: rgba(29, 78, 216, 0.16);
  --ai-surface: #ffffff;
  --ai-surface-alt: #f7f9fc;
  --ai-border: rgba(15, 23, 42, 0.1);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  min-height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(29, 78, 216, 0.08), transparent 28%),
    linear-gradient(180deg, #f6f8fb 0%, #eef2f7 100%);
}

.role-chat-page.is-dark {
  --ai-accent: #93c5fd;
  --ai-accent-soft: rgba(147, 197, 253, 0.14);
  --ai-accent-line: rgba(147, 197, 253, 0.22);
  --ai-surface: #0f172a;
  --ai-surface-alt: #111c31;
  --ai-border: rgba(148, 163, 184, 0.14);
  --ai-text: var(--text-1);
  --ai-text-soft: var(--text-2);
  --ai-text-faint: var(--text-3);
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 28%),
    linear-gradient(180deg, #08111d 0%, #0b1321 100%);
}

.role-chat-main {
  max-width: 1360px;
  margin: 0 auto;
  padding: 10px 16px 24px;
  display: grid;
  gap: 16px;
}

.role-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
  gap: 28px;
  padding: 22px 0 10px;
}

.role-stage__kicker,
.section-kicker,
.role-stage__rail-label,
.config-label,
.role-card__tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.role-stage__lead h2,
.section-title {
  margin: 14px 0 0;
  color: var(--ai-text);
  font-family: var(--font-display);
  letter-spacing: -0.04em;
}

.role-stage__lead h2 {
  max-width: 760px;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 0.98;
}

.role-stage__lead p,
.role-stage__rail p,
.role-card__desc,
.config-block p {
  color: var(--ai-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.role-stage__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 26px;
}

.fact-strip {
  padding-top: 14px;
  border-top: 1px solid var(--ai-border);
}

.fact-strip span {
  color: var(--ai-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.fact-strip strong,
.role-stage__rail strong {
  display: block;
  margin-top: 10px;
  color: var(--ai-text);
  font-size: 22px;
  line-height: 1.1;
}

.role-stage__rail {
  align-self: start;
  padding: 10px 0 0 22px;
  border-left: 1px solid var(--ai-border);
}

.rail-link,
.secondary-btn,
.primary-btn {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.rail-link,
.secondary-btn {
  margin-top: 18px;
  border: 1px solid var(--ai-border);
  background: transparent;
  color: var(--ai-text);
}

.primary-btn {
  border: 1px solid var(--ai-accent);
  background: var(--ai-accent);
  color: #ffffff;
}

.role-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
  gap: 22px;
  align-items: start;
}

.role-gallery,
.config-panel,
.empty-card {
  background: var(--ai-surface);
  border: 1px solid var(--ai-border);
}

.role-gallery {
  padding: 18px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.section-head--tight {
  margin-bottom: 14px;
}

.section-title {
  font-size: 30px;
  line-height: 1.02;
}

.section-note {
  color: var(--ai-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.role-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  text-align: left;
  border: 1px solid var(--ai-border);
  background: linear-gradient(180deg, var(--ai-surface), var(--ai-surface-alt));
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.role-card:hover {
  transform: translateY(-2px);
  border-color: var(--ai-accent-line);
}

.role-card.active {
  border-color: var(--ai-accent-line);
  background: linear-gradient(180deg, var(--ai-accent-soft), var(--ai-surface));
}

.role-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.role-card__avatar,
.config-hero__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 20px;
  font-weight: 700;
}

.role-card__title,
.config-hero__copy strong {
  color: var(--ai-text);
  font-size: 22px;
  line-height: 1.1;
}

.role-config {
  position: sticky;
  top: 10px;
}

.config-panel,
.empty-card {
  padding: 18px;
}

.empty-card {
  display: grid;
  gap: 8px;
}

.empty-card--compact {
  margin-top: 10px;
}

.empty-card strong {
  color: var(--ai-text);
  font-size: 18px;
}

.config-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ai-border);
}

.config-hero__copy {
  display: grid;
  gap: 4px;
}

.config-hero__copy span {
  color: var(--ai-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.config-block {
  padding: 16px 0 0;
}

.config-form {
  display: grid;
  gap: 14px;
  padding-top: 16px;
}

.form-item {
  display: grid;
  gap: 8px;
}

.form-item label {
  color: var(--ai-text);
  font-size: 13px;
  font-weight: 700;
}

.required-mark {
  color: #dc2626;
}

.form-control {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface-alt);
  color: var(--ai-text);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-control:focus {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 3px var(--ai-accent-soft);
}

.form-control--textarea {
  min-height: 104px;
  padding: 12px;
  resize: vertical;
}

.config-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid var(--ai-border);
  margin-top: 18px;
}

@media (max-width: 1080px) {
  .role-stage,
  .role-layout {
    grid-template-columns: 1fr;
  }

  .role-stage__rail {
    padding: 18px 0 0;
    border-left: none;
    border-top: 1px solid var(--ai-border);
  }

  .role-config {
    position: static;
  }
}

@media (max-width: 768px) {
  .role-chat-main {
    padding: 8px 10px 18px;
  }

  .role-stage__facts,
  .role-grid {
    grid-template-columns: 1fr;
  }

  .config-footer {
    flex-direction: column;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }
}
</style>
