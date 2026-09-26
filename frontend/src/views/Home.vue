<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import PostCard from '@/components/PostCard.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Avatar from '@/components/Avatar.vue'
import Empty from '@/components/Empty.vue'
import { timeAgo, fmtNum } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const quick = [
  { icon: '🎮', name: '游戏', to: '/software-list?cat=游戏' },
  { icon: '🛠️', name: '工具', to: '/software-list?cat=工具' },
  { icon: '💎', name: '精品', to: '/collections' },
  { icon: '🔥', name: '热门社区', to: '/community' },
  { icon: '📦', name: '最新更新', to: '/software-list?sort=latest' },
  { icon: '📢', name: '官方公告', to: '/announcements' },
]

const loading = ref(true)
const data = ref(null)
const page = ref(1)
const done = ref(false)
const posts = ref([])
const loadingMore = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await api.home()
    posts.value = data.value.hotPosts || []
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || done.value) return
  loadingMore.value = true
  page.value++
  try {
    const r = await api.posts(`?page=${page.value}&pageSize=10`)
    const list = r.list || []
    if (!list.length) done.value = true
    else posts.value.push(...list)
  } catch (e) { /* 静默 */ }
  loadingMore.value = false
}

onMounted(load)
</script>

<template>
  <div class="page">
    <!-- 顶栏 -->
    <header class="navbar home-nav">
      <div class="home-logo">
        <span class="logo-dot"></span>
        <span class="logo-text">云屿</span>
      </div>
      <div class="search-bar grow" @click="router.push('/search')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>
        <span>搜索软件 / 帖子 / 用户</span>
      </div>
      <router-link to="/messages" class="msg-btn">
        <span class="tabbar-dot" v-if="userStore.unreadCount > 0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16v11H8l-4 3V6z" stroke-linejoin="round"/></svg>
        </span>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16v11H8l-4 3V6z" stroke-linejoin="round"/></svg>
      </router-link>
    </header>

    <template v-if="loading">
      <div class="container mt4">
        <div class="skeleton" style="height:150px;border-radius:16px"></div>
        <div class="skeleton" style="height:40px;margin-top:16px"></div>
        <div class="skeleton" style="height:90px;margin-top:16px"></div>
        <div class="skeleton" style="height:90px;margin-top:12px"></div>
      </div>
    </template>

    <template v-else-if="data">
      <!-- Banner 轮播（简单卡片切换） -->
      <div class="banner-wrap">
        <div class="banner-hint">
          <span class="banner-tag">精选</span>
          <span class="banner-name">{{ data.banners[0] ? data.banners[0].name : '云屿精选' }}</span>
        </div>
        <div class="banner-rings">
          <span v-for="i in 3" :key="i" class="ring" :style="{ animationDelay: i * 0.6 + 's' }"></span>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-grid container">
        <div class="quick-item" v-for="q in quick" :key="q.name" @click="router.push(q.to)">
          <span>{{ q.icon }}</span>
          <em>{{ q.name }}</em>
        </div>
      </div>

      <!-- 推荐软件 -->
      <div class="section-title container">
        <h3>推荐软件</h3>
        <router-link to="/software-list" class="more">更多 ›</router-link>
      </div>
      <div class="sw-list">
        <SoftwareCard v-for="a in data.recommendSoft" :key="a.id" :app="a" />
      </div>

      <!-- 精品合集 -->
      <div class="section-title container" v-if="data.featuredCollections && data.featuredCollections.length">
        <h3>精品合集</h3>
        <router-link to="/collections" class="more">全部 ›</router-link>
      </div>
      <div class="coll-scroll">
        <div class="coll-card" v-for="c in data.featuredCollections" :key="c.id" @click="router.push('/collection/' + c.id)">
          <div class="coll-title">{{ c.name }}</div>
          <div class="coll-desc ellipsis">{{ c.description }}</div>
          <span class="coll-count">{{ (c.software_ids || []).length }} 款软件</span>
        </div>
      </div>

      <!-- 社区热门 -->
      <div class="section-title container">
        <h3>热门帖子</h3>
        <router-link to="/community" class="more">去社区 ›</router-link>
      </div>
      <PostCard v-for="p in posts" :key="p.id" :post="p" />
      <div class="load-more" v-if="posts.length" @click="loadMore">{{ loadingMore ? '加载中…' : (done ? '— 到底啦 —' : '加载更多') }}</div>
      <Empty v-else icon="🗨️" title="还没有帖子" desc="去社区发布第一篇帖子吧" />

      <!-- 热门用户 -->
      <div class="section-title container" v-if="data.hotUsers && data.hotUsers.length">
        <h3>活跃用户</h3>
      </div>
      <div class="hot-users">
        <div class="hot-user" v-for="u in data.hotUsers" :key="u.id" @click="router.push('/user/' + u.id)">
          <Avatar :name="u.nickname" :src="u.avatar" size="m" />
          <span class="hu-nick ellipsis">{{ u.nickname }}</span>
          <span class="hu-lv">LV{{ u.lv }}</span>
        </div>
      </div>
      <div style="height: 16px"></div>
    </template>
  </div>
</template>

<style scoped>
.home-nav { gap: 12px; }
.home-logo { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: var(--fs-18); color: var(--brand); }
.logo-dot { width: 20px; height: 20px; border-radius: 6px; background: var(--brand-grad); box-shadow: 0 3px 8px rgba(47,140,255,.35); }
.search-bar { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; background: var(--card-2); border-radius: var(--r-full); font-size: var(--fs-13); color: var(--text-3); }
.msg-btn { display: flex; align-items: center; color: var(--text-1); }

.banner-wrap { position: relative; margin: 12px var(--sp-4) 0; height: 148px; border-radius: var(--r-lg); overflow: hidden; background: var(--brand-grad); color: #fff; display: flex; align-items: flex-end; padding: 18px; box-shadow: 0 10px 24px rgba(47,140,255,.28); }
.banner-hint { position: relative; z-index: 2; }
.banner-tag { display: inline-block; background: rgba(255,255,255,.22); border: 1px solid rgba(255,255,255,.35); padding: 2px 10px; border-radius: var(--r-full); font-size: var(--fs-11); margin-bottom: 8px; }
.banner-name { font-size: var(--fs-22); font-weight: 800; display: block; }
.banner-rings { position: absolute; top: -30px; right: -20px; }
.ring { position:absolute; right: 20px; top: 20px; width: 90px; height: 90px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.35); animation: floatY 5s ease-in-out infinite; }
.ring:nth-child(2) { right: 60px; top: 60px; width: 60px; height: 60px; animation-delay: .8s; }
.ring:nth-child(3) { right: -10px; top: 70px; width: 40px; height: 40px; animation-delay: 1.6s; }

.quick-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 16px; }
.quick-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-style: normal; }
.quick-item span { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 16px; background: var(--card); box-shadow: var(--shadow-sm); font-size: 22px; }
.quick-item em { font-style: normal; font-size: var(--fs-11); color: var(--text-2); }

.sw-list { margin: 0 var(--sp-4); background: var(--card); border-radius: var(--r-md); padding: 4px 0; }
.coll-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 2px var(--sp-4); scrollbar-width: none; }
.coll-scroll::-webkit-scrollbar { display: none; }
.coll-card { flex-shrink: 0; width: 150px; padding: 16px; border-radius: var(--r-md); color: #fff; background: linear-gradient(135deg, #5aa8ff 0%, #2f8cff 60%, #1e6fd6 100%); box-shadow: var(--shadow-md); }
.coll-title { font-size: var(--fs-15); font-weight: 700; }
.coll-desc { font-size: var(--fs-11); opacity: .92; margin-top: 6px; }
.coll-count { display: inline-block; margin-top: 12px; font-size: var(--fs-10); background: rgba(255,255,255,.22); padding: 2px 8px; border-radius: var(--r-full); }

.hot-users { display: flex; gap: 12px; overflow-x: auto; padding: 2px var(--sp-4) 8px; scrollbar-width: none; }
.hot-users::-webkit-scrollbar { display: none; }
.hot-user { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; width: 64px; }
.hu-nick { max-width: 64px; font-size: var(--fs-12); color: var(--text-1); }
.hu-lv { font-size: var(--fs-10); color: var(--brand); background: var(--brand-soft); padding: 0 6px; border-radius: var(--r-full); }
</style>