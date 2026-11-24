<template>
  <div class="ai-zone app-shell app-shell--internal">
    <main class="ai-zone__main role-chat-main">
      <AIToolHeader />

      <section class="ai-workbench role-workbench" aria-label="角色对话设置">
        <aside class="role-library" aria-labelledby="role-library-title">
          <header class="role-library__heading">
            <h1 id="role-library-title">选择角色</h1>
            <p>选一个角色，再设置这次对话的目标。</p>
          </header>

          <fieldset v-if="templates.length" class="role-list" aria-label="可用角色" :disabled="isCreating">
            <label v-for="template in templates" :key="template.id" class="role-choice">
              <input
                type="radio"
                name="role-template"
                :value="String(template.id)"
                :checked="String(template.id) === selectedTemplateId"
                @change="selectTemplate(template)"
              >
              <span class="role-choice__face">
                <span class="role-avatar" aria-hidden="true">{{ roleMonogram(template) }}</span>
                <span class="role-choice__copy">
                  <strong>{{ template.roleName }}</strong>
                  <span v-if="template.roleCategory">{{ categoryName(template.roleCategory) }}</span>
                </span>
                <el-icon class="role-choice__check" aria-hidden="true"><Check /></el-icon>
              </span>
            </label>
          </fieldset>

          <p v-else-if="isLoadingTemplates" class="role-library__status" role="status">正在加载角色…</p>
          <div v-else-if="templateError" class="role-library__status">
            <p role="alert">{{ templateError }}</p>
            <button class="ai-workbench__button" type="button" @click="loadTemplates">重新加载</button>
          </div>
          <p v-else class="role-library__status">暂时没有可用角色。</p>
        </aside>

        <form v-if="selectedTemplate" class="role-form" aria-labelledby="role-title" @submit.prevent="handleCreateSession">
          <div class="role-form__scroll">
            <div class="role-form__column">
              <header class="role-identity">
                <span class="role-avatar role-avatar--large" aria-hidden="true">{{ roleMonogram(selectedTemplate) }}</span>
                <div>
                  <h2 id="role-title">{{ selectedTemplate.roleName }}</h2>
                  <p v-if="selectedTemplate.roleDesc">{{ selectedTemplate.roleDesc }}</p>
                </div>
              </header>

              <section v-if="selectedTemplate.openingMessage" class="role-opening" aria-labelledby="role-opening-title">
                <h3 id="role-opening-title">开场预览</h3>
                <blockquote>{{ selectedTemplate.openingMessage }}</blockquote>
              </section>

              <fieldset class="role-settings" :disabled="isCreating">
                <legend>对话设定</legend>
                <div class="role-fields">
                  <div
                    v-for="field in schemaFields"
                    :key="field.key"
                    class="role-field"
                    :class="{ 'role-field--wide': field.type === 'textarea' }"
                  >
                    <label :for="`role-field-${field.key}`">
                      {{ field.label || field.key }}
                      <span v-if="field.required" class="role-field__required" aria-hidden="true">*</span>
                    </label>
                    <select
                      v-if="field.type === 'select'"
                      :id="`role-field-${field.key}`"
                      v-model="formValues[field.key]"
                      class="ai-workbench__control"
                      :required="Boolean(field.required)"
                    >
                      <option value="">请选择</option>
                      <option v-for="option in normalizeOptions(field.options)" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <textarea
                      v-else-if="field.type === 'textarea'"
                      :id="`role-field-${field.key}`"
                      v-model="formValues[field.key]"
                      class="ai-workbench__control"
                      :placeholder="field.placeholder"
                      :required="Boolean(field.required)"
                      rows="2"
                    ></textarea>
                    <input
                      v-else
                      :id="`role-field-${field.key}`"
                      v-model="formValues[field.key]"
                      class="ai-workbench__control"
                      :type="field.type === 'number' ? 'number' : 'text'"
                      :placeholder="field.placeholder"
                      :required="Boolean(field.required)"
                    >
                  </div>

                  <div class="role-field role-field--wide">
                    <label for="role-custom-prompt">补充要求 <span>可选</span></label>
                    <textarea
                      id="role-custom-prompt"
                      v-model="customPrompt"
                      class="ai-workbench__control"
                      rows="2"
                      placeholder="例如：多问项目难点，回答后再点评。"
                    ></textarea>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <footer class="role-form__footer">
            <div class="role-form__column role-form__actions">
              <p v-if="createError" class="role-form__error" role="alert">{{ createError }}</p>
              <button class="ai-workbench__button" type="button" :disabled="isCreating" @click="resetForm">恢复默认</button>
              <button class="ai-workbench__button ai-workbench__button--primary" type="submit" :disabled="isCreating">
                {{ isCreating ? '正在创建…' : '进入角色对话' }}
                <el-icon aria-hidden="true"><ArrowRight /></el-icon>
              </button>
            </div>
          </footer>
        </form>

        <div v-else class="role-form__empty">
          <el-icon aria-hidden="true"><ChatLineRound /></el-icon>
          <h2>设置角色对话</h2>
          <p>选定角色后，这里会显示开场白和可填写的设定。</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, ChatLineRound, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { createRoleSession, getRoleTemplateList } from '@/api/modules/ai/role'
import AIToolHeader from './components/AIToolHeader.vue'

const router = useRouter()
const userStore = useUserStore()

const templates = ref([])
const selectedTemplateId = ref('')
const formValues = ref({})
const customPrompt = ref('')
const isLoadingTemplates = ref(true)
const templateError = ref('')
const isCreating = ref(false)
const createError = ref('')

const categories = new Map([
  ['interview', '模拟面试'],
  ['mentor', '技术辅导'],
  ['coach', '学习督导'],
  ['companion', '日常陪伴'],
  ['language', '语言练习']
])

const categoryName = category => categories.get(category) || category
const roleMonogram = template => template.avatar || template.roleName?.slice(0, 1) || '角色'

const selectedTemplate = computed(() => {
  return templates.value.find(template => String(template.id) === selectedTemplateId.value) || null
})

const schemaFields = computed(() => {
  const schema = selectedTemplate.value?.variableSchemaJson
  if (!schema) return []

  try {
    const fields = typeof schema === 'string' ? JSON.parse(schema) : schema
    if (!Array.isArray(fields)) return []
    return fields.filter(field => field && typeof field.key === 'string' && field.key.trim())
  } catch (error) {
    console.error('解析角色变量配置失败:', error)
    return []
  }
})

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return []

  return options.filter(option => option != null).map(option => {
    if (typeof option !== 'object') return { label: String(option), value: String(option) }
    return { label: option.label ?? option.value ?? '', value: option.value ?? option.label ?? '' }
  })
}

const resetForm = () => {
  const defaults = Object.create(null)
  for (const field of schemaFields.value) {
    defaults[field.key] = field.defaultValue ?? ''
  }
  formValues.value = defaults
  customPrompt.value = ''
  createError.value = ''
}

const selectTemplate = (template) => {
  if (isCreating.value) return
  selectedTemplateId.value = String(template.id)
  resetForm()
}

const buildVariablesPayload = () => {
  const values = Object.create(null)
  for (const field of schemaFields.value) {
    const value = String(formValues.value[field.key] ?? '').trim()
    if (value) values[field.key] = value
  }
  return values
}

const handleCreateSession = async () => {
  if (!selectedTemplate.value || isCreating.value) return

  const variables = buildVariablesPayload()
  const missing = schemaFields.value.find(field => field.required && !variables[field.key])
  if (missing) {
    createError.value = `请填写${missing.label || missing.key}。`
    return
  }

  createError.value = ''
  isCreating.value = true
  try {
    const response = await createRoleSession({
      roleTemplateId: selectedTemplate.value.id,
      variables,
      customPrompt: customPrompt.value.trim()
    }, userStore.userInfo?.id)

    if (response.success === false || response.code !== 200 || !response.data?.sessionId) {
      throw new Error(response.message || '暂时无法创建角色对话，请重试。')
    }

    if (router.currentRoute.value.name === 'RoleChat') {
      await router.push({ path: '/ai/chatbot', query: { sessionId: response.data.sessionId } })
    }
  } catch (error) {
    createError.value = error.message || '暂时无法创建角色对话，请重试。'
  } finally {
    isCreating.value = false
  }
}

const loadTemplates = async () => {
  isLoadingTemplates.value = true
  templateError.value = ''
  try {
    const response = await getRoleTemplateList()
    if (response.success === false || response.code !== 200 || !Array.isArray(response.data)) {
      throw new Error(response.message || '未能加载角色。')
    }
    templates.value = response.data
    if (templates.value.length) selectTemplate(templates.value[0])
  } catch (error) {
    templateError.value = error.message || '未能加载角色。'
  } finally {
    isLoadingTemplates.value = false
  }
}

onMounted(loadTemplates)
</script>

<style scoped>
.role-workbench {
  grid-template-columns: 280px minmax(0, 1fr);
}

.role-library {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  border-right: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.role-library__heading {
  padding: 22px 18px 14px;
}

.role-library__heading h1 {
  margin: 0 0 4px;
  font-size: 21px;
  line-height: 1.35;
}

.role-library__heading p,
.role-library__status {
  color: var(--text-2);
  font-size: 13px;
}

.role-library__status {
  padding: 6px 18px 18px;
}

.role-library__status button {
  margin-top: 8px;
}

.role-list {
  min-width: 0;
  min-height: 0;
  padding: 4px 12px 14px;
  overflow: auto;
  border: 0;
  scrollbar-width: thin;
}

.role-choice {
  position: relative;
  display: block;
}

.role-choice + .role-choice {
  margin-top: 6px;
}

.role-choice input {
  position: absolute;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
}

.role-choice__face {
  display: flex;
  align-items: center;
  min-height: 58px;
  gap: 10px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.role-choice input:not(:disabled) + .role-choice__face:hover {
  background: var(--internal-panel-bg-hover);
}

.role-choice input:checked + .role-choice__face,
.role-choice input:checked + .role-choice__face:hover {
  border-color: var(--color-accent-subtle);
  background: var(--color-accent-light);
}

.role-choice input:focus-visible + .role-choice__face {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.role-choice input:disabled + .role-choice__face {
  cursor: default;
  opacity: 0.65;
}

.role-avatar {
  display: grid;
  flex: none;
  width: 38px;
  height: 38px;
  place-items: center;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}

.role-avatar--large {
  width: 54px;
  height: 54px;
  background: var(--color-accent-light);
  font-size: 15px;
}

.role-choice__copy {
  flex: 1;
  min-width: 0;
}

.role-choice__copy strong,
.role-choice__copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-choice__copy strong {
  font-size: 14px;
}

.role-choice__copy span {
  color: var(--text-2);
  font-size: 12px;
}

.role-choice__check {
  visibility: hidden;
  color: var(--color-accent);
}

.role-choice input:checked + .role-choice__face .role-choice__check {
  visibility: visible;
}

.role-form {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 0;
}

.role-form__scroll {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.role-form__column {
  width: 100%;
  max-width: 820px;
  margin-inline: auto;
  padding: var(--workbench-padding);
}

.role-identity {
  display: flex;
  align-items: start;
  gap: 14px;
  overflow-wrap: anywhere;
}

.role-identity h2 {
  margin: 0 0 5px;
  font-size: clamp(22px, 2.3vw, 28px);
  line-height: 1.3;
}

.role-identity p {
  color: var(--text-2);
  font-size: 14px;
}

.role-opening {
  margin: 22px 0 24px;
  padding: 12px 16px;
  border-left: 3px solid var(--color-accent-subtle);
  background: var(--internal-panel-bg-alt);
}

.role-opening h3 {
  margin: 0 0 4px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 650;
}

.role-opening blockquote {
  margin: 0;
  font-size: 14px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.role-settings {
  min-width: 0;
  margin-top: 20px;
  border: 0;
}

.role-settings legend {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
}

.role-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.role-field {
  display: grid;
  align-content: start;
  gap: 4px;
  min-width: 0;
}

.role-field--wide {
  grid-column: 1 / -1;
}

.role-field label {
  font-size: 13px;
  font-weight: 650;
}

.role-field label span {
  margin-left: 4px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
}

.role-field label .role-field__required,
.role-form__error {
  color: var(--color-error);
}

.role-field textarea {
  min-height: 62px;
  resize: vertical;
}

.role-form__footer {
  border-top: 1px solid var(--internal-panel-border);
}

.role-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-block: 12px;
}

.role-form__error {
  flex: 1 1 100%;
  font-size: 13px;
  text-align: right;
  overflow-wrap: anywhere;
}

.role-form__empty {
  align-self: center;
  padding: var(--workbench-padding);
  color: var(--text-2);
  text-align: center;
}

.role-form__empty .el-icon {
  color: var(--color-accent);
  font-size: 26px;
}

.role-form__empty h2 {
  margin: 6px 0;
  color: var(--text-1);
  font-size: 18px;
}

.role-form__empty p {
  font-size: 13px;
}

@media (max-width: 860px) {
  .role-chat-main {
    height: auto;
    min-height: 100dvh;
  }

  .role-workbench {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .role-library {
    border-right: 0;
    border-bottom: 1px solid var(--internal-panel-border);
  }

  .role-library__heading {
    padding: 14px 14px 8px;
  }

  .role-list {
    display: flex;
    gap: 6px;
    padding: 4px 12px 10px;
  }

  .role-choice {
    flex: 0 0 clamp(142px, 35vw, 190px);
  }

  .role-choice + .role-choice {
    margin-top: 0;
  }

  .role-form__scroll {
    overflow: visible;
  }
}

@media (max-width: 500px) {
  .role-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
