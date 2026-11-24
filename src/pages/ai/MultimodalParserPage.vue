<template>
  <div class="ai-zone app-shell app-shell--internal">
    <main class="ai-zone__main multimodal-main">
      <AIToolHeader />

      <section class="ai-workbench visual-workbench" aria-label="多模态解析">
        <section class="visual-input" aria-labelledby="visual-input-title">
          <header class="visual-heading">
            <div>
              <h1 id="visual-input-title">原图预览</h1>
              <p>添加本地图片，或载入一张示例。</p>
            </div>
          </header>

          <div class="visual-input__body">
            <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect">
            <div
              class="visual-canvas"
              :class="{ 'is-dragging': isDragging, 'has-image': selectedImage }"
              @dragover.prevent="isDragging = true"
              @dragleave="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <img
                v-if="selectedImage"
                :key="selectedImage.url"
                class="visual-image"
                :src="selectedImage.url"
                :alt="selectedImage.example ? `示例：${selectedImage.example.label}` : `本地图片预览：${selectedImage.file.name}`"
                @error="handlePreviewError"
              >
              <button v-else class="visual-upload" type="button" @click="openFilePicker">
                <el-icon aria-hidden="true"><UploadFilled /></el-icon>
                <strong>选择图片</strong>
                <span>也可拖到这里，最大 10 MB</span>
              </button>
            </div>

            <div v-if="selectedImage" class="visual-file">
              <div class="visual-file__name">
                <strong :title="imageName">{{ imageName }}</strong>
                <span v-if="selectedImage.example">示例图片</span>
                <span v-else>本地预览 · {{ formatFileSize(selectedImage.file.size) }}</span>
              </div>
              <div class="visual-actions">
                <button class="ai-workbench__button" type="button" @click="openFilePicker">更换图片</button>
                <button class="ai-workbench__button" type="button" @click="removeImage">移除</button>
              </div>
            </div>
            <p v-if="fileError" class="visual-file-error" role="alert">{{ fileError }}</p>

            <section class="visual-examples" aria-labelledby="visual-example-title">
              <h2 id="visual-example-title">试用示例</h2>
              <div class="visual-actions">
                <button
                  v-for="example in imageExamples"
                  :key="example.mode"
                  class="ai-workbench__button"
                  type="button"
                  :aria-pressed="selectedImage?.example === example"
                  @click="loadExample(example)"
                >
                  {{ example.label }}
                </button>
              </div>
            </section>
          </div>
        </section>

        <section class="visual-analysis" aria-labelledby="visual-settings-title">
          <header class="visual-heading">
            <div>
              <h2 id="visual-settings-title">解析设置</h2>
              <p id="visual-explanation">当前仅演示：图片不上传，结果不读取原图。</p>
            </div>
            <span class="visual-mode-label">演示模式</span>
          </header>

          <div class="visual-settings">
            <fieldset class="visual-modes">
              <legend>解析方式</legend>
              <div class="visual-actions">
                <label v-for="mode in analysisModes" :key="mode.id" class="visual-mode">
                  <input v-model="selectedMode" type="radio" name="analysis-mode" :value="mode.id">
                  <span>{{ mode.label }}</span>
                </label>
              </div>
            </fieldset>

            <details class="visual-prompt">
              <summary>补充要求 <span>演示不使用此内容</span></summary>
              <textarea
                v-model="customPrompt"
                class="ai-workbench__control"
                rows="2"
                aria-label="补充要求（不参与演示）"
                placeholder="例如：按题干、选项、解析的顺序整理。"
              ></textarea>
            </details>

            <button
              class="ai-workbench__button ai-workbench__button--primary"
              type="button"
              :disabled="!selectedImage"
              aria-describedby="visual-explanation"
              @click="showExampleResult"
            >
              查看演示结果
              <el-icon aria-hidden="true"><ArrowRight /></el-icon>
            </button>
          </div>

          <section ref="resultSection" class="visual-output" aria-labelledby="visual-result-title">
            <header class="visual-output__heading">
              <h3 id="visual-result-title" ref="resultHeading" tabindex="-1">演示结果</h3>
              <div v-if="analysisResult" class="visual-actions">
                <button class="ai-workbench__button" type="button" @click="copyResult">复制结果</button>
                <button class="ai-workbench__button" type="button" @click="clearResult">清空</button>
              </div>
            </header>
            <div class="visual-output__body">
              <div v-if="analysisResult" class="visual-result ai-markdown" v-html="renderAiMarkdown(analysisResult)"></div>
              <p v-else>{{ selectedImage ? '选择一种解析方式，再查看该方式的固定示例。' : '添加图片或载入示例后，可以查看演示结果。' }}</p>
            </div>
          </section>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { ArrowRight, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import { createExampleImageUrl, getExampleOutput, imageExamples } from './multimodalExamples'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const fileInput = ref(null)
const resultSection = ref(null)
const resultHeading = ref(null)
const selectedImage = shallowRef(null)
const isDragging = ref(false)
const fileError = ref('')
const analysisResult = ref('')
const customPrompt = ref('')
const selectedMode = ref('general')

const analysisModes = [
  { id: 'general', label: '通用识别' },
  { id: 'ocr', label: '文字提取' },
  { id: 'question', label: '题目解析' },
  { id: 'code', label: '代码识别' }
]

const imageName = computed(() => selectedImage.value?.file?.name || selectedImage.value?.example?.label || '')
const openFilePicker = () => fileInput.value?.click()
const clearResult = () => { analysisResult.value = '' }

const replaceImage = (image) => {
  if (selectedImage.value?.file) URL.revokeObjectURL(selectedImage.value.url)
  selectedImage.value = image
  fileError.value = ''
  clearResult()
}

const processFile = (file) => {
  if (!file.type.startsWith('image/')) {
    fileError.value = '请选择图片文件。'
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    fileError.value = '图片超过 10 MB，请换一张较小的图片。'
    return
  }
  replaceImage({ file, url: URL.createObjectURL(file) })
}

const handleFileSelect = (event) => {
  const input = event.target
  if (input.files.length) processFile(input.files[0])
  input.value = ''
}

const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) isDragging.value = false
}

const handleDrop = (event) => {
  isDragging.value = false
  const [file] = event.dataTransfer.files
  if (file) processFile(file)
}

const removeImage = () => replaceImage(null)

const handlePreviewError = () => {
  removeImage()
  fileError.value = '无法预览这张图片，请换一张。'
}

const loadExample = (example) => {
  replaceImage({ example, url: createExampleImageUrl(example) })
  selectedMode.value = example.mode
}

const showExampleResult = async () => {
  if (!selectedImage.value) return
  analysisResult.value = getExampleOutput(selectedMode.value)
  await nextTick()
  resultHeading.value?.focus({ preventScroll: true })
  resultSection.value?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}

const copyResult = async () => {
  if (!analysisResult.value) return
  try {
    await navigator.clipboard.writeText(analysisResult.value)
    ElMessage.success('已复制演示结果')
  } catch {
    ElMessage.error('复制失败，可手动选中结果复制。')
  }
}

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

watch(selectedMode, clearResult)
onUnmounted(removeImage)
</script>

<style scoped>
.visual-workbench {
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
}

.visual-input,
.visual-analysis {
  display: grid;
  min-width: 0;
  min-height: 0;
}

.visual-input {
  grid-template-rows: auto minmax(0, 1fr);
  border-right: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.visual-analysis {
  grid-template-rows: auto auto minmax(0, 1fr);
}

.visual-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 18px var(--workbench-padding) 14px;
  border-bottom: 1px solid var(--internal-panel-border);
}

.visual-heading h1,
.visual-heading h2 {
  margin: 0 0 4px;
  font-size: 21px;
  line-height: 1.35;
}

.visual-heading p {
  color: var(--text-2);
  font-size: 13px;
}

.visual-mode-label {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--color-accent-subtle);
  border-radius: var(--radius-sm);
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 650;
}

.visual-input__body {
  min-height: 0;
  padding: var(--workbench-padding);
  overflow: auto;
  scrollbar-width: thin;
}

.visual-canvas {
  display: grid;
  min-height: 210px;
  height: min(44dvh, 430px);
  padding: 12px;
  place-items: center;
  border: 1px dashed var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg);
}

.visual-canvas.has-image {
  border-style: solid;
  background: var(--internal-panel-bg-hover);
}

.visual-canvas.is-dragging,
.visual-canvas:has(.visual-upload:hover) {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.visual-upload {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border-radius: var(--radius-sm);
  color: var(--text-1);
}

.visual-upload .el-icon {
  margin-bottom: 6px;
  color: var(--color-accent);
  font-size: 32px;
}

.visual-upload strong {
  font-size: 16px;
}

.visual-upload span,
.visual-file__name span {
  color: var(--text-2);
  font-size: 13px;
}

.visual-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
}

.visual-file {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.visual-file__name {
  display: grid;
  flex: 1 1 120px;
  min-width: 0;
}

.visual-file__name strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.visual-file-error {
  margin-top: 8px;
  color: var(--color-error);
  font-size: 13px;
}

.visual-examples {
  margin-top: 18px;
}

.visual-examples h2,
.visual-modes legend {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
}

.visual-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.visual-examples button[aria-pressed='true'] {
  border-color: var(--color-accent-subtle);
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.visual-settings {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 14px var(--workbench-padding);
}

.visual-modes {
  min-width: 0;
  border: 0;
}

.visual-mode {
  position: relative;
}

.visual-mode input {
  position: absolute;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
}

.visual-mode span {
  display: block;
  padding: 7px 9px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
  color: var(--text-1);
  font-size: 13px;
  cursor: pointer;
}

.visual-mode span:hover {
  background: var(--internal-panel-bg-hover);
}

.visual-mode input:checked + span {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 650;
}

.visual-mode input:focus-visible + span {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.visual-prompt {
  width: 100%;
  min-width: 0;
  font-size: 13px;
}

.visual-prompt summary {
  width: fit-content;
  min-height: 32px;
  padding: 5px 2px;
  cursor: pointer;
}

.visual-prompt summary span {
  margin-left: 4px;
  color: var(--text-2);
  font-size: 12px;
}

.visual-prompt textarea {
  max-height: 110px;
  margin-top: 6px;
  resize: vertical;
}

.visual-output {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  border-top: 1px solid var(--internal-panel-border);
}

.visual-output__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 8px;
  min-height: 56px;
  padding: 8px var(--workbench-padding);
  background: var(--internal-panel-bg-alt);
}

.visual-output__heading h3 {
  font-size: 16px;
}

.visual-output__body {
  min-width: 0;
  min-height: 0;
  padding: 14px var(--workbench-padding) 24px;
  overflow: auto;
  scrollbar-width: thin;
  overflow-wrap: anywhere;
}

.visual-output__body > p {
  color: var(--text-2);
  font-size: 14px;
}

.visual-result {
  font-size: 14px;
  line-height: 1.75;
}

@media (max-width: 860px) {
  .multimodal-main {
    height: auto;
    min-height: 100dvh;
  }

  .visual-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .visual-input {
    border-right: 0;
    border-bottom: 1px solid var(--internal-panel-border);
  }

  .visual-input__body,
  .visual-output__body {
    overflow: visible;
  }

  .visual-canvas {
    height: min(30dvh, 290px);
    min-height: 180px;
  }
}
</style>
