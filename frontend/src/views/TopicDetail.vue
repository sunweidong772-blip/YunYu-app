<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import PostCard from '@/components/PostCard.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const router = useRouter()
const topic = ref(null)
const list = ref([])
const page = ref(1)
const done = ref(false)
const loading = ref(false)

async function load(append = false) {
  loading.value = true
  try {
    const r = await api.posts(`?topic_id=${route.params.id}&page=${page.value}&pageSize=10`)
    const rows = r.list || []
    if (append) list.value.push(...rows)
    else list.value = rows
    if (!rows.length || !r.hasMore) done.value = true
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function loadMore() { if (!done.value && !loading.value) { page.value++; load(true) } }

onMounted(async () => {
  try {
    const topics = await api.topics()
    topic.value = topics.find((t) => t.id === Number(route.params.id)) || null
  } catch (e) { /* 静默 */ }
  load()
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar :title="(topic && topic.name) || '话题'" />

    <div class="topic-hero" v-if="topic">
      <span class="th-icon">{{ topic.icon || '💬' }}</span>
      <div class="th-info">
        <h1>{{ topic.name }}</h1>
        <p>{{ topic.description || '参与话题，分享你的故事' }}</p>
        <span class="th-count">{{ topic.post_count || 0 }} 篇帖子</span>
      </div>
    </div>

    <PostCard v-for="p in list" :key="p.id" :post="p" />
    <Empty v-if="!loading && !list.length" icon="🌊" title="这个话题还没有帖子" desc="成为第一个分享的人吧" />
    <div class="load-more" v-if="list.length" @click="loadMore">{{ done ? '— 到底啦 —' : '加载更多' }}</div>
  </div>
</template>

<style scoped>
.topic-hero { display: flex; gap: 14px; align-items: center; margin: 14px 16px; padding: 18px; border-radius: var(--r-lg); background: var(--card); box-shadow: var(--shadow-sm); }
.th-icon { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 16px; background: var(--brand-soft); font-size: 26px; }
.th-info h1 { font-size: var(--fs-18); font-weight: 800; }
.th-info p { font-size: var(--fs-12); color: var(--text-3); margin-top: 4px; }
.th-count { display: inline-block; margin-top: 8px; font-size: var(--fs-10); color: var(--brand); background: var(--brand-soft); padding: 2px 8px; border-radius: var(--r-full); }
</style>