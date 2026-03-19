import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'halo_theme_preference'
const THEME_OPTIONS = ['light', 'dark', 'system']

/**
 * 主题状态仓库
 * 负责管理用户的主题偏好，并将最终主题同步到 html[data-theme]。
 */
export const useThemeStore = defineStore('theme', () => {
  const themePreference = ref(readThemePreference())
  const resolvedTheme = ref('light')
  const initialized = ref(false)

  /**
   * 判断当前最终生效的是否为深色主题。
   */
  const isDark = computed(() => resolvedTheme.value === 'dark')

  /**
   * 初始化主题状态。
   * 在应用启动时执行一次，保证页面刷新后仍能维持用户上次选择的主题。
   */
  const initTheme = () => {
    if (initialized.value || typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = () => {
      if (themePreference.value === 'system') {
        applyResolvedTheme(resolveTheme(mediaQuery.matches))
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleThemeChange)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleThemeChange)
    }

    applyResolvedTheme(resolveTheme(mediaQuery.matches))
    initialized.value = true
  }

  /**
   * 更新主题偏好。
   * 支持浅色、深色和跟随系统三种模式。
   */
  const setThemePreference = (nextTheme) => {
    if (!THEME_OPTIONS.includes(nextTheme)) {
      return
    }

    themePreference.value = nextTheme
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyResolvedTheme(resolveTheme(prefersDark))
  }

  /**
   * 根据用户偏好和系统主题，得到最终要应用到页面上的主题。
   */
  const resolveTheme = (prefersDark) => {
    if (themePreference.value === 'system') {
      return prefersDark ? 'dark' : 'light'
    }
    return themePreference.value
  }

  /**
   * 将最终主题写入到 html 标签，供全局 CSS 变量直接消费。
   */
  const applyResolvedTheme = (nextTheme) => {
    resolvedTheme.value = nextTheme

    const root = document.documentElement
    root.setAttribute('data-theme', nextTheme)
    root.style.colorScheme = nextTheme
  }

  return {
    themePreference,
    resolvedTheme,
    isDark,
    initTheme,
    setThemePreference
  }
})

function readThemePreference() {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return THEME_OPTIONS.includes(savedTheme) ? savedTheme : 'system'
}
