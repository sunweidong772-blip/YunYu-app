<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { timeAgo } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const list = ref([])
const loading = ref(true)

onMounted(async () => {
  try { list.value = await api.announcements() } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="云屿公告" showBack />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:80px;margin-bottom:10px;border-radius:14px"></div></div>

    <div class="ann-item" v-for="a in list" :key="a.id" @click="router.push('/announcement/' + a.id)">
      <span class="ai-badge" :class="a.type">{{ a.type === 'home' ? '公告' : (a.type === 'activity' ? '活动' : '资讯') }}</span>
      <div class="ai-body">
        <div class="ai-title ellipsis">{{ a.title }} <span class="ai-pin" v-if="a.is_pinned">📌</span></div>
        <div class="ai-time">{{ timeAgo(a.publish_time) }}</div>
      </div>
      <span class="ai-arrow">›</span>
    </div>
    <Empty v-if="!loading && !list.length" icon="📢" title="暂无公告" desc="新的公告将在这里展示" />
  </div>
</template>

<style scoped>
.ann-item { display: flex; gap: 12px; align-items: center; margin: 10px 16px 0; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.ai-badge { flex-shrink: 0; padding: 2px 8px; border-radius: var(--r-full); font-size: var(--fs-10); font-weight: 700; }
.ai-badge.home { background: var(--brand-soft); color: var(--brand); }
.ai-badge.activity { background: var(--warn-soft); color: var(--warn); }
.ai-badge.news { background: var(--ok-soft, rgba(16,185,129,.12)); color: var(--ok, #10b981); }
.ai-body { flex: 1; min-width: 0; }
.ai-title { font-size: var(--fs-14); font-weight: 700; }
.ai-pin { font-size: var(--fs-11); }
.ai-time { font-size: var(--fs-11); color: var(--text-3); margin-top: 3px; }
.ai-arrow { color: var(--text-3); font-size: 18px; }
</style>