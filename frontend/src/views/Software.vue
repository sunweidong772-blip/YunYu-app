<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const route = useRoute()
const categories = ref([])
const activeCat = ref(route.query.cat || '全部')
const sortTab = ref(route.query.sort || 'recommend')
const list = ref([])
const page = ref(1)
const done = ref(false)
const loading = ref(false)

const sortTabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
  { key: 'download', label: '下载最多' },
  { key: 'favorite', label: '收藏最多' },
]

async function fetchData(append = false) {
  loading.value = true
  try {
    const params = `?page=${page.value}&pageSize=10&sort=${sortTab.value}${activeCat.value && activeCat.value !== '全部' ? '&category=' + encodeURIComponent(activeCat.value) : ''}`
    const r = await api.softwareList(params)
    const rows = r.list || []
    if (append) list.value.push(...rows)
    else list.value = rows
    if (!rows.length || !r.hasMore) done.value = true
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}

function switchCat(cat) {
  activeCat.value = cat
  page.value = 1
  done.value = false
  fetchData()
}

function switchSort(key) {
  sortTab.value = key
  page.value = 1
  done.value = false
  fetchData()
}

function loadMore() {
  if (loading.value || done.value) return
  page.value++
  fetchData(true)
}

onMounted(async () => {
  loading.value = true
  try {
    categories.value = await api.softwareCategories()
    await fetchData()
  } catch (e) {
    toast(e.message)
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <header class="navbar">
      <div class="navbar-title">软件库</div>
      <span class="navbar-side" style="text-align:right">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" stroke-width="2" @click="router.push('/search')"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
      </span>
    </header>

    <!-- 分类 -->
    <div class="cat-scroll">
      <button class="cat-chip" :class="{ active: activeCat === '全部' }" @click="switchCat('全部')">全部</button>
      <button v-for="c in categories" :key="c.id" class="cat-chip" :class="{ active: activeCat === c.name }" @click="switchCat(c.name)">
        {{ c.name }}
      </button>
    </div>

    <!-- 排序 -->
    <div class="chips sort-chips">
      <button v-for="s in sortTabs" :key="s.key" class="chip" :class="{ active: sortTab === s.key }" @click="switchSort(s.key)">{{ s.label }}</button>
    </div>

    <template v-if="loading && !list.length">
      <div class="container mt3">
        <div class="skeleton" style="height:76px;margin-bottom:8px;border-radius:14px"></div>
        <div class="skeleton" style="height:76px;margin-bottom:8px;border-radius:14px"></div>
        <div class="skeleton" style="height:76px;border-radius:14px"></div>
      </div>
    </template>
    <template v-else>
      <div class="sw-list">
        <SoftwareCard v-for="a in list" :key="a.id" :app="a" />
      </div>
      <Empty v-if="!list.length" icon="📦" title="没有找到相关软件" desc="试试其他分类或排序" />
      <div class="load-more" v-if="list.length" @click="loadMore">{{ done ? '— 到底啦 —' : '加载更多' }}</div>
    </template>
  </div>
</template>

<style scoped>
.cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 4px var(--sp-4) 10px; scrollbar-width: none; }
.cat-scroll::-webkit-scrollbar { display: none; }
.cat-chip { flex-shrink: 0; height: 34px; padding: 0 16px; border-radius: var(--r-full); background: var(--card); color: var(--text-2); font-size: var(--fs-13); border: 1px solid var(--divider); font-weight: 500; }
.cat-chip.active { background: var(--brand-grad); color: #fff; border-color: transparent; font-weight: 600; }
.sort-chips { padding-top: 2px; }
.sw-list { margin: 0 var(--sp-4); background: var(--card); border-radius: var(--r-md); padding: 4px 0; }
</style>