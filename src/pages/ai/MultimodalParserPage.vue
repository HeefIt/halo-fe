<template>
  <div class="multimodal-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="multimodal-main">
      <AIToolHeader
        title="多模态解析"
        badge="识别"
      />

      <section class="workspace">
        <section class="upload-stage">
          <div class="section-head">
            <div>
              <span class="section-kicker">INPUT</span>
              <h2>上传图片</h2>
            </div>
            <span class="section-note">支持 JPG、PNG、GIF、WebP</span>
          </div>

          <div
            class="upload-zone"
            :class="{ dragging: isDragging, 'has-image': imageUrl }"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" hidden />

            <div v-if="!imageUrl" class="upload-placeholder">
              <div class="upload-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3>拖拽或点击上传</h3>
              <p>先选一张图，再决定识别模式和附加说明。</p>
            </div>

            <div v-else class="image-preview">
              <img :src="imageUrl" alt="预览图片" />
              <button class="overlay-btn" @click.stop="clearImage">移除图片</button>
            </div>
          </div>

          <div v-if="selectedFile" class="file-strip">
            <div class="file-item">
              <span>文件名</span>
              <strong>{{ selectedFile.name }}</strong>
            </div>
            <div class="file-item">
              <span>大小</span>
              <strong>{{ formatFileSize(selectedFile.size) }}</strong>
            </div>
            <div class="file-item">
              <span>类型</span>
              <strong>{{ selectedFile.type }}</strong>
            </div>
          </div>

          <div class="demo-strip">
            <div class="section-head section-head--compact">
              <div>
                <span class="section-kicker">DEMO</span>
                <h3>演示样例</h3>
              </div>
            </div>
            <div class="demo-list">
              <button v-for="demo in demoImages" :key="demo.id" class="demo-btn" @click="loadDemoImage(demo)">
                <span class="demo-badge">{{ demo.name.charAt(0) }}</span>
                <span>{{ demo.name }}</span>
              </button>
            </div>
          </div>
        </section>

        <section class="analysis-stage">
          <div class="section-head">
            <div>
              <span class="section-kicker">OUTPUT</span>
              <h2>解析设置</h2>
            </div>
            <button class="analyze-btn" :disabled="!imageUrl || isAnalyzing" @click="startAnalysis">
              <span v-if="!isAnalyzing">开始解析</span>
              <span v-else>解析中...</span>
            </button>
          </div>

          <div class="mode-list">
            <button
              v-for="mode in analysisModes"
              :key="mode.id"
              class="mode-btn"
              :class="{ active: selectedMode === mode.id }"
              @click="selectedMode = mode.id"
            >
              <component :is="mode.icon" />
              <span>{{ mode.label }}</span>
            </button>
          </div>

          <label class="prompt-field">
            <span>补充说明</span>
            <textarea v-model="customPrompt" rows="4" placeholder="可选：例如提取重点、格式化输出、标注题干与答案..." />
          </label>

          <div v-if="analysisResult" class="result-shell">
            <div class="result-header">
              <h3>解析结果</h3>
              <div class="result-actions">
                <button class="ghost-btn" @click="copyResult">复制</button>
                <button class="ghost-btn" @click="clearResult">清空</button>
              </div>
            </div>
            <div class="result-content" v-html="formatResult(analysisResult)"></div>
          </div>

          <div v-else class="result-empty">
            <div class="empty-mark">AI</div>
            <h3>等待解析</h3>
            <p>上传图片并选择模式后，结果会显示在这里。</p>
          </div>
        </section>
      </section>

      <section class="capability-strip">
        <div class="capability-item" v-for="item in capabilityItems" :key="item.title">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useThemeStore } from '@/stores/modules/theme'
import AIToolHeader from './components/AIToolHeader.vue'

const themeStore = useThemeStore()
const fileInput = ref(null)
const selectedFile = ref(null)
const imageUrl = ref('')
const isDragging = ref(false)
const isAnalyzing = ref(false)
const analysisResult = ref('')
const customPrompt = ref('')
const selectedMode = ref('general')

const demoImages = [
  { id: 1, name: 'Java题目', type: 'question', mockResult: `## 题目识别结果\n\n### 题目内容\n**请简述Java中ArrayList和LinkedList的区别？**\n\n### 识别的选项\n- A. ArrayList基于数组实现，LinkedList基于链表实现\n- B. ArrayList查询效率高，LinkedList增删效率高\n- C. 两者都是线程安全的\n- D. ArrayList内存占用更小\n\n### 正确答案\n**A、B**\n\n### 知识点解析\n1. **底层数据结构**\n   - ArrayList：基于动态数组实现\n   - LinkedList：基于双向链表实现\n\n2. **时间复杂度对比**\n   | 操作 | ArrayList | LinkedList |\n   |------|-----------|------------|\n   | 查询 | O(1) | O(n) |\n   | 插入 | O(n) | O(1) |\n   | 删除 | O(n) | O(1) |` },
  { id: 2, name: '代码截图', type: 'code', mockResult: `## 代码识别结果\n\n### 识别的语言\n**Java**\n\n### 代码内容\n\n\`\`\`java\npublic class Singleton {\n    private static volatile Singleton instance;\n\n    private Singleton() {}\n\n    public static Singleton getInstance() {\n        if (instance == null) {\n            synchronized (Singleton.class) {\n                if (instance == null) {\n                    instance = new Singleton();\n                }\n            }\n        }\n        return instance;\n    }\n}\n\`\`\`\n\n### 代码分析\n这是一个**双重检查锁定（DCL）单例模式**实现。` },
  { id: 3, name: '文本识别', type: 'ocr', mockResult: `## OCR 文字识别结果\n\n### 识别的文字内容\n\n**Spring Boot 自动配置原理**\n\nSpring Boot 的自动配置主要依赖 @EnableAutoConfiguration、spring.factories 和条件注解机制。` }
]

const analysisModes = [
  { id: 'general', label: '通用识别', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 12, r: 10 }), h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }), h('line', { x1: 12, y1: 8, x2: '12.01', y2: 8 })]) },
  { id: 'ocr', label: 'OCR文字', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), h('polyline', { points: '14 2 14 8 20 8' }), h('line', { x1: 16, y1: 13, x2: 8, y2: 13 })]) },
  { id: 'question', label: '题目解析', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 12, r: 10 }), h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }), h('line', { x1: 12, y1: 17, x2: '12.01', y2: 17 })]) },
  { id: 'code', label: '代码识别', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('polyline', { points: '16 18 22 12 16 6' }), h('polyline', { points: '8 6 2 12 8 18' })]) }
]

const capabilityItems = [
  { title: 'OCR 文字识别', desc: '提取图片中的文本并整理结构。' },
  { title: '题目拆解', desc: '识别题干、选项、答案与知识点。' },
  { title: '代码截图解析', desc: '处理代码图片并给出格式化结果。' },
  { title: '图像理解', desc: '补充场景说明或对象识别结论。' }
]

const triggerFileInput = () => { fileInput.value?.click() }
const handleDragOver = () => { isDragging.value = true }
const handleDragLeave = () => { isDragging.value = false }

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) processFile(files[0])
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) processFile(files[0])
}

const processFile = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }
  selectedFile.value = file
  imageUrl.value = URL.createObjectURL(file)
  analysisResult.value = ''
}

const clearImage = () => {
  selectedFile.value = null
  imageUrl.value = ''
  analysisResult.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const loadDemoImage = (demo) => {
  selectedFile.value = {
    name: `${demo.name}.png`,
    size: Math.floor(Math.random() * 500000) + 100000,
    type: 'image/png'
  }
  imageUrl.value = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#e2e8f0" width="400" height="300"/>
      <rect x="32" y="28" width="336" height="244" rx="18" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="200" y="138" text-anchor="middle" fill="#155e75" font-size="48" font-weight="bold">${demo.name.charAt(0)}</text>
      <text x="200" y="176" text-anchor="middle" fill="#334155" font-size="16">${demo.name}</text>
      <text x="200" y="205" text-anchor="middle" fill="#64748b" font-size="12">演示图片</text>
    </svg>
  `)}`
  analysisResult.value = ''
  selectedMode.value = demo.type
}

const startAnalysis = async () => {
  if (!selectedFile.value || isAnalyzing.value) return
  isAnalyzing.value = true
  analysisResult.value = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const demo = demoImages.find(d => d.type === selectedMode.value) || demoImages[0]
    analysisResult.value = demo.mockResult
    ElMessage.success('解析完成')
  } catch (error) {
    console.error('解析失败:', error)
    ElMessage.error('解析失败: ' + error.message)
    analysisResult.value = '解析失败，请稍后重试。'
  } finally {
    isAnalyzing.value = false
  }
}

const formatResult = (content) => content ? DOMPurify.sanitize(marked.parse(content)) : ''

const copyResult = async () => {
  if (!analysisResult.value) return
  try {
    await navigator.clipboard.writeText(analysisResult.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearResult = () => { analysisResult.value = '' }
</script>

<style scoped>
.multimodal-page {
  --ai-accent: #155e75;
  --ai-accent-soft: rgba(21, 94, 117, 0.08);
  --ai-accent-line: rgba(21, 94, 117, 0.18);
  --ai-bg: var(--app-bg);
  --ai-surface: var(--internal-panel-bg);
  --ai-surface-alt: var(--internal-panel-bg-alt);
  --ai-muted: var(--internal-panel-bg-hover);
  --ai-border: var(--internal-panel-border);
  --ai-border-strong: var(--internal-panel-border-strong);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  height: 100dvh;
  min-height: 100dvh;
  background: var(--ai-bg);
  overflow: hidden;
}

.multimodal-page.is-dark {
  --ai-accent: #67e8f9;
  --ai-accent-soft: rgba(103, 232, 249, 0.12);
  --ai-accent-line: rgba(103, 232, 249, 0.22);
}

.multimodal-main {
  max-width: 1380px;
  margin: 0 auto;
  padding: 10px 16px 12px;
  display: grid;
  gap: 14px;
  height: 100dvh;
  overflow-y: auto;
  align-content: start;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
  gap: 16px;
}

.upload-stage,
.analysis-stage {
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  background: var(--ai-surface);
}

.upload-stage {
  padding: 18px;
  display: grid;
  gap: 16px;
}

.analysis-stage {
  padding: 18px;
  display: grid;
  grid-template-rows: auto auto auto minmax(280px, 1fr);
  gap: 16px;
}

.section-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.section-head--compact {
  margin-bottom: -4px;
}

.section-kicker {
  display: inline-block;
  color: var(--ai-text-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.section-head h2,
.section-head h3 {
  margin: 4px 0 0;
  color: var(--ai-text);
  line-height: 1.1;
}

.section-note {
  color: var(--ai-text-faint);
  font-size: 12px;
}

.upload-zone {
  min-height: 360px;
  border: 1px dashed var(--ai-border-strong);
  border-radius: 14px;
  background: var(--ai-surface-alt);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.upload-zone.dragging,
.upload-zone.has-image {
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
}

.upload-placeholder,
.result-empty {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.upload-icon,
.empty-mark {
  width: 64px;
  height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.upload-placeholder h3,
.result-empty h3 {
  margin-top: 14px;
  color: var(--ai-text);
  font-size: 24px;
}

.upload-placeholder p,
.result-empty p {
  max-width: 360px;
  margin-top: 8px;
  color: var(--ai-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.image-preview,
.image-preview img {
  width: 100%;
  height: 100%;
}

.image-preview img {
  object-fit: contain;
}

.overlay-btn,
.analyze-btn,
.ghost-btn,
.demo-btn,
.mode-btn {
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.overlay-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
}

.file-strip,
.capability-strip {
  display: grid;
  gap: 12px;
}

.file-strip {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.file-item,
.capability-item {
  padding: 12px 14px;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: var(--ai-surface-alt);
}

.file-item span,
.capability-item p {
  color: var(--ai-text-faint);
  font-size: 12px;
}

.file-item strong,
.capability-item strong {
  display: block;
  margin-top: 6px;
  color: var(--ai-text);
  font-size: 13px;
}

.demo-list,
.mode-list,
.result-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-btn,
.mode-btn,
.ghost-btn {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: var(--ai-surface-alt);
  color: var(--ai-text-soft);
  font-size: 13px;
  font-weight: 600;
}

.demo-btn,
.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.demo-badge {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 12px;
  font-weight: 700;
}

.mode-btn.active,
.analyze-btn,
.ghost-btn:hover,
.demo-btn:hover {
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.analyze-btn {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--ai-accent-line);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.analyze-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.prompt-field {
  display: grid;
  gap: 8px;
}

.prompt-field span {
  color: var(--ai-text-soft);
  font-size: 13px;
  font-weight: 600;
}

.prompt-field textarea {
  width: 100%;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: var(--ai-surface-alt);
  color: var(--ai-text);
  padding: 14px;
  resize: none;
  outline: none;
  font: inherit;
  line-height: 1.7;
}

.prompt-field textarea:focus {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 3px var(--ai-accent-soft);
}

.result-shell,
.result-empty {
  min-height: 320px;
  border: 1px solid var(--ai-border);
  border-radius: 14px;
  background: var(--ai-surface-alt);
}

.result-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 0;
}

.result-header h3 {
  color: var(--ai-text);
}

.result-content {
  padding: 14px;
  overflow-y: auto;
  color: var(--ai-text);
  font-size: 14px;
  line-height: 1.8;
}

.result-content :deep(h2) {
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ai-border);
  font-size: 18px;
  color: var(--ai-text);
}

.result-content :deep(h3) {
  margin: 16px 0 8px;
  color: var(--ai-accent);
  font-size: 15px;
}

.result-content :deep(p),
.result-content :deep(li) {
  margin: 0 0 10px;
}

.result-content :deep(ul),
.result-content :deep(ol) {
  padding-left: 20px;
}

.result-content :deep(pre) {
  margin: 12px 0;
  padding: 14px;
  border-radius: 10px;
  background: #111827;
  overflow-x: auto;
}

.result-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 13px;
}

.result-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.result-content :deep(th),
.result-content :deep(td) {
  padding: 8px 10px;
  border: 1px solid var(--ai-border);
  text-align: left;
}

.capability-strip {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .workspace,
  .capability-strip,
  .file-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .multimodal-main {
    padding: 8px 10px 10px;
  }

  .upload-stage,
  .analysis-stage {
    padding: 14px;
  }

  .upload-zone {
    min-height: 280px;
  }

  .section-head,
  .result-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
