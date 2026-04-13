import { computed } from 'vue'

const DEFAULT_LABEL = '返回上一页'

function normalizeBackTarget(value) {
  if (typeof value !== 'string') return ''
  const target = value.trim()
  return target.startsWith('/') ? target : ''
}

function resolveBackLabel(target, fallback) {
  const reference = target || fallback || ''

  if (reference.startsWith('/blog/article/')) {
    return '返回文章详情'
  }
  if (reference.startsWith('/blog/list')) {
    return '返回文章列表'
  }
  if (reference === '/blog' || reference.startsWith('/blog?')) {
    return '返回博客首页'
  }
  if (reference.startsWith('/profile/')) {
    return '返回用户主页'
  }

  return DEFAULT_LABEL
}

export function useSmartBack(route, router, options = {}) {
  const fallback = options.fallback || '/home'

  const explicitBackTarget = computed(() => {
    const target = normalizeBackTarget(route.query?.back)
    if (!target || target === route.fullPath) {
      return ''
    }
    return target
  })

  const backLabel = computed(() => resolveBackLabel(explicitBackTarget.value, fallback))

  const goBack = () => {
    if (explicitBackTarget.value) {
      router.push(explicitBackTarget.value)
      return
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallback)
  }

  return {
    backLabel,
    goBack,
    explicitBackTarget
  }
}

