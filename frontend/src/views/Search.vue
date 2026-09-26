<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'
import PostCard from '@/components/PostCard.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Avatar from '@/components/Avatar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const userStore = useUserStore()
const kw = ref('')
const searching = ref(false)
const result = ref(null)
const searched = ref(false)
const activeTab = ref('software')
const hotWords = ref([])
const historyWords = ref([])

const tabs = [
  { key: 'software', label: '软件' },
  { key: 'posts', label: '帖子' },
  { key: 'users', label: '用户' },
]

const currentList = computed(() => {
  if (!result.value) return []
  return result.value[activeTab.value] || []
})

function switchTab(key) {
  activeTab.value = key
}

function setKw(v) {
  kw.value = v
  doSearch()
}

async function doSearch() {
  if (!kw.value.trim()) return toast('请输入搜索关键词')
  searching.value = true
  try {
    result.value = await api.search(kw.value.trim())
    searched.value = true
    // 默认激活有结果的标签页
    if (result.value) {
      if ((result.value.software || []).length) activeTab.value = 'software'
      else if ((result.value.posts || []).length) activeTab.value = 'posts'
      else if ((result.value.users || []).length) activeTab.value = 'users'
    }
    if (userStore.isLogin) fetchHistory()
  } catch (e) {
    toast(e.message)
  } finally {
    searching.value = false
  }
}

async function fetchHot() {
  try {
    hotWords.value = await api.hotSearch()
  } catch (e) { /* ignore */ }
}

async function fetchHistory() {
  if (!userStore.isLogin) return
  try {
    historyWords.value = await api.searchHistory()
  } catch (e) { /* ignore */ }
}

async function clearHistory() {
  try {
    await api.clearSearchHistory()
    historyWords.value = []
  } catch (e) {
    toast(e.message)
  }
}

onMounted(() => {
  fetchHot()
  if (userStore.isLogin) fetchHistory()
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="" back>
      <template #right>
        <button class="btn btn-primary btn-sm" style="height:32px" @click="doSearch">搜索</button>
      </template>
    </NavBar>

    <div class="container mt2">
      <div class="field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2" style="margin-right:8px"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
        <input v-model="kw" placeholder="搜索软件、帖子、用户…" @keyup.enter="doSearch" @input="searched = false" />
      </div>
    </div>

    <!-- 热词推荐 -->
    <div class="container" v-if="!searched && hotWords.length">
      <div class="section-title"><h3>🔥 热门搜索</h3></div>
      <div class="tag-row">
        <span class="tag" v-for="h in hotWords" :key="h.keyword" @click="setKw(h.keyword)">{{ h.keyword }}</span>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div class="container" v-if="!searched && userStore.isLogin && historyWords.length">
      <div class="section-title" style="display:flex;align-items:center;justify-content:space-between">
        <h3>🕐 搜索历史</h3>
        <button class="btn btn-text btn-sm" @click="clearHistory">清除</button>
      </div>
      <div class="tag-row">
        <span class="tag" v-for="h in historyWords" :key="h.keyword" @click="setKw(h.keyword)">{{ h.keyword }}</span>
      </div>
    </div>

    <template v-if="searching">
      <div class="loading-wrap"><div class="loading-spin"></div><span>搜索中…</span></div>
    </template>
    <template v-else-if="result">
      <!-- 分类标签页 -->
      <div class="tab-bar container" v-if="searched">
        <div
          v-for="t in tabs"
          :key="t.key"
          class="tab-item"
          :class="{ active: activeTab === t.key }"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
          <span class="tab-badge" v-if="(result[t.key] || []).length">{{ result[t.key].length }}</span>
        </div>
      </div>

      <!-- 软件结果 -->
      <template v-if="activeTab === 'software'">
        <div class="sw-list" v-if="currentList.length">
          <SoftwareCard v-for="a in currentList" :key="a.id" :app="a" />
        </div>
        <Empty v-else-if="searched" icon="📦" title="未找到相关软件" desc="换个关键词试试" />
      </template>

      <!-- 帖子结果 -->
      <template v-if="activeTab === 'posts'">
        <PostCard v-for="p in currentList" :key="p.id" :post="p" />
        <Empty v-if="searched && !currentList.length" icon="📝" title="未找到相关帖子" desc="换个关键词试试" />
      </template>

      <!-- 用户结果 -->
      <template v-if="activeTab === 'users'">
        <div class="user-res card" style="margin:0 16px" v-if="currentList.length">
          <div class="u-item" v-for="u in currentList" :key="u.id" @click="router.push('/user/' + u.id)">
            <Avatar :name="u.nickname" :src="u.avatar" size="m" />
            <div class="grow" style="min-width:0">
              <div class="semi" v-html="u.highlighted || u.nickname"></div>
              <div class="ellipsis" style="font-size:12px;color:var(--text-3)">{{ u.bio || '暂无签名' }}</div>
            </div>
          </div>
        </div>
        <Empty v-else-if="searched" icon="👤" title="未找到相关用户" desc="换个关键词试试" />
      </template>
    </template>
  </div>
</template>

<style scoped>
.u-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.u-item + .u-item { border-top: 1px solid var(--divider); }

.tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.tag { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 16px; background: var(--bg-2); color: var(--text-2); font-size: 13px; cursor: pointer; }
.tag:hover { background: var(--primary-light); color: var(--primary); }

.tab-bar { display: flex; gap: 16px; border-bottom: 1px solid var(--divider); margin-top: 12px; }
.tab-item { position: relative; padding: 10px 4px; font-size: 15px; color: var(--text-2); cursor: pointer; }
.tab-item.active { color: var(--primary); font-weight: 600; }
.tab-item.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--primary); border-radius: 2px; }
.tab-badge { display: inline-block; margin-left: 4px; padding: 0 6px; font-size: 11px; line-height: 16px; border-radius: 8px; background: var(--bg-3); color: var(--text-3); }
</style>