<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const router = useRouter()
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
    const cat = activeCat.value && activeCat.value !== '全部' ? '&category=' + encodeURIComponent(activeCat.value) : ''
    const r = await api.softwareList(`?page=${page.value}&pageSize=10&sort=${sortTab.value}${cat}`)
    const rows = r.list || []
    if (append) list.value.push(...rows)
    else list.value = rows
    if (!rows.length || !r.hasMore) done.value = true
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function switchCat(c) { activeCat.value = c; page.value = 1; done.value = false; fetchData() }
function switchSort(k) { sortTab.value = k; page.value = 1; done.value = false; fetchData() }
function loadMore() { if (!done.value && !loading.value) { page.value++; fetchData(true) } }

onMounted(async () => {
  try { categories.value = await api.softwareCategories() } catch (e) { /* 静默 */ }
  fetchData()
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="软件库" />

    <div class="cat-scroll">
      <button class="cat-chip" :class="{ active: activeCat === '全部' }" @click="switchCat('全部')">全部</button>
      <button v-for="c in categories" :key="c.id" class="cat-chip" :class="{ active: activeCat === c.name }" @click="switchCat(c.name)">{{ c.name }}</button>
    </div>
    <div class="chips">
      <button v-for="s in sortTabs" :key="s.key" class="chip" :class="{ active: sortTab === s.key }" @click="switchSort(s.key)">{{ s.label }}</button>
    </div>

    <template v-if="loading && !list.length">
      <div class="container"><div class="skeleton" style="height:76px;margin-bottom:8px;border-radius:14px"></div><div class="skeleton" style="height:76px;border-radius:14px"></div></div>
    </template>
    <template v-else>
      <div class="sw-list">
        <SoftwareCard v-for="a in list" :key="a.id" :app="a" />
      </div>
      <Empty v-if="!list.length" icon="📦" title="没有找到相关软件" desc="换个分类或排序试试" />
      <div class="load-more" v-if="list.length" @click="loadMore">{{ done ? '— 到底啦 —' : '加载更多' }}</div>
    </template>
  </div>
</template>

<style scoped>
.cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 10px 16px 8px; scrollbar-width: none; }
.cat-scroll::-webkit-scrollbar { display: none; }
.cat-chip { flex-shrink: 0; height: 32px; padding: 0 14px; border-radius: var(--r-full); background: var(--card); border: 1px solid var(--divider); color: var(--text-2); font-size: var(--fs-13); }
.cat-chip.active { background: var(--brand); color: #fff; border-color: var(--brand); font-weight: 600; }
.sw-list { margin: 0 16px; background: var(--card); border-radius: var(--r-md); }
</style>