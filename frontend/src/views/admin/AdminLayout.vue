<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const drawerOpen = ref(false)
const adminMe = ref(null)

const menus = [
  { path: '/admin', icon: '📊', label: '数据看板' },
  { path: '/admin/users', icon: '👥', label: '用户管理' },
  { path: '/admin/posts', icon: '📝', label: '帖子管理' },
  { path: '/admin/comments', icon: '💬', label: '评论管理' },
  { path: '/admin/topics', icon: '🏷️', label: '话题管理' },
  { path: '/admin/software', icon: '📦', label: '软件管理' },
  { path: '/admin/categories', icon: '🗂️', label: '软件分类' },
  { path: '/admin/collections', icon: '💎', label: '软件合集' },
  { path: '/admin/u-collections', icon: '📚', label: '用户专题' },
  { path: '/admin/reports', icon: '🚩', label: '举报管理' },
  { path: '/admin/announcements', icon: '📢', label: '公告管理' },
  { path: '/admin/checkins', icon: '📅', label: '签到管理' },
  { path: '/admin/tasks', icon: '🎯', label: '任务管理' },
  { path: '/admin/admins', icon: '🛡️', label: '管理员' },
  { path: '/admin/roles', icon: '🔑', label: '角色权限' },
  { path: '/admin/email', icon: '✉️', label: '邮箱配置' },
  { path: '/admin/settings', icon: '⚙️', label: '系统设置' },
  { path: '/admin/logs', icon: '📋', label: '操作日志' },
]

const cur = computed(() => menus.find((m) => route.path === m.path || (m.path !== '/admin' && route.path.startsWith(m.path))))

onMounted(async () => {
  userStore.fetchMe()
  try {
    adminMe.value = await api.admin.me()
  } catch (e) { /* 静默 */ }
})

async function logout() {
  const ok = await confirmDialog('退出登录', '确定退出管理后台吗？')
  if (!ok) return
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="admin-wrap">
    <!-- 侧边栏（桌面） -->
    <aside class="admin-side">
      <div class="as-logo">
        <span class="as-logo-icon">☁️</span>
        <div>
          <b>云屿管理台</b>
          <span class="as-sub">YunYu Admin</span>
        </div>
      </div>
      <nav class="as-nav">
        <div v-for="m in menus" :key="m.path" class="as-item" :class="{ on: route.path === m.path || (m.path !== '/admin' && route.path.startsWith(m.path)) }" @click="router.push(m.path)">
          <span class="as-icon">{{ m.icon }}</span>
          <span>{{ m.label }}</span>
        </div>
      </nav>
      <div class="as-foot">
        <div class="as-user">
          <span class="as-avatar">{{ (adminMe && adminMe.nickname || '').charAt(0) || '管' }}</span>
          <div class="as-uin">
            <b>{{ adminMe ? adminMe.nickname : '' }}</b>
            <span class="as-role">{{ adminMe ? (adminMe.isOwner ? '云屿岛主 · ' + adminMe.title : adminMe.title) : '' }}</span>
          </div>
        </div>
        <button class="btn btn-outline btn-sm as-logout" @click="logout">退出</button>
      </div>
    </aside>

    <!-- 移动端顶部 -->
    <header class="admin-top">
      <button class="at-menu" @click="drawerOpen = true">☰</button>
      <span class="at-title">{{ (cur && cur.label) || '管理后台' }}</span>
      <span class="at-home" @click="router.push('/home')">前台</span>
    </header>

    <!-- 移动端抽屉 -->
    <div v-if="drawerOpen" class="drawer-mask" @click="drawerOpen = false"></div>
    <aside class="admin-drawer" :class="{ open: drawerOpen }">
      <div class="ad-head">
        <b>云屿管理台</b>
        <button class="ad-close" @click="drawerOpen = false">✕</button>
      </div>
      <div class="ad-item" v-for="m in menus" :key="m.path" :class="{ on: route.path === m.path || (m.path !== '/admin' && route.path.startsWith(m.path)) }" @click="router.push(m.path); drawerOpen = false">
        <span class="as-icon">{{ m.icon }}</span>{{ m.label }}
      </div>
      <button class="btn btn-outline btn-sm ad-logout" @click="logout">退出登录</button>
    </aside>

    <!-- 内容区 -->
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-wrap { min-height: 100vh; display: flex; background: var(--bg); }

.admin-side { width: 230px; background: var(--card); border-right: 1px solid var(--divider); display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; z-index: 20; }
.as-logo { display: flex; gap: 10px; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--divider); }
.as-logo-icon { width: 38px; height: 38px; line-height: 38px; text-align: center; border-radius: 12px; background: var(--brand-grad); font-size: 20px; }
.as-logo b { display: block; font-size: var(--fs-15); }
.as-sub { font-size: var(--fs-10); color: var(--text-3); }
.as-nav { flex: 1; overflow-y: auto; padding: 10px; }
.as-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; font-size: var(--fs-13); color: var(--text-2); cursor: pointer; }
.as-item:hover { background: var(--card-2); }
.as-item.on { background: var(--brand-soft); color: var(--brand); font-weight: 700; }
.as-icon { font-size: 15px; width: 20px; text-align: center; }
.as-foot { padding: 14px; border-top: 1px solid var(--divider); display: flex; align-items: center; gap: 10px; }
.as-user { flex: 1; display: flex; gap: 8px; align-items: center; min-width: 0; }
.as-avatar { width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: var(--r-full); background: var(--brand-grad); color: #fff; font-weight: 700; flex-shrink: 0; }
.as-uin { min-width: 0; }
.as-uin b { display: block; font-size: var(--fs-13); }
.as-role { font-size: var(--fs-10); color: var(--text-3); }
.as-logout { height: 30px; font-size: var(--fs-11); padding: 0 10px; }

.admin-top { display: none; position: sticky; top: 0; z-index: 30; height: 52px; align-items: center; gap: 10px; padding: 0 14px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--divider); }
.at-menu { font-size: 20px; padding: 4px; }
.at-title { flex: 1; text-align: center; font-weight: 700; }
.at-home { font-size: var(--fs-13); color: var(--brand); }

.drawer-mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 40; }
.admin-drawer { position: fixed; top: 0; bottom: 0; left: 0; width: 76vw; max-width: 300px; background: var(--card); z-index: 41; padding: 16px; transform: translateX(-100%); transition: transform .25s ease; overflow-y: auto; }
.admin-drawer.open { transform: none; }
.ad-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--divider); }
.ad-head b { font-size: var(--fs-16); }
.ad-close { font-size: 18px; padding: 2px 6px; }
.ad-item { display: flex; align-items: center; gap: 10px; padding: 12px 10px; border-radius: 10px; font-size: var(--fs-14); }
.ad-item.on { background: var(--brand-soft); color: var(--brand); font-weight: 700; }
.ad-logout { margin-top: 20px; }

.admin-main { flex: 1; margin-left: 230px; padding: 20px; max-width: 1200px; width: calc(100% - 230px); }

@media (max-width: 860px) {
  .admin-side { display: none; }
  .admin-top { display: flex; }
  .admin-main { margin-left: 0; width: 100%; padding: 12px; }
}
</style>