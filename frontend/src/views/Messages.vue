<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import Avatar from '@/components/Avatar.vue'
import Empty from '@/components/Empty.vue'
import { timeAgo } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'like', label: '点赞' },
  { key: 'comment', label: '评论' },
  { key: 'follow', label: '关注' },
  { key: 'system', label: '系统' },
]
const activeTab = ref('all')
const notifications = ref([])
const conversations = ref([])
const loading = ref(false)

async function loadNotifications(type = 'all') {
  loading.value = true
  try {
    const r = await api.notifications(type === 'all' ? '' : `?type=${type}`)
    notifications.value = r.list || r || []
    if (Array.isArray(r)) notifications.value = r
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

async function loadConversations() {
  try {
    const r = await api.conversations()
    conversations.value = r.list || r || []
    if (Array.isArray(r)) conversations.value = r
  } catch (e) { /* 静默 */ }
}

function switchTab(key) {
  activeTab.value = key
  if (key === 'all') loadNotifications('all')
  else loadNotifications(key)
}

async function readAll() {
  try {
    await api.notificationReadAll()
    userStore.setUnread(0)
    loadNotifications(activeTab.value)
  } catch (e) { toast(e.message) }
}

onMounted(() => {
  loadNotifications('all')
  loadConversations()
})
</script>

<template>
  <div class="page">
    <header class="navbar">
      <div class="navbar-title">消息</div>
      <span class="navbar-side" style="text-align:right; font-size:12px; color:var(--brand)" @click="readAll">全部已读</span>
    </header>

    <div class="chips">
      <button v-for="t in tabs" :key="t.key" class="chip" :class="{ active: activeTab === t.key }" @click="switchTab(t.key)">{{ t.label }}</button>
    </div>

    <!-- 私信入口 -->
    <div class="conv-section" v-if="conversations.length">
      <div class="conv-head section-title" style="margin: 12px 16px 8px">
        <h3 style="font-size:14px">私信</h3>
        <router-link to="/messages" style="font-size:12px;color:var(--text-3)"></router-link>
      </div>
      <div class="conv-list card" style="margin:0 16px">
        <div class="conv-item" v-for="c in conversations.slice(0, 5)" :key="c.id" @click="router.push('/chat/' + (c.peer_id || c.user_id))">
          <Avatar :name="c.peer_nickname || c.nickname" :src="c.peer_avatar || c.avatar" size="m" />
          <div class="grow" style="min-width:0">
            <div class="between">
              <span class="semi">{{ c.peer_nickname || c.nickname }}</span>
              <span class="time-text">{{ timeAgo(c.last_time || c.updated_at) }}</span>
            </div>
            <div class="ellipsis" style="font-size:13px;color:var(--text-3)">{{ c.last_message || c.content || '' }}</div>
          </div>
          <span v-if="c.unread > 0" class="badge badge-danger">{{ c.unread }}</span>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin: 14px 16px 8px">
      <h3 style="font-size:14px">通知</h3>
    </div>

    <template v-if="loading && !notifications.length">
      <div class="container">
        <div class="skeleton" style="height:64px;margin-bottom:8px;border-radius:12px"></div>
        <div class="skeleton" style="height:64px;margin-bottom:8px;border-radius:12px"></div>
      </div>
    </template>
    <template v-else>
      <div class="notif-list">
        <div class="notif-item card" v-for="n in notifications" :key="n.id" @click="router.push(n.target_type === 'post' && n.target_id ? '/post/' + n.target_id : n.target_type === 'software' && n.target_id ? '/software/' + n.target_id : '/messages')">
          <div class="notif-icon" :class="n.type">
            {{ n.type === 'like' ? '👍' : n.type === 'comment' ? '💬' : n.type === 'follow' ? '➕' : n.type === 'message' ? '✉️' : '📢' }}
          </div>
          <div class="grow" style="min-width:0">
            <div class="between">
              <span class="semi" style="font-size:14px">{{ n.title || '通知' }}</span>
              <span class="time-text">{{ timeAgo(n.created_at) }}</span>
            </div>
            <div class="ellipsis" style="font-size:13px;color:var(--text-2);margin-top:2px">{{ n.content }}</div>
          </div>
        </div>
      </div>
      <Empty v-if="!notifications.length" icon="🔔" title="暂时没有新消息" desc="当有人与你互动时会出现在这里" />
    </template>
  </div>
</template>

<style scoped>
.conv-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.conv-item + .conv-item { border-top: 1px solid var(--divider); }
.notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; margin: 0 16px 10px; }
.notif-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.notif-icon.like { background: var(--danger-soft); }
.notif-icon.comment { background: var(--info-soft); }
.notif-icon.follow { background: var(--success-soft); }
.notif-icon.message { background: var(--accent-soft); }
.notif-icon.system { background: var(--brand-soft); }
</style>