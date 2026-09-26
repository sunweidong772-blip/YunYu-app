// 主题 store：浅色 / 深色 / 跟随系统
import { defineStore } from 'pinia'

const THEME_KEY = 'yunyu_theme'

function applyTheme(mode) {
  const d = mode === 'system'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode
  document.documentElement.setAttribute('data-theme', d)
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem(THEME_KEY) || 'system',
  }),
  actions: {
    init() {
      applyTheme(this.mode)
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (this.mode === 'system') applyTheme('system')
        })
      }
    },
    setMode(mode) {
      this.mode = mode
      localStorage.setItem(THEME_KEY, mode)
      applyTheme(mode)
    },
  },
})