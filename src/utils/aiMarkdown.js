import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }) {
      const normalizedLang = (lang || '').trim().toLowerCase()
      const hasLanguage = normalizedLang && hljs.getLanguage(normalizedLang)
      const languageLabel = hasLanguage ? normalizedLang : (normalizedLang || 'text')
      const highlightedCode = hasLanguage
        ? hljs.highlight(text, { language: normalizedLang }).value
        : escapeHtml(text)

      return `
        <div class="ai-markdown__code-block">
          <div class="ai-markdown__code-head">
            <span>${languageLabel}</span>
          </div>
          <pre class="ai-markdown__pre"><code class="hljs ai-markdown__code language-${languageLabel}">${highlightedCode}</code></pre>
        </div>
      `
    }
  }
})

/**
 * 统一处理 AI Markdown 输出，兼顾语法高亮与 XSS 清洗。
 * @param {string} content AI 返回内容
 * @returns {string} 安全 HTML
 */
export function renderAiMarkdown(content) {
  if (!content) {
    return ''
  }
  return DOMPurify.sanitize(marked.parse(content))
}
