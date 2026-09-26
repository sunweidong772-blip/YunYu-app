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

const router = useRouter()
const userStore = useUserStore()

const quick = [
  { icon: '🔥', name: '热门', to: '/community?sort=hot', color: '#EF4444' },
  { icon: '🎮', name: '游戏', to: '/software-list?cat=游戏', color: '#F59E0B' },
  { icon: '🛠️', name: '工具', to: '/software-list?cat=工具', color: '#3B82F6' },
  { icon: '📦', name: '最新', to: '/software-list?sort=latest', color: '#10B981' },
  { icon: '💎', name: '精品', to: '/collections', color: '#8B5CF6' },
  { icon: '📢', name: '公告', to: '/announcements', color: '#EC4899' },
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
  } catch (e) { /* silent */ }
  loadingMore.value = false
}

onMounted(load)
</script>

<template>
  <div class="page">
    <!-- ===== 顶部搜索区 ===== -->
    <header class="home-header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-logo">☁️</div>
          <span class="brand-name">云屿</span>
        </div>
        <div class="search-pill" @click="router.push('/search')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <span>搜索软件、帖子、用户</span>
        </div>
        <router-link to="/messages" class="msg-icon" :class="{ dot: userStore.unreadCount > 0 }">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
            <path d="M4 6h16v11H8l-4 3V6z"/><path d="M8 10h8M8 13h5" stroke-linecap="round"/>
          </svg>
        </router-link>
      </div>
    </header>

    <template v-if="loading">
      <div class="container mt4">
        <div class="skeleton" style="height:180px;border-radius:var(--r-lg)"></div>
        <div class="skeleton" style="height:36px;margin-top:16px;border-radius:var(--r-full)"></div>
        <div class="skeleton" style="height:120px;margin-top:16px;border-radius:var(--r-md)"></div>
        <div class="skeleton" style="height:120px;margin-top:12px;border-radius:var(--r-md)"></div>
      </div>
    </template>

    <template v-else-if="data">
      <!-- ===== Banner 轮播 ===== -->
      <div class="banner-section">
        <div class="banner-card" v-if="data.banners && data.banners.length" @click="data.banners[0].link && router.push(data.banners[0].link)">
          <div class="banner-content">
            <span class="banner-tag">🔥 精选推荐</span>
            <h2 class="banner-title">{{ data.banners[0].name }}</h2>
            <p class="banner-desc" v-if="data.banners[0].description">{{ data.banners[0].description }}</p>
          </div>
          <div class="banner-visual">
            <div class="banner-circle c1"></div>
            <div class="banner-circle c2"></div>
            <div class="banner-circle c3"></div>
          </div>
        </div>
      </div>

      <!-- ===== 快捷入口 ===== -->
      <div class="quick-section">
        <div class="quick-scroll">
          <div class="quick-item" v-for="q in quick" :key="q.name" @click="router.push(q.to)">
            <div class="quick-icon" :style="{ background: q.color + '15', color: q.color }">
              {{ q.icon }}
            </div>
            <span>{{ q.name }}</span>
          </div>
        </div>
      </div>

      <!-- ===== 推荐软件（横向滚动卡片） ===== -->
      <div class="section-header">
        <h3 class="section-title-text">
          <span class="section-dot"></span>
          推荐软件
        </h3>
        <router-link to="/software-list" class="section-more">查看更多 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></router-link>
      </div>
      <div class="sw-scroll" v-if="data.recommendSoft && data.recommendSoft.length">
        <div class="sw-card" v-for="a in data.recommendSoft.slice(0, 6)" :key="a.id" @click="router.push('/software/' + a.id)">
          <div class="sw-icon-lg" :style="{ background: a.icon_color || 'var(--brand-soft)' }">
            {{ a.icon || '📦' }}
          </div>
          <div class="sw-card-body">
            <div class="sw-card-name ellipsis">{{ a.name }}</div>
            <div class="sw-card-meta">
              <span class="sw-card-cat">{{ a.category_name || '软件' }}</span>
              <span class="sw-card-dl">{{ a.download_count || 0 }} 下载</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 精品合集 ===== -->
      <div class="section-header" v-if="data.featuredCollections && data.featuredCollections.length">
        <h3 class="section-title-text">
          <span class="section-dot" style="background:var(--accent)"></span>
          精品合集
        </h3>
        <router-link to="/collections" class="section-more">全部 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></router-link>
      </div>
      <div class="coll-scroll" v-if="data.featuredCollections && data.featuredCollections.length">
        <div class="coll-card" v-for="(c, idx) in data.featuredCollections.slice(0, 4)" :key="c.id" @click="router.push('/collection/' + c.id)" :style="{ background: ['linear-gradient(135deg,#6366F1,#4F46E5)', 'linear-gradient(135deg,#10B981,#059669)', 'linear-gradient(135deg,#F59E0B,#D97706)', 'linear-gradient(135deg,#EC4899,#DB2777)'][idx % 4] }">
          <div class="coll-icon">📁</div>
          <div class="coll-name">{{ c.name }}</div>
          <div class="coll-count">{{ (c.software_ids || []).length }} 款软件</div>
        </div>
      </div>

      <!-- ===== 社区热门 ===== -->
      <div class="section-header">
        <h3 class="section-title-text">
          <span class="section-dot" style="background:var(--warning)"></span>
          热门帖子
        </h3>
        <router-link to="/community" class="section-more">去社区 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></router-link>
      </div>
      <div class="post-feed">
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </div>
      <div class="load-more" v-if="posts.length" @click="loadMore">
        {{ loadingMore ? '加载中…' : (done ? '— 到底啦 —' : '加载更多') }}
      </div>
      <Empty v-else icon="🗨️" title="还没有帖子" desc="去社区发布第一篇帖子吧" />

      <!-- ===== 活跃用户 ===== -->
      <div class="section-header" v-if="data.hotUsers && data.hotUsers.length">
        <h3 class="section-title-text">
          <span class="section-dot" style="background:var(--danger)"></span>
          活跃居民
        </h3>
      </div>
      <div class="user-scroll" v-if="data.hotUsers && data.hotUsers.length">
        <div class="user-chip" v-for="u in data.hotUsers.slice(0, 8)" :key="u.id" @click="router.push('/user/' + u.id)">
          <Avatar :name="u.nickname" :src="u.avatar" size="m" />
          <span class="user-chip-name">{{ u.nickname }}</span>
          <span class="user-chip-lv">LV{{ u.lv }}</span>
        </div>
      </div>
      <div style="height:24px"></div>
    </template>
  </div>
</template>

<style scoped>
/* ===== 顶部区域 ===== */
.home-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 10px 16px 8px;
}
html[data-theme='dark'] .home-header {
  background: rgba(15, 23, 42, 0.95);
}
.header-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--brand-grad);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}
.brand-name {
  font-size: 18px;
  font-weight: 800;
  background: var(--brand-grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.search-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  background: var(--bg-elev);
  border-radius: 19px;
  border: 1.5px solid var(--divider);
  font-size: 13px;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s ease;
}
.search-pill:active {
  transform: scale(0.98);
  border-color: var(--brand);
}
.msg-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-elev);
  color: var(--text-2);
  flex-shrink: 0;
}
.msg-icon.dot::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  border: 2px solid var(--bg-elev);
}

/* ===== Banner ===== */
.banner-section {
  padding: 12px 16px 0;
}
.banner-card {
  position: relative;
  padding: 20px;
  border-radius: var(--r-lg);
  background: var(--brand-grad);
  color: #fff;
  overflow: hidden;
  min-height: 150px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}
.banner-content {
  position: relative;
  z-index: 2;
  max-width: 70%;
}
.banner-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--r-full);
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
}
.banner-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 6px;
}
.banner-desc {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.5;
}
.banner-visual {
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 100%;
}
.banner-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
}
.c1 { width: 100px; height: 100px; top: -20px; right: -20px; }
.c2 { width: 70px; height: 70px; top: 40px; right: 50px; animation-delay: 0.5s; }
.c3 { width: 45px; height: 45px; top: 90px; right: 10px; animation-delay: 1s; }

/* ===== 快捷入口 ===== */
.quick-section {
  padding: 16px 12px 6px;
}
.quick-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 4px;
}
.quick-scroll::-webkit-scrollbar { display: none; }
.quick-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  min-width: 58px;
  cursor: pointer;
}
.quick-item:active { transform: scale(0.95); }
.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: transform 0.2s ease;
}
.quick-item:active .quick-icon { transform: scale(0.92); }
.quick-item span {
  font-size: 12px;
  color: var(--text-2);
  font-weight: 500;
}

/* ===== 区块标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 10px;
}
.section-title-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
}
.section-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
}
.section-more {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--text-3);
  transition: color 0.15s ease;
}
.section-more:active { color: var(--brand); }

/* ===== 软件横向滚动 ===== */
.sw-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 16px 4px;
  scrollbar-width: none;
}
.sw-scroll::-webkit-scrollbar { display: none; }
.sw-card {
  flex-shrink: 0;
  width: 130px;
  padding: 14px;
  background: var(--card);
  border: 1px solid var(--divider);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.sw-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-md);
}
.sw-icon-lg {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 10px;
}
.sw-card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 6px;
}
.sw-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sw-card-cat {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--r-full);
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 500;
}
.sw-card-dl {
  font-size: 11px;
  color: var(--text-3);
}

/* ===== 合集卡片 ===== */
.coll-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 16px 4px;
  scrollbar-width: none;
}
.coll-scroll::-webkit-scrollbar { display: none; }
.coll-card {
  flex-shrink: 0;
  width: 140px;
  padding: 16px;
  border-radius: var(--r-md);
  color: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.16s ease;
}
.coll-card:active { transform: scale(0.97); }
.coll-icon {
  font-size: 28px;
  margin-bottom: 10px;
  opacity: 0.9;
}
.coll-name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 6px;
}
.coll-count {
  font-size: 11px;
  opacity: 0.85;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: var(--r-full);
  display: inline-block;
}

/* ===== 帖子流 ===== */
.post-feed {
  padding: 0 16px;
}

/* ===== 活跃用户 ===== */
.user-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 16px 8px;
  scrollbar-width: none;
}
.user-scroll::-webkit-scrollbar { display: none; }
.user-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 6px;
  min-width: 64px;
  cursor: pointer;
}
.user-chip:active { transform: scale(0.95); }
.user-chip-name {
  max-width: 64px;
  font-size: 12px;
  color: var(--text-1);
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-chip-lv {
  font-size: 10px;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 1px 7px;
  border-radius: var(--r-full);
  font-weight: 600;
}
</style>