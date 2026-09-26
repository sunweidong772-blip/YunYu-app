<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { timeAgo } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const userStore = useUserStore()

const list = ref([])
const page = ref(1)
const done = ref(false)
const loading = ref(false)

const typeMap = {
  like: { icon: '👍', label: '收到了赞' }, favorited: { icon: '⭐', label: '收藏了你的内容' },
  comment: { icon: '💬', label: '评论了你' }, reply: { icon: '↩️', label: '回复了你' },
  follow: { icon: '👥', label: '关注了你' }, message: { icon: '✉️', label: '给你发了私信' },
  checkin: { icon: '📅', label: '签到' }, task: { icon: '🎯', label: '任务奖励' },
  system: { icon: '📢', label: '系统通知' }, post: { icon: '📝', label: '帖子动态' },
}

async function load(append = false) {
  loading.value = true
  try {
    const r = await api.notifications(`?page=${page.value}&pageSize=20`)
    const rows = r.list || []
    if (append) list.value.push(...rows)
    else list.value = rows
    if (!rows.length || !r.hasMore) done.value = true
  } catch (e) { toast(e.message) } finally { loading.value = false }
}
function loadMore() { if (!done.value && !loading.value) { page.value++; load(true) } }

function open(n) {
  if (n.target_type === 'post' && n.target_id) router.push('/post/' + n.target_id)
  else if (n.target_type === 'software' && n.target_id) router.push('/software/' + n.target_id)
  else if (n.actor_id && n.type === 'message') router.push('/chat/' + n.actor_id)
}

async function readAll() {
  try {
    await api.notificationReadAll()
    list.value.forEach((n) => { n.is_read = 1 })
    userStore.refreshMe()
    toast('已全部标记为已读')
  } catch (e) { toast(e.message) }
}

onMounted(() => load())
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="通知" showBack>
      <span class="nav-right" @click="readAll">全部已读</span>
    </NavBar>

    <div class="notif-item" v-for="n in list" :key="n.id" :class="{ unread: !n.is_read }" @click="open(n)">
      <Avatar :user="{ avatar: n.actor_avatar, nickname: n.actor_name }" size="40" />
      <div class="ni-body">
        <div class="ni-line">
          <span class="ni-type">{{ (typeMap[n.type] && typeMap[n.type].label) || '新通知' }}</span>
          <span class="ni-dot" v-if="!n.is_read"></span>
        </div>
        <div class="ni-title ellipsis" v-if="n.title">{{ n.title }}</div>
        <div class="ni-content clamp2">{{ n.content }}</div>
        <div class="ni-time">{{ timeAgo(n.created_at) }}</div>
      </div>
    </div>
    <Empty v-if="!loading && !list.length" icon="🔔" title="暂无通知" desc="点赞、评论等互动会在这里提醒你" />
    <div class="load-more" v-if="list.length" @click="loadMore">{{ done ? '— 到底啦 —' : '加载更多' }}</div>
  </div>
</template>

<style scoped>
.nav-right { font-size: var(--fs-13); color: var(--brand); }
.notif-item { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.notif-item.unread { background: var(--brand-soft); }
.ni-body { flex: 1; min-width: 0; }
.ni-line { display: flex; align-items: center; gap: 6px; }
.ni-type { font-size: var(--fs-13); font-weight: 700; }
.ni-dot { width: 8px; height: 8px; border-radius: var(--r-full); background: var(--brand); }
.ni-title { font-size: var(--fs-13); margin-top: 2px; }
.ni-content { font-size: var(--fs-12); color: var(--text-2); margin-top: 2px; line-height: 1.5; }
.ni-time { font-size: var(--fs-10); color: var(--text-3); margin-top: 4px; }
</style>