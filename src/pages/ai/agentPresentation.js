const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const unpack = (value) => {
  if (typeof value !== 'string') return value
  const text = value.trim()
  if (!text.startsWith('{') && !text.startsWith('[')) return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const readAgentResult = (content) => {
  if (isRecord(content)) return content
  if (typeof content !== 'string') return null
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  const result = unpack(content.slice(start, end + 1))
  return isRecord(result) ? result : null
}

const readList = (value) => {
  const parsed = unpack(value)
  if (Array.isArray(parsed)) return parsed.flatMap(readList)
  if (parsed == null || parsed === '') return []
  return [parsed]
}

const readText = (value) => {
  const parsed = unpack(value)
  if (parsed == null) return ''
  if (Array.isArray(parsed)) return parsed.map(readText).filter(Boolean).join('；')
  if (!isRecord(parsed)) return String(parsed).trim()

  const descriptiveValues = ['label', 'value', 'title', 'name', 'summary', 'content', 'reason', 'description']
    .map(key => parsed[key])
    .filter(item => typeof item === 'string' || typeof item === 'number')
  if (descriptiveValues.length) return descriptiveValues.slice(0, 2).map(readText).filter(Boolean).join('：')
  return Object.entries(parsed)
    .filter(([, item]) => typeof item === 'number' || typeof item === 'string')
    .slice(0, 3)
    .map(([key, item]) => `${key}：${item}`)
    .join('，')
}

const readTextList = value => readList(value).map(readText).filter(Boolean)
const readBody = value => typeof value === 'string' ? value.trim() : readText(value)

const messageRole = message => String(message?.role || '').trim().toLowerCase()
export const isUserMessage = message => messageRole(message) === 'user'
export const isAssistantMessage = message => ['assistant', 'ai', 'agent'].includes(messageRole(message))

export const messageBody = (message) => {
  const content = message?.content ?? message?.reply ?? message?.rawContent ?? ''
  if (typeof content === 'string') return content
  return content && typeof content === 'object' ? JSON.stringify(content) : ''
}

export const userGoal = (message) => {
  const content = messageBody(message)
  const coachPrefix = '当前用户目标：'
  const coachSuffix = '\n请你作为 halo 刷题网的学习规划 Agent'
  const coachEnd = content.indexOf(coachSuffix)
  if (content.startsWith(coachPrefix) && coachEnd > coachPrefix.length) {
    return content.slice(coachPrefix.length, coachEnd).trim()
  }
  const studyPrefix = '用户当前目标或问题：'
  const studyStart = content.indexOf(studyPrefix)
  if (studyStart >= 0) {
    return content.slice(studyStart + studyPrefix.length).split('\n')[0].trim() || content
  }
  return content
}

export const coachScope = (message) => {
  if (message?.scope) return message.scope
  const content = messageBody(message)
  if (!content.includes('\n请你作为 halo 刷题网的学习规划 Agent')) return ''
  const range = /\n分析范围：最近 (\d+) 天/.exec(content)?.[1]
  const subject = /\n重点关注题型：([^。\n]+)/.exec(content)?.[1]
  return [range ? `近 ${range} 天` : '', subject].filter(Boolean).join(' / ')
}

export const runResultBody = (packet) => {
  if (isRecord(packet?.structuredResult)) return JSON.stringify(packet.structuredResult)
  return [packet?.rawContent, packet?.content, packet?.reply]
    .find(value => typeof value === 'string' && value.trim()) || ''
}

export const formatAgentTime = (message) => {
  const value = message?.timestamp ?? message?.createdAt ?? message?.createdTime
  if (!value) return ''
  const time = new Date(value)
  if (Number.isNaN(time.getTime())) return ''
  return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const reportFields = ['reply', 'overview', 'diagnosis', 'recommendations', 'nextPlan', 'weakPoints', 'dataBasis', 'evidence', 'citedKnowledge', 'recommendedQuestions', 'plan', 'nextActions', 'confidence']

const readKnownReport = (content) => {
  const result = readAgentResult(content)
  if (!result) return null
  return Object.keys(result).length === 0 || reportFields.some(key => Object.hasOwn(result, key)) ? result : null
}

export const readCoachReview = (content) => {
  const result = readKnownReport(content)
  if (!result) return { summary: readBody(content), diagnosis: '', overview: '', confidence: '', weakPoints: [], recommendations: [], plan: [], questions: [], dataBasis: [] }
  const summary = readBody(result.reply)
  const diagnosis = readBody(result.diagnosis)
  const overview = readBody(result.overview)
  return {
    summary,
    diagnosis: diagnosis === summary ? '' : diagnosis,
    overview: overview === summary || overview === diagnosis ? '' : overview,
    weakPoints: readTextList(result.weakPoints),
    recommendations: readTextList(result.recommendations),
    plan: readTextList(result.nextPlan),
    questions: readTextList(result.recommendedQuestions),
    dataBasis: readTextList(result.dataBasis),
    confidence: readText(result.confidence)
  }
}

const questionTypes = new Map([['0', '综合'], ['1', '单选'], ['2', '多选'], ['3', '判断'], ['4', '简答']])

const formatQuestionType = (value) => {
  const name = readText(value)
  return questionTypes.get(name) || name || '练习题'
}

const inferActionPath = (label) => {
  if (/历史|复盘/.test(label)) return '/practice-history'
  if (/题库|选题|刷题|练习|做题/.test(label)) return '/home/questions'
  if (/博客|文章/.test(label)) return '/blog/list'
  if (/社区|讨论/.test(label)) return '/community'
  return ''
}

const normalizeEvidence = (value) => readList(value).map((item, index) => {
  if (!isRecord(item)) return { label: '', value: readText(item) }
  return {
    label: readText(item.label || item.name || item.title) || `依据 ${index + 1}`,
    value: readText(item.value ?? item.summary ?? item.content ?? item)
  }
}).filter(item => item.value)

const normalizeQuestions = (value) => readList(value).map((item) => {
  if (!isRecord(item)) return { title: readText(item), type: '', reason: '', path: '' }
  const id = readText(item.questionId || item.subjectId || item.id)
  return {
    title: readText(item.title || item.subjectName || item.name || item.question || item.content) || '推荐练习题',
    type: formatQuestionType(item.type ?? item.subjectType ?? item.typeName),
    reason: readText(item.reason || item.description || item.summary || item.explanation),
    path: readText(item.path || item.url) || (id ? `/practice/${encodeURIComponent(id)}` : '')
  }
}).filter(item => item.title)

const normalizeKnowledge = (value) => readList(value).map((item) => {
  if (!isRecord(item)) return { title: readText(item), source: '知识库', summary: '', path: '' }
  return {
    title: readText(item.title || item.docTitle || item.name || item.sourceTitle) || '知识资料',
    source: readText(item.source || item.sourceType || item.knowledgeBaseName) || '知识库',
    summary: readText(item.summary || item.content || item.text || item.reason),
    path: readText(item.path || item.url)
  }
}).filter(item => item.title)

const normalizePlan = (value) => readList(value).map((item, index) => {
  if (!isRecord(item)) return { day: index + 1, title: '', tasks: readTextList(item) }
  const day = Number(item.day ?? item.step)
  return {
    day: Number.isFinite(day) && day > 0 ? day : index + 1,
    title: readText(item.title || item.name),
    tasks: readTextList(item.tasks ?? item.items ?? item.actions ?? item.summary ?? item.content)
  }
}).filter(item => item.title || item.tasks.length)

const normalizeActions = (value) => readList(value).map((item) => {
  if (!isRecord(item)) {
    const label = readText(item)
    return { label, path: inferActionPath(label), description: '' }
  }
  const label = readText(item.label || item.title || item.name || item.text)
  return {
    label,
    path: readText(item.path || item.url) || inferActionPath(label),
    description: readText(item.description || item.reason || item.summary)
  }
}).filter(item => item.label)

export const readStudyReport = (content) => {
  const result = readKnownReport(content)
  if (!result) return null
  const diagnosis = unpack(result.diagnosis)
  const reply = readBody(result.reply)
  const overview = readBody(result.overview)
  const diagnosisText = isRecord(diagnosis) ? readBody(diagnosis.summary || diagnosis.value) : readBody(diagnosis)
  const summary = diagnosisText || overview
  return {
    reply: reply || overview,
    summary: summary === (reply || overview) ? '' : summary,
    level: isRecord(diagnosis) ? readText(diagnosis.level || diagnosis.status) : '',
    evidence: normalizeEvidence(readList(result.evidence).length ? result.evidence : result.dataBasis),
    questions: normalizeQuestions(result.recommendedQuestions),
    knowledge: normalizeKnowledge(result.citedKnowledge),
    plan: normalizePlan(result.plan),
    actions: normalizeActions(result.nextActions),
    confidence: readText(result.confidence)
  }
}

export const summarizeTraceObservation = (observation) => {
  const value = unpack(observation)
  if (Array.isArray(value)) return `读取了 ${value.length} 条结果。`
  if (isRecord(value)) {
    const list = value.data ?? value.result ?? value.records ?? value.list
    if (Array.isArray(list)) return `读取了 ${list.length} 条结果。`
    const total = value.total ?? value.count ?? value.totalCount
    if (typeof total === 'number') return `返回 ${total} 条结果。`
    return '返回了结构化数据。'
  }
  return readText(value).slice(0, 100)
}

export const formatTraceObservation = (observation) => {
  const value = unpack(observation)
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : readText(value)
}
