<script setup>
import { useUserStore } from '@/stores/user'
const user = useUserStore()
</script>

<template>
  <nav class="tabbar">
    <router-link class="tabbar-item" :class="{ active: $route.path.startsWith('/home') }" to="/home">
      <span class="tabbar-dot" v-if="false"></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M3 10.5 12 3l9 7.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 9.5V21h14V9.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 21v-6h6v6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>首页</span>
    </router-link>
    <router-link class="tabbar-item" :class="{ active: $route.path.startsWith('/community') }" to="/community">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="9"/>
        <path d="M8 12h8M12 8v8" stroke-linecap="round"/>
      </svg>
      <span>社区</span>
    </router-link>
    <router-link class="tabbar-item" :class="{ active: $route.path.startsWith('/software') }" to="/software">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="4" y="4" width="7" height="7" rx="2"/>
        <rect x="13" y="4" width="7" height="7" rx="2"/>
        <rect x="4" y="13" width="7" height="7" rx="2"/>
        <rect x="13" y="13" width="7" height="7" rx="2"/>
      </svg>
      <span>软件</span>
    </router-link>
    <router-link class="tabbar-item" :class="{ active: $route.path.startsWith('/messages') }" to="/messages">
      <span class="tabbar-dot" v-if="user.unreadCount > 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 6h16v11H8l-4 3V6z" stroke-linejoin="round"/>
          <path d="M8 10h8M8 13h5" stroke-linecap="round"/>
        </svg>
      </span>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 6h16v11H8l-4 3V6z" stroke-linejoin="round"/>
        <path d="M8 10h8M8 13h5" stroke-linecap="round"/>
      </svg>
      <span>消息</span>
    </router-link>
    <router-link class="tabbar-item" :class="{ active: $route.path.startsWith('/mine') }" to="/mine">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke-linecap="round"/>
      </svg>
      <span>我的</span>
    </router-link>
  </nav>
</template>