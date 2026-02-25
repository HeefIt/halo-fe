// /**
//  * AI 相关 API 接口
//  */
//
// import request from '@/utils/request'
//
// /**
//  * 发送聊天消息到AI
//  * @param {Object} data - 请求数据
//  * @param {Array} data.messages - 消息历史数组
//  * @returns {Promise} 返回Promise对象
//  */
// export function sendChatMessage(data) {
//   return request({
//     url: '/api/ai/chat',
//     method: 'post',
//     data
//   })
// }
//
// /**
//  * 获取会话历史列表
//  * @returns {Promise} 返回Promise对象
//  */
// export function getChatHistory() {
//   return request({
//     url: '/api/ai/chat/history',
//     method: 'get'
//   })
// }
//
// /**
//  * 获取指定会话的详细信息
//  * @param {String} sessionId - 会话ID
//  * @returns {Promise} 返回Promise对象
//  */
// export function getChatSession(sessionId) {
//   return request({
//     url: `/api/ai/chat/session/${sessionId}`,
//     method: 'get'
//   })
// }
//
// /**
//  * 创建新会话
//  * @param {Object} data - 请求数据
//  * @param {String} data.title - 会话标题
//  * @returns {Promise} 返回Promise对象
//  */
// export function createChatSession(data) {
//   return request({
//     url: '/api/ai/chat/session',
//     method: 'post',
//     data
//   })
// }
//
// /**
//  * 更新会话信息
//  * @param {String} sessionId - 会话ID
//  * @param {Object} data - 请求数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function updateChatSession(sessionId, data) {
//   return request({
//     url: `/api/ai/chat/session/${sessionId}`,
//     method: 'put',
//     data
//   })
// }
//
// /**
//  * 删除会话
//  * @param {String} sessionId - 会话ID
//  * @returns {Promise} 返回Promise对象
//  */
// export function deleteChatSession(sessionId) {
//   return request({
//     url: `/api/ai/chat/session/${sessionId}`,
//     method: 'delete'
//   })
// }
//
// /**
//  * 清空会话中的所有消息
//  * @param {String} sessionId - 会话ID
//  * @returns {Promise} 返回Promise对象
//  */
// export function clearChatMessages(sessionId) {
//   return request({
//     url: `/api/ai/chat/session/${sessionId}/messages`,
//     method: 'delete'
//   })
// }
//
// /**
//  * 刷题助手API - 获取题目推荐
//  * @param {Object} data - 请求数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function getPracticeRecommendation(data) {
//   return request({
//     url: '/api/ai/practice/recommend',
//     method: 'post',
//     data
//   })
// }
//
// /**
//  * 刷题助手API - 获取题目解析
//  * @param {String} questionId - 题目ID
//  * @returns {Promise} 返回Promise对象
//  */
// export function getQuestionExplanation(questionId) {
//   return request({
//     url: `/api/ai/practice/explanation/${questionId}`,
//     method: 'get'
//   })
// }
//
// /**
//  * 智能客服API - 发送客服消息
//  * @param {Object} data - 请求数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function sendCustomerServiceMessage(data) {
//   return request({
//     url: '/api/ai/customer-service',
//     method: 'post',
//     data
//   })
// }
//
// /**
//  * 多模态解析API - 上传文件并解析
//  * @param {FormData} formData - 文件表单数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function uploadAndParseFile(formData) {
//   return request({
//     url: '/api/ai/multimodal/parse',
//     method: 'post',
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
// }
//
// /**
//  * 多模态解析API - 解析图片
//  * @param {FormData} formData - 图片表单数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function parseImage(formData) {
//   return request({
//     url: '/api/ai/multimodal/image',
//     method: 'post',
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
// }
//
// /**
//  * 多模态解析API - 解析PDF
//  * @param {FormData} formData - PDF表单数据
//  * @returns {Promise} 返回Promise对象
//  */
// export function parsePDF(formData) {
//   return request({
//     url: '/api/ai/multimodal/pdf',
//     method: 'post',
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
// }
