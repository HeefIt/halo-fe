<template>
  <div class="multimodal-container">
    <header class="multimodal-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div class="brand-text">
            <h1>多模态解析</h1>
            <span class="tagline">图片识别 · OCR · 智能分析</span>
          </div>
        </div>
        <nav class="header-nav">
          <button class="nav-item" @click="navigateTo('chatbot')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>AI对话</span>
          </button>
          <button class="nav-item" @click="navigateTo('practice-assistant')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>练习助手</span>
          </button>
          <button class="nav-item" @click="navigateTo('customer-service')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"></path>
            </svg>
            <span>客服</span>
          </button>
          <button class="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>多模态</span>
          </button>
        </nav>
        <button class="home-btn" @click="goHome">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>返回首页</span>
        </button>
      </div>
    </header>

    <main class="multimodal-main">
      <div class="workspace">
        <div class="upload-section">
          <div
            class="upload-zone"
            :class="{ dragging: isDragging, 'has-image': imageUrl }"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              hidden
            />

            <div v-if="!imageUrl" class="upload-placeholder">
              <div class="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3>拖拽图片到此处</h3>
              <p>或点击选择文件</p>
              <span class="supported-formats">支持 JPG、PNG、GIF、WebP 格式</span>
            </div>

            <div v-else class="image-preview">
              <img :src="imageUrl" alt="预览图片" />
              <div class="preview-overlay">
                <button class="overlay-btn" @click.stop="clearImage">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  移除图片
                </button>
              </div>
            </div>
          </div>

          <div class="image-info" v-if="selectedFile">
            <div class="info-item">
              <span class="info-label">文件名</span>
              <span class="info-value">{{ selectedFile.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">大小</span>
              <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">类型</span>
              <span class="info-value">{{ selectedFile.type }}</span>
            </div>
          </div>

          <div class="demo-section">
            <div class="demo-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>演示图片</span>
            </div>
            <div class="demo-images">
              <button 
                v-for="demo in demoImages" 
                :key="demo.id"
                class="demo-image-btn"
                @click="loadDemoImage(demo)"
              >
                <div class="demo-preview">{{ demo.name.charAt(0) }}</div>
                <span>{{ demo.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <div class="analysis-header">
            <h2>解析设置</h2>
            <div class="analysis-modes">
              <button
                v-for="mode in analysisModes"
                :key="mode.id"
                class="mode-btn"
                :class="{ active: selectedMode === mode.id }"
                @click="selectedMode = mode.id"
              >
                <component :is="mode.icon" />
                {{ mode.label }}
              </button>
            </div>
          </div>

          <div class="prompt-input">
            <textarea
              v-model="customPrompt"
              placeholder="输入自定义解析指令（可选）..."
              rows="3"
            ></textarea>
          </div>

          <button
            class="analyze-btn"
            :disabled="!imageUrl || isAnalyzing"
            @click="startAnalysis"
          >
            <svg v-if="!isAnalyzing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div v-else class="loading-spinner"></div>
            {{ isAnalyzing ? '解析中...' : '开始解析' }}
          </button>

          <div class="result-section" v-if="analysisResult">
            <div class="result-header">
              <h3>解析结果</h3>
              <div class="result-actions">
                <button class="action-btn" @click="copyResult">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制
                </button>
                <button class="action-btn" @click="clearResult">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  清空
                </button>
              </div>
            </div>
            <div class="result-content" v-html="formatResult(analysisResult)"></div>
          </div>

          <div class="empty-result" v-else>
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>等待解析</h3>
            <p>上传图片后点击"开始解析"</p>
          </div>
        </div>
      </div>

      <div class="features-bar">
        <div class="feature-item">
          <div class="feature-icon ocr">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="feature-text">
            <h4>OCR 文字识别</h4>
            <p>精准提取图片中的文字内容</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon analyze">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div class="feature-text">
            <h4>图像内容分析</h4>
            <p>智能理解图片内容和场景</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon question">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="feature-text">
            <h4>题目识别解析</h4>
            <p>自动识别并解析题目内容</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon code">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div class="feature-text">
            <h4>代码截图解析</h4>
            <p>识别代码截图并格式化输出</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const router = useRouter()

const fileInput = ref(null)
const selectedFile = ref(null)
const imageUrl = ref('')
const isDragging = ref(false)
const isAnalyzing = ref(false)
const analysisResult = ref('')
const customPrompt = ref('')
const selectedMode = ref('general')

const demoImages = [
  { id: 1, name: 'Java题目', type: 'question', mockResult: `## 题目识别结果

### 题目内容
**请简述Java中ArrayList和LinkedList的区别？**

### 识别的选项
- A. ArrayList基于数组实现，LinkedList基于链表实现
- B. ArrayList查询效率高，LinkedList增删效率高
- C. 两者都是线程安全的
- D. ArrayList内存占用更小

### 正确答案
**A、B**

### 知识点解析
1. **底层数据结构**
   - ArrayList：基于动态数组实现
   - LinkedList：基于双向链表实现

2. **时间复杂度对比**
   | 操作 | ArrayList | LinkedList |
   |------|-----------|------------|
   | 查询 | O(1) | O(n) |
   | 插入 | O(n) | O(1) |
   | 删除 | O(n) | O(1) |

3. **使用场景建议**
   - 频繁查询：选择 ArrayList
   - 频繁增删：选择 LinkedList` },
  { id: 2, name: '代码截图', type: 'code', mockResult: `## 代码识别结果

### 识别的语言
**Java**

### 代码内容

\`\`\`java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
\`\`\`

### 代码分析
这是一个**双重检查锁定（DCL）单例模式**实现：

1. **volatile 关键字**：防止指令重排序，保证可见性
2. **私有构造函数**：防止外部实例化
3. **双重检查**：提高性能，避免不必要的同步

### 优点
- 线程安全
- 延迟加载
- 性能较好

### 注意事项
- JDK 1.5 之后 volatile 才能正确工作
- 反射可以破坏单例` },
  { id: 3, name: '文本识别', type: 'ocr', mockResult: `## OCR 文字识别结果

### 识别的文字内容

**Spring Boot 自动配置原理**

Spring Boot 的自动配置是它的核心特性之一，主要通过以下机制实现：

1. **@EnableAutoConfiguration 注解**
   - 开启自动配置功能
   - 通过 @Import 导入 AutoConfigurationImportSelector

2. **spring.factories 文件**
   - 位于 META-INF 目录下
   - 配置所有自动配置类的全限定名

3. **条件注解**
   - @ConditionalOnClass：类路径存在指定类
   - @ConditionalOnBean：容器中存在指定 Bean
   - @ConditionalOnProperty：配置属性满足条件

### 识别置信度
- 整体置信度：**98.5%**
- 字符识别：**99.2%**
- 排版还原：**97.8%**

### 建议
文字识别清晰，内容完整。可直接用于文档编辑或进一步处理。` }
]

const analysisModes = [
  { id: 'general', label: '通用识别', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('line', { x1: 12, y1: 16, x2: 12, y2: 12 }),
    h('line', { x1: 12, y1: 8, x2: '12.01', y2: 8 })
  ])},
  { id: 'ocr', label: 'OCR文字', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
    h('line', { x1: 16, y1: 17, x2: 8, y2: 17 })
  ])},
  { id: 'question', label: '题目解析', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('line', { x1: 12, y1: 17, x2: '12.01', y2: 17 })
  ])},
  { id: 'code', label: '代码识别', icon: h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
    h('polyline', { points: '16 18 22 12 16 6' }),
    h('polyline', { points: '8 6 2 12 8 18' })
  ])}
]

const navigateTo = (feature) => {
  router.push(`/ai/${feature}`)
}

const goHome = () => {
  router.push('/home')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    processFile(files[0])
  }
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
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e1b4b"/>
          <stop offset="100%" style="stop-color:#312e81"/>
        </linearGradient>
      </defs>
      <rect fill="url(#bg)" width="400" height="300"/>
      <text x="200" y="130" text-anchor="middle" fill="#a78bfa" font-size="48" font-weight="bold">${demo.name.charAt(0)}</text>
      <text x="200" y="170" text-anchor="middle" fill="#8b5cf6" font-size="16">${demo.name}</text>
      <text x="200" y="200" text-anchor="middle" fill="#6366f1" font-size="12">演示图片</text>
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

const formatResult = (content) => {
  if (!content) return ''
  return DOMPurify.sanitize(marked.parse(content))
}

const copyResult = async () => {
  if (!analysisResult.value) return

  try {
    await navigator.clipboard.writeText(analysisResult.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearResult = () => {
  analysisResult.value = ''
}
</script>

<style scoped>
.multimodal-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
  display: flex;
  flex-direction: column;
}

.multimodal-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.brand-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
}

.tagline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.multimodal-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  width: 100%;
}

.workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-zone {
  min-height: 320px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.upload-zone.dragging {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  transform: scale(1.02);
}

.upload-zone.has-image {
  border-style: solid;
  border-color: rgba(139, 92, 246, 0.3);
}

.upload-placeholder {
  text-align: center;
  padding: 40px;
}

.upload-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}

.upload-placeholder h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.upload-placeholder p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px 0;
}

.supported-formats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.overlay-btn:hover {
  background: #ef4444;
  transform: scale(1.05);
}

.image-info {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 13px;
  color: white;
  font-weight: 500;
}

.demo-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #fbbf24;
  font-size: 13px;
  font-weight: 500;
}

.demo-images {
  display: flex;
  gap: 8px;
}

.demo-image-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-image-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: white;
  transform: translateY(-2px);
}

.demo-preview {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.analysis-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.analysis-header {
  margin-bottom: 20px;
}

.analysis-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
}

.analysis-modes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: white;
}

.mode-btn.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-color: transparent;
  color: white;
}

.prompt-input {
  margin-bottom: 20px;
}

.prompt-input textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
}

.prompt-input textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.prompt-input textarea:focus {
  border-color: rgba(139, 92, 246, 0.5);
}

.analyze-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.result-content {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.7;
  max-height: 400px;
}

.result-content :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-content :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: #a78bfa;
  margin: 16px 0 8px 0;
}

.result-content :deep(p) {
  margin: 0 0 12px 0;
}

.result-content :deep(ul), .result-content :deep(ol) {
  margin: 0 0 12px 0;
  padding-left: 20px;
}

.result-content :deep(li) {
  margin-bottom: 6px;
}

.result-content :deep(code) {
  background: rgba(139, 92, 246, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.result-content :deep(pre) {
  background: #1e1e2e;
  border-radius: 10px;
  padding: 14px;
  overflow-x: auto;
  margin: 12px 0;
}

.result-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.result-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.result-content :deep(th), .result-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.result-content :deep(th) {
  background: rgba(139, 92, 246, 0.1);
  font-weight: 600;
}

.result-content :deep(strong) {
  color: #a78bfa;
}

.empty-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
  margin-bottom: 20px;
}

.empty-result h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.empty-result p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.features-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-4px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon.ocr {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.feature-icon.analyze {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.feature-icon.question {
  background: rgba(249, 115, 22, 0.15);
  color: #fb923c;
}

.feature-icon.code {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.feature-text h4 {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.feature-text p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .features-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    gap: 16px;
  }

  .header-nav {
    display: none;
  }

  .multimodal-main {
    padding: 16px;
  }

  .upload-zone {
    min-height: 240px;
  }

  .features-bar {
    grid-template-columns: 1fr;
  }
}
</style>
