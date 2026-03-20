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
import { ref, watch, computed } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import { ElMessage } from 'element-plus'
import request from '@/api/http'

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
const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

watch(content, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
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
    'wordcount', 'codesample', 'quickbars', 'emoticons'
  ],
  toolbar: [
    'undo redo | formatselect | bold italic underline strikethrough |',
    'alignleft aligncenter alignright alignjustify |',
    'bullist numlist outdent indent | link image media |',
    'codesample code | removeformat | help'
  ].join(' '),
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  quickbars_insert_toolbar: 'quickimage quicktable',
  toolbar_mode: 'sliding',
  toolbar_sticky: true,
  toolbar_sticky_offset: 60,
  
  branding: false,
  promotion: false,
  
  content_style: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #1a1a1a;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    p { margin-bottom: 16px; }
    code {
      padding: .2em .4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27,31,35,.05);
      border-radius: 3px;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      padding: 0 1em;
      color: #6a737d;
      border-left: .25em solid #dfe2e5;
      margin: 0 0 16px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    table th, table td {
      padding: 12px 13px;
      border: 1px solid #dfe2e5;
    }
    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    ul, ol {
      padding-left: 2em;
      margin-bottom: 16px;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `,
  
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
    editor.on('blur', () => {
      emit('blur')
    })
  }
}))

const handleInit = (evt, editor) => {
  console.log('TinyMCE editor initialized', editor)
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
      return response.data.url
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
        callback(response.data.url, { alt: file.name })
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      ElMessage.error('图片上传失败：' + error.message)
    }
  }
  
  input.click()
}
</script>

<style scoped>
.rich-editor {
  width: 100%;
}

.rich-editor :deep(.tox-tinymce) {
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 12px;
  overflow: hidden;
}

.rich-editor :deep(.tox-toolbar__primary) {
  background: var(--color-bg-subtle, #f9fafb);
  border-bottom: 1px solid var(--color-border, #d1d5db);
}

.rich-editor :deep(.tox-edit-area) {
  background: var(--color-bg-elevated, #ffffff);
}

.rich-editor :deep(.tox-statusbar) {
  background: var(--color-bg-subtle, #f9fafb);
  border-top: 1px solid var(--color-border, #d1d5db);
}

.rich-editor :deep(.tox .tox-button) {
  background-color: var(--color-accent, #3b82f6);
}

.rich-editor :deep(.tox .tox-button:hover) {
  background-color: var(--color-accent, #2563eb);
}

.rich-editor :deep(.tox .tox-button--secondary) {
  background-color: var(--color-bg-subtle, #f3f4f6);
  color: var(--color-text, #111827);
}

.rich-editor :deep(.tox .tox-button--secondary:hover) {
  background-color: var(--color-bg-muted, #e5e7eb);
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
</style>
