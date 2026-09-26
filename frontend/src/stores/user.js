// 用户 store：登录态、资料、未读数轮询
import { defineStore } from 'pinia'
import { api } from '@/api'
import { getToken, setToken, setUnauthorizedHandler } from '@/api/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    profile: null,
    admin: null,          // { title, roleCode, roleName }
    checkedToday: false,
    unreadCount: 0,
    loading: false,
    initialized: false,
  }),
  getters: {
    isLogin: (s) => !!s.token,
    isAdmin: (s) => !!s.admin,
    isOwner: (s) => (s.admin ? s.admin.roleCode === 'owner' : false),
    mustChangePassword: (s) => !!s.profile && s.profile.must_change_password,
  },
  actions: {
    init() {
      setUnauthorizedHandler(() => this.clear())
      if (this.token) this.fetchMe()
      this.initialized = true
    },
    async fetchMe() {
      if (!this.token) return
      this.loading = true
      try {
        const data = await api.me()
        this.profile = data
        this.admin = data.admin || null
        this.checkedToday = !!data.checkedToday
        this.unreadCount = data.unreadCount || 0
      } catch (e) {
        if (e.message.includes('登录已过期') || e.message.includes('请先登录')) this.clear()
      } finally {
        this.loading = false
      }
    },
    async login(email, password) {
      const data = await api.login(email, password)
      this.token = data.token
      setToken(data.token)
      // 先落一份基础资料（登录响应的 publicUser）
      this.profile = { ...(data.user || {}), must_change_password: data.mustChangePassword ? 1 : 0 }
      this.admin = (data.user && data.user.admin) || null
      // 拉取 /api/users/me 完整资料（admin / checkedToday / unreadCount / followCount）
      try { await this.fetchMe() } catch (e) { /* 静默 */ }
      // fetchMe 用 /me 覆盖了 profile，需要把 must_change_password 合并回去
      if (this.profile) this.profile.must_change_password = data.mustChangePassword ? 1 : 0
      return this.profile
    },
    async refreshUnread() {
      if (!this.token) return
      try {
        const d = await api.unreadSummary()
        this.unreadCount = (d && d.unread) || 0
      } catch (e) { /* 静默 */ }
    },
    setCheckedToday(v) { this.checkedToday = v },
    setUnread(n) { this.unreadCount = n },
    applyProfile(patch) {
      if (this.profile) this.profile = { ...this.profile, ...patch }
      if (patch.checkedToday !== undefined) this.checkedToday = patch.checkedToday
    },
    clear() {
      this.token = ''
      this.profile = null
      this.admin = null
      this.checkedToday = false
      this.unreadCount = 0
      setToken('')
    },
  },
})