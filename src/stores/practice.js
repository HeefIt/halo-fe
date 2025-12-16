import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePracticeStore = defineStore('practice', () => {
  // 当前题目列表
  const problemList = ref([])
  
  // 当前题目在列表中的索引
  const currentProblemIndex = ref(-1)
  
  // 当前题目ID
  const currentProblemId = computed(() => {
    if (currentProblemIndex.value >= 0 && currentProblemIndex.value < problemList.value.length) {
      return problemList.value[currentProblemIndex.value].id
    }
    return null
  })
  
  // 是否有上一题
  const hasPrevProblem = computed(() => currentProblemIndex.value > 0)
  
  // 是否有下一题
  const hasNextProblem = computed(() => currentProblemIndex.value < problemList.value.length - 1)
  
  // 设置题目列表
  const setProblemList = (problems) => {
    problemList.value = problems
  }
  
  // 设置当前题目ID
  const setCurrentProblemId = (problemId) => {
    const index = problemList.value.findIndex(p => p.id === problemId)
    if (index !== -1) {
      currentProblemIndex.value = index
    }
  }
  
  // 获取下一题的ID
  const getNextProblemId = () => {
    if (hasNextProblem.value) {
      return problemList.value[currentProblemIndex.value + 1].id
    }
    return null
  }
  
  // 获取上一题的ID
  const getPrevProblemId = () => {
    if (hasPrevProblem.value) {
      return problemList.value[currentProblemIndex.value - 1].id
    }
    return null
  }
  
  // 移动到下一题
  const moveToNext = () => {
    if (hasNextProblem.value) {
      currentProblemIndex.value++
      return true
    }
    return false
  }
  
  // 移动到上一题
  const moveToPrev = () => {
    if (hasPrevProblem.value) {
      currentProblemIndex.value--
      return true
    }
    return false
  }
  
  // 清除题目列表
  const clearProblemList = () => {
    problemList.value = []
    currentProblemIndex.value = -1
  }
  
  return {
    // 状态
    problemList,
    currentProblemIndex,
    // 计算属性
    currentProblemId,
    hasPrevProblem,
    hasNextProblem,
    // 方法
    setProblemList,
    setCurrentProblemId,
    getNextProblemId,
    getPrevProblemId,
    moveToNext,
    moveToPrev,
    clearProblemList
  }
})
