<script setup>
import { useUserStore } from '@/stores/user'
const user = useUserStore()

const tabs = [
  {
    path: '/home',
    label: '首页',
    icon: (active) => active
      ? '<path d="M12 2L2 9v11h8v-6h4v6h8V9L12 2z" fill="currentColor"/>'
      : '<path d="M12 2L2 9v11h8v-6h4v6h8V9L12 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
  },
  {
    path: '/community',
    label: '社区',
    icon: (active) => active
      ? '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" fill="currentColor"/>'
      : '<rect x="4" y="4" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="4" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="14" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  },
  {
    path: '/software',
    label: '软件',
    icon: (active) => active
      ? '<path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" fill="currentColor"/>'
      : '<rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  },
  {
    path: '/messages',
    label: '消息',
    icon: (active) => active
      ? '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 9h12v2H6zm0 3h8v2H6z" fill="currentColor"/>'
      : '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 9h12M6 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  },
  {
    path: '/mine',
    label: '我的',
    icon: (active) => active
      ? '<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="currentColor"/>'
      : '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  }
]
</script>

<template>
  <nav class="tabbar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      class="tabbar-item"
      :class="{ active: $route.path.startsWith(tab.path) }"
      :to="tab.path"
    >
      <div class="tabbar-icon-wrap" :class="{ dot: tab.path === '/messages' && user.unreadCount > 0 }">
        <svg viewBox="0 0 24 24" v-html="tab.icon($route.path.startsWith(tab.path))" />
      </div>
      <span>{{ tab.label }}</span>
    </router-link>
  </nav>
</template>