import request from './request'

/**
 * AI解析题目
 * @param {Object} data 题目信息
 * @param {String} data.subjectName 题目名称
 * @param {Integer} data.subjectType 题目类型 (1-单选, 2-多选, 3-判断, 4-简答)
 * @param {String} data.subjectParse 题目解析
 * @param {String} data.subjectAnswer 题目答案 (主要用于简答题)
 * @param {Array<SubjectAnswerDTO>} data.optionList 选择题的答案选项
 */
export function analyzeSubjectWithAI(data) {
  return request({
    url: '/openAI/deepSeek/chat',
    method: 'post',
    data: {
      message: buildAIRequestMessage(data)
    },
    timeout: 90000 // 设置90秒超时
  })
}

/**
 * 构建发送给AI的请求消息
 * @param {Object} subjectData 题目数据
 * @returns {String} 格式化的请求消息
 */
function buildAIRequestMessage(subjectData) {
  let message = `请帮我解析下面这道题目:

题目: ${subjectData.subjectName}

`
  
  // 添加选项信息（如果是选择题）
  if (subjectData.optionList && subjectData.optionList.length > 0) {
    message += "选项:\n"
    subjectData.optionList.forEach(option => {
      const optionLabel = getOptionLabel(option.optionType)
      message += `${optionLabel}. ${option.optionContent}\n`
    })
    message += "\n"
  }
  
  // 添加题目解析和答案
  if (subjectData.subjectParse) {
    message += `题目解析: ${subjectData.subjectParse}\n\n`
  }
  
  if (subjectData.subjectAnswer) {
    message += `参考答案: ${subjectData.subjectAnswer}\n\n`
  }
  
  message += "请用通俗易懂的语言详细解释这道题目的解题思路和知识点，并指出容易出错的地方。"
  
  return message
}

/**
 * 获取选项标签
 * @param {Integer} optionType 选项类型
 * @returns {String} 选项标签(A,B,C,D...)
 */
function getOptionLabel(optionType) {
  const labelMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F'
  }
  return labelMap[optionType] || ''
}