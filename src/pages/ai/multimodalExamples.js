export const imageExamples = [
  {
    mode: 'question',
    label: 'Java 题目',
    lines: ['哪种 List 更适合频繁按下标读取？', 'A. ArrayList', 'B. LinkedList'],
    result: '### 题目\n哪种 List 更适合频繁按下标读取？\n\n### 参考答案\n**A. ArrayList**。它的底层是数组，按下标读取的时间复杂度为 O(1)；LinkedList 通常需要沿链表遍历。'
  },
  {
    mode: 'code',
    label: '代码截图',
    lines: ['public static int max(int a, int b) {', '    return a >= b ? a : b;', '}'],
    result: '### 识别语言\nJava\n\n### 代码\n```java\npublic static int max(int a, int b) {\n    return a >= b ? a : b;\n}\n```\n\n这段代码返回两个整数中较大的值。'
  },
  {
    mode: 'ocr',
    label: '文字截图',
    lines: ['Spring Boot 自动配置', '根据依赖和已有 Bean 判断是否启用配置。', '显式定义 Bean 可以覆盖部分默认配置。'],
    result: '### 提取的文字\n\n**Spring Boot 自动配置**\n\n根据依赖和已有 Bean 判断是否启用配置。\n\n显式定义 Bean 可以覆盖部分默认配置。'
  }
]

const generalExample = '### 图片概览示例\n图片包含标题和一组正文。通用识别的结果通常先概括内容，再列出可辨认的文字或关键区域。\n\n演示以外的图片内容不会被识别。'

export const getExampleOutput = (mode) => {
  return imageExamples.find(example => example.mode === mode)?.result || generalExample
}

const escapeXml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export const createExampleImageUrl = (example) => {
  const fontFamily = example.mode === 'code' ? 'Consolas, monospace' : 'Microsoft YaHei, sans-serif'
  const lines = example.lines.map((line, index) => {
    const text = line.trimStart()
    const x = 38 + (line.length - text.length) * 12
    return `<text x="${x}" y="${119 + index * 35}">${escapeXml(text)}</text>`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="238" viewBox="0 0 620 238">
    <rect width="620" height="238" rx="10" fill="#fff"/>
    <path d="M0 70h620" stroke="#dce4ef"/>
    <text x="38" y="45" fill="#174ea6" font-size="21" font-weight="bold" font-family="Microsoft YaHei, sans-serif">${escapeXml(example.label)}</text>
    <g fill="#111827" font-family="${fontFamily}" font-size="21" xml:space="preserve">${lines}</g>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
