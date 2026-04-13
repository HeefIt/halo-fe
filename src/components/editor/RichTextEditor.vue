<template>
  <div class="rich-editor">
    <Editor
      v-model="content"
      :api-key="tinymceApiKey"
      :init="editorConfig"
      :disabled="disabled"
      @init="handleInit"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import request from '@/api/http'
import { useThemeStore } from '@/stores/modules/theme'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 500
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '开始写作...'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const content = ref(props.modelValue)
const editorInstance = ref(null)
const DEFAULT_TINYMCE_API_KEY = 'ptydh8oiy1q12bscwm8hx2ex2yw7vuy3pblt3k9l2tu75g8j'
const tinymceApiKey = (import.meta.env.VITE_TINYMCE_API_KEY || DEFAULT_TINYMCE_API_KEY).trim()
const themeStore = useThemeStore()
const EDITOR_THEME_STYLE_ID = 'halo-editor-theme-style'

const EDITOR_I18N_OVERRIDES = {
  Undo: '撤销',
  Redo: '重做',
  Bold: '加粗',
  Italic: '斜体',
  Underline: '下划线',
  Strikethrough: '删除线',
  'Clear formatting': '清除格式',
  'Align left': '左对齐',
  'Align center': '居中对齐',
  'Align right': '右对齐',
  'Bullet list': '无序列表',
  'Numbered list': '有序列表',
  Paragraph: '正文',
  Blockquote: '引用',
  Blocks: '段落样式',
  Formats: '格式',
  'Insert/edit link': '插入/编辑链接',
  'Insert/edit image': '插入/编辑图片',
  'Insert/edit media': '插入/编辑媒体',
  'Insert/edit code sample': '插入/编辑代码块',
  'Source code': '源代码',
  'Code sample...': '代码块...',
  Help: '帮助',
  Preview: '预览',
  Fullscreen: '全屏',
  'Open link': '打开链接',
  'Remove link': '移除链接',
  'Paste as text': '纯文本粘贴'
}

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

watch(content, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
})

watch(() => themeStore.resolvedTheme, () => {
  applyEditorTheme(editorInstance.value)
})

onBeforeUnmount(() => {
  editorInstance.value = null
})

const editorConfig = computed(() => ({
  height: props.height,
  menubar: false,
  language: 'zh_CN',
  language_url: '/tinymce/langs/zh_CN.js',
  placeholder: props.placeholder,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
    'fullscreen', 'insertdatetime', 'media', 'table', 'help',
    'wordcount', 'codesample', 'quickbars', 'emoticons', 'paste'
  ],
  toolbar: [
    'undo redo | blocks | bold italic underline strikethrough |',
    'alignleft aligncenter alignright | bullist numlist blockquote |',
    'link image media codesample |',
    'codesample code | removeformat | help'
  ].join(' '),
  block_formats: '正文=p; 一级标题=h2; 二级标题=h3; 三级标题=h4; 引用=blockquote',
  quickbars_selection_toolbar: 'bold italic | blocks | quicklink blockquote',
  quickbars_insert_toolbar: 'quickimage quicktable',
  toolbar_mode: 'sliding',
  toolbar_sticky: true,
  toolbar_sticky_offset: 60,
  paste_as_text: false,
  paste_merge_formats: true,
  smart_paste: true,
  
  branding: false,
  promotion: false,
  
  content_style: getEditorContentStyle(themeStore.resolvedTheme),
  
  images_upload_handler: handleImageUpload,
  file_picker_types: 'image',
  file_picker_callback: handleFilePicker,
  
  link_default_target: '_blank',
  link_assume_external_targets: true,
  
  codesample_global_prismjs: true,
  codesample_languages: [
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'PHP', value: 'php' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C#', value: 'csharp' },
    { text: 'C++', value: 'cpp' },
    { text: 'TypeScript', value: 'typescript' },
    { text: 'Go', value: 'go' },
    { text: 'Rust', value: 'rust' },
    { text: 'SQL', value: 'sql' },
    { text: 'Bash', value: 'bash' }
  ],
  
  setup: (editor) => {
    ensureChineseLocale()
    editor.on('paste', (event) => {
      const clipboardData = event.clipboardData || event?.originalEvent?.clipboardData
      const markdownHtml = resolveClipboardMarkdownContent(clipboardData)
      if (!markdownHtml) {
        return
      }

      event.preventDefault()
      editor.insertContent(markdownHtml)
    })
    editor.on('PastePreProcess', (event) => {
      event.content = normalizePastedContent(event.content)
    })
    editor.on('init', () => {
      applyEditorTheme(editor)
    })
    editor.on('blur', () => {
      emit('blur')
    })
  }
}))

const handleInit = (evt, editor) => {
  ensureChineseLocale()
  editorInstance.value = editor
  applyEditorTheme(editor)
}

const handleImageUpload = async (blobInfo, progress) => {
  try {
    const formData = new FormData()
    formData.append('image', blobInfo.blob(), blobInfo.filename())
    
    const response = await request.post('/file/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (e) => {
        progress(e.loaded / e.total * 100)
      }
    })
    
    if (response.success && response.data) {
      return response.data.filePath || response.data.url
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('图片上传失败：' + error.message)
    throw error
  }
}

const handleFilePicker = (callback, value, meta) => {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await request.post('/file/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.success && response.data) {
        callback(response.data.filePath || response.data.url, { alt: file.name })
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      ElMessage.error('图片上传失败：' + error.message)
    }
  }
  
  input.click()
}

function normalizePastedContent(rawContent) {
  const value = String(rawContent || '').replace(/\r\n/g, '\n').trim()
  if (!value) {
    return rawContent
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(value)
  if (hasHtmlTag && !shouldTransformHtmlMarkdown(value)) {
    return rawContent
  }

  const normalizedText = hasHtmlTag ? extractTextFromHtml(value) : value

  if (looksLikeMarkdown(normalizedText)) {
    return markdownToEditorHtml(normalizedText)
  }

  return plainTextToHtml(normalizedText)
}

function resolveClipboardMarkdownContent(clipboardData) {
  if (!clipboardData?.getData) {
    return ''
  }

  const plainText = normalizePlainText(clipboardData.getData('text/plain'))
  const html = clipboardData.getData('text/html')

  if (looksLikeMarkdown(plainText)) {
    return markdownToEditorHtml(plainText)
  }

  if (shouldTransformHtmlMarkdown(html, plainText)) {
    const extracted = extractTextFromHtml(html)
    if (looksLikeMarkdown(extracted)) {
      return markdownToEditorHtml(extracted)
    }
  }

  return ''
}

function shouldTransformHtmlMarkdown(html, plainText = '') {
  if (!html) return false
  if (/<(h[1-6]|ul|ol|li|blockquote|table|pre|code|img|video|iframe)\b/i.test(html)) {
    return false
  }
  if (looksLikeMarkdown(plainText)) {
    return true
  }
  return looksLikeMarkdown(extractTextFromHtml(html))
}

function extractTextFromHtml(html) {
  if (typeof DOMParser === 'undefined') {
    return normalizePlainText(String(html || ''))
  }

  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html')
  const root = doc.body
  if (!root) {
    return normalizePlainText(String(html || ''))
  }

  const blockBreakTags = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'])
  const lineBreakTags = new Set(['LI', 'TR'])
  let output = ''

  const walk = (node) => {
    if (!node) return

    if (node.nodeType === Node.TEXT_NODE) {
      output += node.textContent || ''
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const tagName = node.tagName
    if (tagName === 'BR') {
      output += '\n'
      return
    }

    Array.from(node.childNodes || []).forEach(walk)

    if (blockBreakTags.has(tagName)) {
      output += '\n\n'
      return
    }

    if (lineBreakTags.has(tagName)) {
      output += '\n'
    }
  }

  walk(root)
  return normalizePlainText(output)
}

function looksLikeMarkdown(text) {
  const value = String(text || '').trim()
  if (!value) return false

  return /(^|\n)\s{0,3}#{1,6}\s+\S+/m.test(value) ||
    /(^|\n)\s*[-*+]\s+\S+/m.test(value) ||
    /(^|\n)\s*\d+\.\s+\S+/m.test(value) ||
    /(^|\n)\s*>\s+\S+/m.test(value) ||
    /(^|\n)\s*```[\s\S]*?```/m.test(value) ||
    /\*\*[^*]+\*\*/.test(value) ||
    /__[^_]+__/.test(value) ||
    /`[^`]+`/.test(value) ||
    /\[[^\]]+\]\([^)]+\)/.test(value)
}

function ensureChineseLocale() {
  if (typeof window === 'undefined') {
    return
  }

  const tinyMCE = window.tinymce
  if (tinyMCE?.addI18n) {
    tinyMCE.addI18n('zh_CN', EDITOR_I18N_OVERRIDES)
  }
}

function markdownToEditorHtml(text) {
  return DOMPurify.sanitize(marked.parse(String(text || ''), {
    gfm: true,
    breaks: true
  }), {
    USE_PROFILES: { html: true }
  })
}

function normalizePlainText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getEditorPalette(theme) {
  if (theme === 'dark') {
    return {
      colorScheme: 'dark',
      background: '#0f172a',
      surface: '#111c31',
      text: '#e5edf5',
      mutedText: '#b6c2cf',
      border: '#334155',
      quoteBorder: '#475569',
      quoteText: '#cbd5e1',
      inlineCode: 'rgba(148, 163, 184, 0.18)',
      codeBlock: '#0b1220',
      tableRow: '#172033',
      link: '#7cc3ff'
    }
  }

  return {
    colorScheme: 'light',
    background: '#fffdf8',
    surface: '#f6f1e8',
    text: '#18212f',
    mutedText: '#526171',
    border: '#d9dee7',
    quoteBorder: '#b8c4d2',
    quoteText: '#475569',
    inlineCode: 'rgba(24, 33, 47, 0.08)',
    codeBlock: '#f4efe5',
    tableRow: '#faf5ea',
    link: '#2459d1'
  }
}

function getEditorContentStyle(theme) {
  const palette = getEditorPalette(theme)

  return `
    :root {
      color-scheme: ${palette.colorScheme};
    }
    html {
      background: ${palette.background};
    }
    body {
      max-width: 820px;
      margin: 0 auto;
      padding: 32px 28px 56px;
      font-family: Georgia, 'Times New Roman', 'PingFang SC', 'Microsoft YaHei', serif;
      font-size: 17px;
      line-height: 1.95;
      color: ${palette.text};
      background: ${palette.background};
      caret-color: ${palette.text};
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 28px;
      margin-bottom: 14px;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.02em;
      color: ${palette.text};
    }
    h1 { font-size: 2em; }
    h2 {
      font-size: 1.6em;
      padding-bottom: .32em;
      border-bottom: 1px solid ${palette.border};
    }
    h3 { font-size: 1.32em; }
    h4 { font-size: 1.1em; }
    p {
      margin: 0 0 1.1em;
      color: ${palette.text};
    }
    code {
      padding: .2em .4em;
      margin: 0;
      font-size: 85%;
      color: ${palette.text};
      background-color: ${palette.inlineCode};
      border-radius: 4px;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.6;
      color: ${palette.text};
      background-color: ${palette.codeBlock};
      border: 1px solid ${palette.border};
      border-radius: 6px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      padding: 0 0 0 1em;
      color: ${palette.quoteText};
      border-left: .25em solid ${palette.quoteBorder};
      margin: 0 0 16px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    table {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
      background: ${palette.background};
    }
    table th,
    table td {
      padding: 12px 13px;
      border: 1px solid ${palette.border};
      color: ${palette.text};
      background: ${palette.background};
    }
    table tr:nth-child(2n) td {
      background-color: ${palette.tableRow};
    }
    ul,
    ol {
      padding-left: 2em;
      margin-bottom: 16px;
      color: ${palette.text};
    }
    hr {
      border: none;
      border-top: 1px solid ${palette.border};
      margin: 28px 0;
    }
    a {
      color: ${palette.link};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ::selection {
      background: rgba(59, 130, 246, 0.22);
    }
  `
}

function applyEditorTheme(editor) {
  if (!editor) {
    return
  }

  const doc = editor.getDoc()
  if (!doc?.head) {
    return
  }

  let styleElement = doc.getElementById(EDITOR_THEME_STYLE_ID)
  if (!styleElement) {
    styleElement = doc.createElement('style')
    styleElement.id = EDITOR_THEME_STYLE_ID
    doc.head.appendChild(styleElement)
  }

  styleElement.textContent = getEditorContentStyle(themeStore.resolvedTheme)

  if (doc.body) {
    doc.body.setAttribute('data-theme', themeStore.resolvedTheme)
  }
}

function plainTextToHtml(text) {
  const blocks = text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)

  if (!blocks.length) {
    return ''
  }

  return blocks.map((block) => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    if (!lines.length) {
      return ''
    }

    if (lines.every(line => /^[-*]\s+/.test(line))) {
      const items = lines.map(line => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`).join('')
      return `<ul>${items}</ul>`
    }

    if (lines.every(line => /^\d+\.\s+/.test(line))) {
      const items = lines.map(line => `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')
      return `<ol>${items}</ol>`
    }

    if (lines.length === 1) {
      const line = lines[0]
      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
      if (headingMatch) {
        const level = headingMatch[1].length + 1
        return `<h${level}>${escapeHtml(headingMatch[2])}</h${level}>`
      }

      if (/^>\s+/.test(line)) {
        return `<blockquote><p>${escapeHtml(line.replace(/^>\s+/, ''))}</p></blockquote>`
      }
    }

    return `<p>${escapeHtml(lines.join(' '))}</p>`
  }).join('')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
</script>

<style scoped>
.rich-editor {
  width: 100%;
}

.rich-editor :deep(.tox-tinymce) {
  border: 1px solid var(--internal-panel-border, #d1d5db);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--internal-panel-shadow, 0 18px 38px rgba(15, 23, 42, 0.06));
  background: var(--internal-panel-bg, #ffffff);
}

.rich-editor :deep(.tox-editor-header),
.rich-editor :deep(.tox-editor-container),
.rich-editor :deep(.tox-sidebar-wrap),
.rich-editor :deep(.tox-toolbar-overlord),
.rich-editor :deep(.tox-toolbar),
.rich-editor :deep(.tox-toolbar__overflow),
.rich-editor :deep(.tox-toolbar__primary) {
  background: var(--internal-panel-bg-alt, #f8fafc);
  background-image: none !important;
  background-position: initial !important;
  background-size: auto !important;
  box-shadow: none !important;
}

.rich-editor :deep(.tox-toolbar__primary) {
  padding: 10px 12px;
  border-bottom: none;
}

.rich-editor :deep(.tox-edit-area) {
  background: var(--internal-panel-bg-alt, #f7f5f2);
  background-image: none !important;
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.rich-editor :deep(.tox-statusbar) {
  background: var(--internal-panel-bg-alt, #f8fafc);
  background-image: none !important;
  border-top: none;
  box-shadow: none !important;
}

.rich-editor :deep(.tox .tox-statusbar__path-item),
.rich-editor :deep(.tox .tox-statusbar__wordcount),
.rich-editor :deep(.tox .tox-mbtn),
.rich-editor :deep(.tox .tox-mbtn__select-label) {
  color: var(--text-2, #334155);
}

.rich-editor :deep(.tox .tox-statusbar),
.rich-editor :deep(.tox .tox-statusbar a),
.rich-editor :deep(.tox .tox-statusbar__help-text),
.rich-editor :deep(.tox .tox-statusbar__path),
.rich-editor :deep(.tox .tox-statusbar__wordcount) {
  color: var(--text-1, #111827);
  font-weight: 600;
}

.rich-editor :deep(.tox .tox-statusbar a:hover),
.rich-editor :deep(.tox .tox-statusbar__path-item:hover) {
  color: var(--color-accent, #2563eb);
}

.rich-editor :deep(.tox .tox-toolbar__group) {
  padding: 0 4px;
  gap: 8px;
}

.rich-editor :deep(.tox:not([dir='rtl']) .tox-toolbar__group:not(:last-of-type)),
.rich-editor :deep(.tox[dir='rtl'] .tox-toolbar__group:not(:last-of-type)) {
  border-inline-end: none;
}

.rich-editor :deep(.tox .tox-tbtn),
.rich-editor :deep(.tox .tox-mbtn) {
  min-height: 42px;
  padding: 0 12px;
  background: var(--internal-panel-bg, #ffffff);
  border: 1px solid var(--internal-panel-border, #d1d5db);
  color: var(--text-2, #334155);
  border-radius: 8px;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.rich-editor :deep(.tox .tox-tbtn svg),
.rich-editor :deep(.tox .tox-mbtn svg) {
  fill: currentColor;
}

.rich-editor :deep(.tox .tox-tbtn:hover),
.rich-editor :deep(.tox .tox-mbtn:hover) {
  background: var(--internal-panel-bg-hover, #eef3f8);
  border-color: var(--internal-panel-border-strong, #cbd5e1);
  color: var(--text-1, #111827);
}

.rich-editor :deep(.tox .tox-tbtn--enabled),
.rich-editor :deep(.tox .tox-tbtn--enabled:hover),
.rich-editor :deep(.tox .tox-mbtn--active),
.rich-editor :deep(.tox .tox-mbtn--active:hover) {
  background: var(--color-accent-light, rgba(37, 99, 235, 0.08));
  color: var(--color-accent, #2563eb);
  border-color: var(--color-accent-subtle, rgba(37, 99, 235, 0.2));
}

.rich-editor :deep(.tox .tox-mbtn__select-label) {
  color: inherit;
}

.rich-editor :deep(.tox .tox-tbtn__select-chevron),
.rich-editor :deep(.tox .tox-mbtn__select-chevron) {
  color: inherit;
  fill: currentColor;
}

.rich-editor :deep(.tox .tox-button--secondary) {
  background-color: var(--internal-panel-bg-alt, #f3f4f6);
  color: var(--text-1, #111827);
}

.rich-editor :deep(.tox .tox-button--secondary:hover) {
  background-color: var(--internal-panel-bg-hover, #e5e7eb);
}

.rich-editor :deep(.tox-edit-area__iframe) {
  background: var(--internal-panel-bg, #ffffff);
  border: none !important;
  box-shadow: none !important;
}

.rich-editor :deep(.tox-editor-header::before),
.rich-editor :deep(.tox-editor-header::after),
.rich-editor :deep(.tox-toolbar-overlord::before),
.rich-editor :deep(.tox-toolbar-overlord::after),
.rich-editor :deep(.tox-toolbar::before),
.rich-editor :deep(.tox-toolbar::after),
.rich-editor :deep(.tox-edit-area::before),
.rich-editor :deep(.tox-edit-area::after),
.rich-editor :deep(.tox-statusbar::before),
.rich-editor :deep(.tox-statusbar::after) {
  display: none !important;
  content: none !important;
}

.rich-editor :deep(.tox .tox-collection),
.rich-editor :deep(.tox .tox-menu),
.rich-editor :deep(.tox .tox-dialog),
.rich-editor :deep(.tox .tox-dialog-wrap__backdrop) {
  color: var(--text-1, #111827);
}

.rich-editor :deep(.tox .tox-collection),
.rich-editor :deep(.tox .tox-menu),
.rich-editor :deep(.tox .tox-dialog) {
  background: var(--internal-panel-bg, #ffffff);
  border-color: var(--internal-panel-border, #d1d5db);
}

.rich-editor :deep(.tox .tox-collection__item),
.rich-editor :deep(.tox .tox-collection__item-label),
.rich-editor :deep(.tox .tox-label),
.rich-editor :deep(.tox .tox-listboxfield .tox-listbox--select),
.rich-editor :deep(.tox .tox-textfield),
.rich-editor :deep(.tox .tox-textarea),
.rich-editor :deep(.tox .tox-selectfield select) {
  color: var(--text-1, #111827);
}

.rich-editor :deep(.tox .tox-collection__item--active),
.rich-editor :deep(.tox .tox-collection__item--enabled:hover),
.rich-editor :deep(.tox .tox-listboxfield .tox-listbox--select:hover) {
  background: var(--internal-panel-bg-hover, #eef3f8);
}

.rich-editor :deep(.tox .tox-textfield),
.rich-editor :deep(.tox .tox-textarea),
.rich-editor :deep(.tox .tox-selectfield select),
.rich-editor :deep(.tox .tox-listboxfield .tox-listbox--select) {
  background: var(--internal-panel-bg-alt, #f8fafc);
  border-color: var(--internal-panel-border, #d1d5db);
}

.rich-editor :deep(.tox-dialog) {
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.rich-editor :deep(.tox-dialog__header) {
  padding: 16px 16px 0;
}

.rich-editor :deep(.tox-dialog__body-content) {
  padding: 16px;
}

.rich-editor :deep(.tox-dialog__footer) {
  padding: 0 16px 16px;
}

.rich-editor :deep(.tox-dialog__footer-end) {
  display: flex;
  gap: 8px;
}

:global(.tox.tox-tinymce-aux) {
  color: var(--text-1, #111827);
}

:global(.tox.tox-tinymce-aux .tox-menu),
:global(.tox.tox-tinymce-aux .tox-collection),
:global(.tox.tox-tinymce-aux .tox-dialog),
:global(.tox.tox-tinymce-aux .tox-dialog__header),
:global(.tox.tox-tinymce-aux .tox-dialog__body),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content),
:global(.tox.tox-tinymce-aux .tox-dialog__footer),
:global(.tox.tox-tinymce-aux .tox-toolbar__overflow) {
  background: var(--internal-panel-bg, #ffffff) !important;
  background-image: none !important;
  color: var(--text-1, #111827) !important;
  border-color: var(--internal-panel-border, #d1d5db) !important;
}

:global(.tox.tox-tinymce-aux .tox-menu),
:global(.tox.tox-tinymce-aux .tox-collection),
:global(.tox.tox-tinymce-aux .tox-dialog),
:global(.tox.tox-tinymce-aux .tox-toolbar__overflow) {
  border-radius: 12px !important;
  box-shadow: var(--internal-panel-shadow, 0 18px 38px rgba(15, 23, 42, 0.16)) !important;
}

:global(.tox.tox-tinymce-aux .tox-dialog-wrap__backdrop) {
  background: rgba(2, 6, 23, 0.56) !important;
}

:global(.tox.tox-tinymce-aux .tox-dialog__title),
:global(.tox.tox-tinymce-aux .tox-dialog__body),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content p),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content h1),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content h2),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content strong),
:global(.tox.tox-tinymce-aux .tox-label),
:global(.tox.tox-tinymce-aux .tox-form__group),
:global(.tox.tox-tinymce-aux .tox-checkbox__label),
:global(.tox.tox-tinymce-aux .tox-listboxfield .tox-listbox--select),
:global(.tox.tox-tinymce-aux .tox-selectfield select),
:global(.tox.tox-tinymce-aux .tox-textfield),
:global(.tox.tox-tinymce-aux .tox-textarea) {
  color: var(--text-1, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-dialog__body-content a),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content a:hover),
:global(.tox.tox-tinymce-aux .tox-dialog__body-nav-item--active) {
  color: var(--color-accent, #2563eb) !important;
}

:global(.tox.tox-tinymce-aux .tox-dialog__body-nav-item) {
  color: var(--text-2, #475569) !important;
  border-bottom-color: transparent !important;
}

:global(.tox.tox-tinymce-aux .tox-dialog__body-nav-item:focus),
:global(.tox.tox-tinymce-aux .tox-dialog__body-nav-item:hover) {
  background: var(--internal-panel-bg-hover, #eef3f8) !important;
  color: var(--text-1, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-textfield),
:global(.tox.tox-tinymce-aux .tox-textarea),
:global(.tox.tox-tinymce-aux .tox-listboxfield .tox-listbox--select),
:global(.tox.tox-tinymce-aux .tox-selectfield select),
:global(.tox.tox-tinymce-aux .tox-toolbar-textfield) {
  background: var(--internal-panel-bg-alt, #f8fafc) !important;
  color: var(--text-1, #111827) !important;
  border: 1px solid var(--internal-panel-border, #d1d5db) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

:global(.tox.tox-tinymce-aux .tox-textfield::placeholder),
:global(.tox.tox-tinymce-aux .tox-textarea::placeholder) {
  color: var(--text-3, #94a3b8) !important;
}

:global(.tox.tox-tinymce-aux .tox-textfield:focus),
:global(.tox.tox-tinymce-aux .tox-textarea:focus),
:global(.tox.tox-tinymce-aux .tox-listboxfield .tox-listbox--select:focus),
:global(.tox.tox-tinymce-aux .tox-selectfield select:focus) {
  border-color: var(--color-accent, #2563eb) !important;
  box-shadow: 0 0 0 3px var(--color-accent-light, rgba(37, 99, 235, 0.12)) !important;
  outline: none !important;
}

:global(.tox.tox-tinymce-aux .tox-button),
:global(.tox.tox-tinymce-aux .tox-button--secondary) {
  min-height: 38px;
  border-radius: 10px !important;
  border: 1px solid var(--internal-panel-border, #d1d5db) !important;
  box-shadow: none !important;
}

:global(.tox.tox-tinymce-aux .tox-button) {
  background: var(--color-accent, #2563eb) !important;
  color: #fff !important;
}

:global(.tox.tox-tinymce-aux .tox-button:hover) {
  background: var(--color-accent-hover, #1d4ed8) !important;
}

:global(.tox.tox-tinymce-aux .tox-button--secondary) {
  background: var(--internal-panel-bg-alt, #f8fafc) !important;
  color: var(--text-1, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-button--secondary:hover) {
  background: var(--internal-panel-bg-hover, #eef3f8) !important;
  color: var(--text-1, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__group) {
  border-color: transparent !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item) {
  background: transparent !important;
  color: var(--text-1, #111827) !important;
  border-radius: 8px !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item-label),
:global(.tox.tox-tinymce-aux .tox-collection__item-accessory),
:global(.tox.tox-tinymce-aux .tox-collection__group-heading) {
  color: inherit !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item:hover),
:global(.tox.tox-tinymce-aux .tox-collection__item--active),
:global(.tox.tox-tinymce-aux .tox-collection__item--enabled) {
  background: var(--internal-panel-bg-hover, #eef3f8) !important;
  color: var(--text-1, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item--active),
:global(.tox.tox-tinymce-aux .tox-collection__item--enabled) {
  background: var(--color-accent-light, rgba(37, 99, 235, 0.12)) !important;
  color: var(--color-accent, #2563eb) !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item-icon svg),
:global(.tox.tox-tinymce-aux .tox-collection__item-checkmark svg),
:global(.tox.tox-tinymce-aux .tox-collection__item-caret svg),
:global(.tox.tox-tinymce-aux .tox-selectfield svg),
:global(.tox.tox-tinymce-aux .tox-listboxfield svg),
:global(.tox.tox-tinymce-aux .tox-dialog__body-content svg),
:global(.tox.tox-tinymce-aux .tox-icon svg) {
  fill: currentColor !important;
}

:global(.tox.tox-tinymce-aux .tox-collection__item--state-disabled),
:global(.tox.tox-tinymce-aux .tox-collection__item--state-disabled .tox-collection__item-label) {
  color: var(--text-3, #94a3b8) !important;
  opacity: 0.6;
}

:global(.tox.tox-tinymce-aux .tox-tooltip__body) {
  background: var(--internal-panel-bg, #111827) !important;
  color: var(--text-1, #f8fafc) !important;
  border: 1px solid var(--internal-panel-border, rgba(148, 163, 184, 0.16)) !important;
}

:global(.tox.tox-tinymce-aux .tox-tooltip--up .tox-tooltip__arrow) {
  border-bottom-color: var(--internal-panel-bg, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-tooltip--down .tox-tooltip__arrow) {
  border-top-color: var(--internal-panel-bg, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-tooltip--left .tox-tooltip__arrow) {
  border-right-color: var(--internal-panel-bg, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-tooltip--right .tox-tooltip__arrow) {
  border-left-color: var(--internal-panel-bg, #111827) !important;
}

:global(.tox.tox-tinymce-aux .tox-checkbox__icons) {
  border-color: var(--internal-panel-border, #d1d5db) !important;
  background: var(--internal-panel-bg-alt, #f8fafc) !important;
}

:global(.tox.tox-tinymce-aux .tox-checkbox__input:checked + .tox-checkbox__icons) {
  background: var(--color-accent-light, rgba(37, 99, 235, 0.12)) !important;
  border-color: var(--color-accent, #2563eb) !important;
}

:global(.tox.tox-tinymce-aux .tox-checkbox__icons svg) {
  fill: var(--color-accent, #2563eb) !important;
}

:global(.tox.tox-tinymce-aux .tox-swatches__picker-btn),
:global(.tox.tox-tinymce-aux .tox-swatch) {
  background: var(--internal-panel-bg-alt, #f8fafc) !important;
  border-radius: 8px !important;
}

:global(.tox.tox-tinymce-aux .tox-swatches__picker-btn:hover),
:global(.tox.tox-tinymce-aux .tox-swatch:hover) {
  background: var(--internal-panel-bg-hover, #eef3f8) !important;
}
</style>
