<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import TabBar from '@/components/TabBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
let evtSource = null

// ---- 埋点系统 ----
const sessionId = 'ses_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
let lastPath = ''

function trackEvent(eventName, payload = {}) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/events/track', JSON.stringify({
      event_type: 'click',
      event_name: eventName,
      session_id: sessionId,
      payload,
    }))
  } else {
    api.trackEvent({
      event_type: 'click',
      event_name: eventName,
      session_id: sessionId,
      payload,
    }).catch(() => {})
  }
}

function trackPageView(path) {
  const payload = { path, title: document.title }
  api.trackEvent({
    event_type: 'page_view',
    event_name: 'page_view',
    session_id: sessionId,
    payload,
  }).catch(() => {})
}

watch(() => route.path, (path) => {
  if (path && path !== lastPath) {
    lastPath = path
    trackPageView(path)
  }
})

function startSSE() {
  if (!userStore.token) return
  if (evtSource) { evtSource.close(); evtSource = null }
  evtSource = new EventSource('/api/events?token=' + encodeURIComponent(userStore.token))
  evtSource.addEventListener('notification', (e) => {
    try {
      const data = JSON.parse(e.data)
      userStore.setUnread((data.unread != null) ? data.unread : (userStore.unreadCount + 1))
    } catch (err) { /* ignore */ }
  })
  evtSource.addEventListener('message', (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data && data.conversationId) {
        api.conversations().catch(() => {})
      }
    } catch (err) { /* ignore */ }
  })
  evtSource.onerror = () => {
    if (evtSource) { evtSource.close(); evtSource = null }
  }
}

function stopSSE() {
  if (evtSource) { evtSource.close(); evtSource = null }
}

onMounted(() => {
  if (userStore.token) startSSE()
  // 记录首屏
  if (route.path) {
    lastPath = route.path
    trackPageView(route.path)
  }
  // 全局错误上报
  window.addEventListener('error', reportError)
  window.addEventListener('unhandledrejection', reportRejection)
})

onBeforeUnmount(() => {
  stopSSE()
  window.removeEventListener('error', reportError)
  window.removeEventListener('unhandledrejection', reportRejection)
})

function reportError(e) {
  const payload = {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: (e.error && e.error.stack) ? e.error.stack.slice(0, 500) : '',
  }
  api.trackEvent({
    event_type: 'js_error',
    event_name: 'window_onerror',
    session_id: sessionId,
    payload,
  }).catch(() => {})
}

function reportRejection(e) {
  const payload = {
    reason: (e.reason && e.reason.stack) ? e.reason.stack.slice(0, 500) : String(e.reason),
  }
  api.trackEvent({
    event_type: 'js_error',
    event_name: 'unhandledrejection',
    session_id: sessionId,
    payload,
  }).catch(() => {})
}

watch(() => userStore.token, (token) => {
  if (token) startSSE()
  else stopSSE()
})
</script>

<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <TabBar v-if="route.meta && route.meta.tab" />
  </div>
</template>

<style>
.app-shell { min-height: 100%; }
</style>