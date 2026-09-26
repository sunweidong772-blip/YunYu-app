<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtDate } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const ann = ref(null)
const loading = ref(true)

onMounted(async () => {
  try { ann.value = await api.announcementDetail(route.params.id) } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="公告详情" showBack />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:300px;border-radius:16px"></div></div>

    <div class="container" v-else-if="ann">
      <h1 class="a-title">{{ ann.title }}</h1>
      <div class="a-meta">
        <span class="a-badge" :class="ann.type">{{ ann.type === 'home' ? '公告' : (ann.type === 'activity' ? '活动' : '资讯') }}</span>
        <span>{{ fmtDate(ann.publish_time) }}</span>
        <span v-if="ann.is_pinned">📌 置顶</span>
      </div>
      <div class="a-content">{{ ann.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 16px; }
.a-title { font-size: var(--fs-20); font-weight: 800; line-height: 1.5; }
.a-meta { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: var(--fs-12); color: var(--text-3); }
.a-badge { padding: 2px 8px; border-radius: var(--r-full); font-size: var(--fs-10); font-weight: 700; }
.a-badge.home { background: var(--brand-soft); color: var(--brand); }
.a-badge.activity { background: var(--warn-soft); color: var(--warn); }
.a-badge.news { background: rgba(16,185,129,.12); color: #10b981; }
.a-content { margin-top: 18px; font-size: var(--fs-14); line-height: 1.9; color: var(--text-2); white-space: pre-wrap; }
</style>