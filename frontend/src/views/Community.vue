<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import PostCard from '@/components/PostCard.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const userStore = useUserStore()

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
  { key: 'latest', label: '最新' },
  { key: 'follow', label: '关注' },
]
const activeTab = ref('recommend')
const topics = ref([])
const lists = ref({ recommend: [], hot: [], latest: [], follow: [] })
const page = ref({ recommend: 1, hot: 1, latest: 1, follow: 1 })
const done = ref({ recommend: false, hot: false, latest: false, follow: false })
const loading = ref(false)

async function fetchPosts(tab, append = false) {
  const key = tab
  loading.value = true
  try {
    const sortMap = { recommend: 'recommend', hot: 'hot', latest: 'latest', follow: 'follow' }
    const params = `?sort=${sortMap[key]}&page=${page.value[key]}&pageSize=10`
    const r = await api.posts(params)
    const list = r.list || []
    if (append) lists.value[key].push(...list)
    else lists.value[key] = list
    if (!list.length || !r.hasMore) done.value[key] = true
  } catch (e) {
    if (key === 'follow' && !userStore.token) toast('请先登录后查看关注流')
    else toast(e.message)
  } finally {
    loading.value = false
  }
}

function switchTab(key) {
  activeTab.value = key
  if (!lists.value[key].length && !done.value[key]) {
    page.value[key] = 1
    fetchPosts(key)
  }
}

function loadMore() {
  if (loading.value || done.value[activeTab.value]) return
  page.value[activeTab.value]++
  fetchPosts(activeTab.value, true)
}

async function loadTopics() {
  try {
    topics.value = await api.topics()
  } catch (e) { /* 静默 */ }
}

onMounted(() => {
  fetchPosts('recommend')
  loadTopics()
})
</script>

<template>
  <div class="page">
    <header class="navbar" style="justify-content:center">
      <div class="navbar-title">社区</div>
    </header>

    <div class="chips">
      <button v-for="t in tabs" :key="t.key" class="chip" :class="{ active: activeTab === t.key }" @click="switchTab(t.key)">{{ t.label }}</button>
      <button class="chip" :class="{ active: activeTab === 'topic' }" @click="router.push('/topics')">话题</button>
    </div>

    <!-- 话题快捷栏 -->
    <div class="topic-strip" v-if="topics.length">
      <div class="topic-chip" v-for="t in topics.slice(0, 8)" :key="t.id" @click="router.push('/topic/' + t.id)">
        <span>{{ t.icon || '💬' }}</span>{{ t.name }}
      </div>
    </div>

    <button class="fab-post" @click="router.push('/post-create')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
      <span>发帖</span>
    </button>

    <template v-if="loading && !lists[activeTab].length">
      <div class="container mt3">
        <div class="skeleton" style="height:120px;margin-bottom:10px;border-radius:14px"></div>
        <div class="skeleton" style="height:120px;margin-bottom:10px;border-radius:14px"></div>
        <div class="skeleton" style="height:120px;border-radius:14px"></div>
      </div>
    </template>

    <template v-else>
      <PostCard v-for="p in lists[activeTab]" :key="p.id" :post="p" />
      <Empty v-if="!lists[activeTab].length" icon="🌊" title="这里还没有内容" desc="成为第一个分享的人吧" />
      <div class="load-more" v-if="lists[activeTab].length" @click="loadMore">
        {{ done[activeTab] ? '— 到底啦 —' : '加载更多' }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.topic-strip { display: flex; gap: 8px; overflow-x: auto; padding: 4px var(--sp-4) 10px; scrollbar-width: none; }
.topic-strip::-webkit-scrollbar { display: none; }
.topic-chip { flex-shrink: 0; display: flex; align-items: center; gap: 4px; height: 30px; padding: 0 12px; border-radius: var(--r-full); background: var(--card); color: var(--text-2); font-size: var(--fs-12); border: 1px solid var(--divider); }
.fab-post { position: fixed; right: 16px; bottom: calc(var(--tabbar-h) + var(--safe-bottom) + 16px); z-index: 55; display: flex; align-items: center; gap: 6px; height: 42px; padding: 0 16px; border-radius: var(--r-full); background: var(--brand-grad); color: #fff; font-size: var(--fs-13); font-weight: 600; box-shadow: 0 8px 20px rgba(47,140,255,.38); }
</style>