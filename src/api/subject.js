import request from './request'

/**
 * 分页查询题目信息（面向管理员）
 * @param {Object} params 查询参数
 * @param {Integer} params.pageNum 当前页码，默认值为1
 * @param {Integer} params.pageSize 每页记录数，默认值为10
 * @param {String} params.subjectName 题目名称（模糊查询）
 * @param {Integer} params.subjectDifficult 题目难度(1,简单,2中等,3困难)
 * @param {Integer} params.subjectType 题目类型（1单选 2多选 3判断 4简答）
 * @param {Integer} params.categoryId 分类ID
 */
export function getSubjects(params) {
  return request({
    url: '/subject/info/selectPageToUser',
    method: 'get',
    params
  })
}

/**
 * 分页查询题目信息（面向用户）
 * @param {Object} params 查询参数
 * @param {Integer} params.pageNum 当前页码，默认值为1
 * @param {Integer} params.pageSize 每页记录数，默认值为10
 * @param {String} params.subjectName 题目名称（模糊查询）
 * @param {Integer} params.subjectDifficult 题目难度(1,简单,2中等,3困难)
 * @param {Integer} params.subjectType 题目类型（1单选 2多选 3判断 4简答）
 * @param {Integer} params.categoryId 分类ID
 * @param {Array<Integer>} params.labelIds 标签ID列表
 */
export function getSubjectsForUser(params) {
  return request({
    url: '/subject/info/selectPageToUser',
    method: 'get',
    params
  })
}

/**
 * 查询题目详情
 * @param {Integer} id 题目ID
 */
export function getSubjectInfo(id) {
  return request({
    url: '/subject/info/selectSubjectInfo',
    method: 'get',
    params: { id }
  })
}

/**
 * 保存刷题记录
 * @param {Object} data 刷题记录数据
 * @param {Long} data.userId 用户ID
 * @param {Long} data.subjectId 题目ID
 * @param {String} data.userAnswer 用户答案
 * @param {Integer} data.isCorrect 是否正确(0:错误,1:正确)
 * @param {Date} data.answerTime 答题时间
 * @param {Integer} data.timeCost 答题耗时(秒)
 * @param {Integer} data.score 题目得分
 */
export function savePracticeRecord(data) {
  return request({
    url: '/subject/record/SaveRecord',
    method: 'post',
    data
  })
}

/**
 * 获取用户答题记录
 * @param {Long} userId 用户ID
 */
export function getPracticeRecordsByUser(userId) {
  return request({
    url: '/subject/record/getRecordByUser',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取题目答题记录
 * @param {Long} subjectId 题目ID
 */
export function getPracticeRecordsBySubject(subjectId) {
  return request({
    url: '/subject/record/getRecordBySubject',
    method: 'get',
    params: { subjectId }
  })
}

/**
 * 获取网站统计信息
 */
export function getStatistics() {
  return request({
    url: '/statistics/getStatistics',
    method: 'get'
  })
}

/**
 * 获取用户当日刷题统计
 * @param {Long} userId 用户ID
 * @param {Date} date 日期（可选）
 */
export function getDailyStatistics(userId, date) {
  return request({
    url: '/statistics/getDailyStatistics',
    method: 'get',
    params: { userId, date }
  })
}

/**
 * 获取用户增长趋势数据
 * @param {Integer} days 天数（7或30）
 */
export function getUserGrowthTrend(days = 7) {
  return request({
    url: '/statistics/getUserGrowthTrend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取题目提交趋势数据
 * @param {Integer} days 天数（7或30）
 */
export function getSubmissionTrend(days = 7) {
  return request({
    url: '/statistics/getSubmissionTrend',
    method: 'get',
    params: { days }
  })
}

/**
 * 新增题目
 * @param {Object} data 题目信息
 * @param {String} data.subjectName 题目名称
 * @param {Integer} data.subjectDifficult 题目难度 (1-简单, 2-中等, 3-困难)
 * @param {String} data.settleName 出题人名
 * @param {Integer} data.subjectType 题目类型 (1-单选, 2-多选, 3-判断, 4-简答)
 * @param {Integer} data.subjectScore 题目分数
 * @param {String} data.subjectParse 题目解析
 * @param {String} data.subjectAnswer 题目答案 (主要用于简答题)
 * @param {Array<Integer>} data.categoryIds 分类ID列表
 * @param {Array<Integer>} data.labelIds 标签ID列表
 * @param {Array<SubjectAnswerDTO>} data.optionList 选择题的答案选项
 */
/**
 * 编辑题目
 * @param {Object} data 题目信息
 * @param {Integer} data.id 题目ID
 * @param {String} data.subjectName 题目名称
 * @param {Integer} data.subjectDifficult 题目难度 (1-简单, 2-中等, 3-困难)
 * @param {String} data.settleName 出题人名
 * @param {Integer} data.subjectType 题目类型 (1-单选, 2-多选, 3-判断, 4-简答)
 * @param {Integer} data.subjectScore 题目分数
 * @param {String} data.subjectParse 题目解析
 * @param {String} data.subjectAnswer 题目答案 (主要用于简答题)
 * @param {Array<Integer>} data.categoryIds 分类ID列表
 * @param {Array<Integer>} data.labelIds 标签ID列表
 * @param {Array<SubjectAnswerDTO>} data.optionList 选择题的答案选项
 */
export function updateSubject(data) {
  return request({
    url: '/subject/info/updateSubjectInfo',
    method: 'post',
    data
  })
}

/**
 * 删除题目
 * @param {Object} data 题目信息
 * @param {Integer} data.id 题目ID
 */
export function deleteSubject(data) {
  return request({
    url: '/subject/info/deleteSubjectInfo',
    method: 'post',
    data
  })
}

/**
 * 新增题目
 * @param {Object} data 题目信息
 * @param {String} data.subjectName 题目名称
 * @param {Integer} data.subjectDifficult 题目难度 (1-简单, 2-中等, 3-困难)
 * @param {String} data.settleName 出题人名
 * @param {Integer} data.subjectType 题目类型 (1-单选, 2-多选, 3-判断, 4-简答)
 * @param {Integer} data.subjectScore 题目分数
 * @param {String} data.subjectParse 题目解析
 * @param {String} data.subjectAnswer 题目答案 (主要用于简答题)
 * @param {Array<Integer>} data.categoryIds 分类ID列表
 * @param {Array<Integer>} data.labelIds 标签ID列表
 * @param {Array<SubjectAnswerDTO>} data.optionList 选择题的答案选项
 */
export function addSubject(data) {
  return request({
    url: '/subject/info/add',
    method: 'post',
    data
  })
}

/**
 * 获取用户已解决的题目数量
 * @param {Long} userId 用户ID
 */
export function getSolvedProblemsCount(userId) {
  return request({
    url: '/subject/record/getSolvedProblemsCount',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取用户尝试的题目数量
 * @param {Long} userId 用户ID
 */
export function getAttemptedProblemsCount(userId) {
  return request({
    url: '/subject/record/getAttemptedProblemsCount',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取排行榜列表数据
 * @param {String} timeRange 时间范围(today, week, month)
 * @param {String} rankType 排行类型(problemCount, score, correctCount)
 */
export function getRankList(timeRange, rankType) {
  return request({
    url: '/subject/record/getRankList',
    method: 'get',
    params: { timeRange, rankType }
  })
}

/**
 * 获取排行榜详情
 * @param {String} timeRange 时间范围(today, week, month)
 * @param {String} rankType 排行类型(problemCount, score, correctCount)
 * @param {Long} userId 用户ID
 */
export function getRankDetail(timeRange, rankType, userId) {
  return request({
    url: '/subject/record/getRankDetail',
    method: 'get',
    params: { timeRange, rankType, userId }
  })
}
