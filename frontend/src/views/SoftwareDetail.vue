<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import { fmtNum, fmtDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const app = ref(null)
const loading = ref(true)
const favorited = ref(false)
const screenshots = ref([])
const versions = ref([])
const related = ref([])
const showShare = ref(false)
const showRatingSheet = ref(false)
const showRatingList = ref(false)
const showOverlay = ref(false)
const overlaySrc = ref('')
const versionsExpanded = ref(false)
const ratingScore = ref(0)
const ratingComment = ref('')
const ratingList = ref([])
const ratingLoading = ref(false)

function starText(score) {
  const s = Math.round(score || 0)
  return '★'.repeat(s) + '☆'.repeat(Math.max(0, 5 - s))
}

async function load() {
  loading.value = true
  try {
    const data = await api.softwareDetail(route.params.id)
    app.value = data
    favorited.value = !!data.favorited
    screenshots.value = data.screenshots || []
    versions.value = data.versions || []
    related.value = data.related || []
    updateSEOTitle()
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}

function openRating() {
  if (!userStore.token) return router.push('/login')
  ratingScore.value = (app.value.my_rating && app.value.my_rating.score) || 0
  ratingComment.value = (app.value.my_rating && app.value.my_rating.comment) || ''
  showRatingSheet.value = true
}

async function submitRating() {
  if (!ratingScore.value) return toast('请选择星级')
  try {
    const r = await api.softwareRating(route.params.id, { score: ratingScore.value, comment: ratingComment.value })
    app.value.rating = r.rating
    app.value.rating_count = r.rating_count
    app.value.my_rating = r.my_rating
    showRatingSheet.value = false
    toast(r.message || '评分成功')
  } catch (e) { toast(e.message) }
}

async function openRatingList() {
  showRatingList.value = true
  ratingLoading.value = true
  try {
    const r = await api.softwareRatings(route.params.id)
    ratingList.value = r.list || []
  } catch (e) { toast(e.message) } finally { ratingLoading.value = false }
}

async function download() {
  if (!userStore.token) return router.push('/login')
  try {
    const r = await api.softwareDownload(route.params.id)
    if (r.url) window.open(r.url, '_blank')
    else toast('开始下载')
    app.value.download_count = (app.value.download_count || 0) + 1
  } catch (e) { toast(e.message) }
}

async function toggleFav() {
  if (!userStore.token) return router.push('/login')
  try {
    if (favorited.value) {
      await api.softwareUnfavorite(route.params.id)
      favorited.value = false
      app.value.favorite_count = Math.max(0, (app.value.favorite_count || 0) - 1)
      toast('已取消收藏')
    } else {
      await api.softwareFavorite(route.params.id)
      favorited.value = true
      app.value.favorite_count = (app.value.favorite_count || 0) + 1
      toast('收藏成功')
    }
  } catch (e) { toast(e.message) }
}

async function report() {
  if (!userStore.token) return router.push('/login')
  try {
    await api.softwareReport(route.params.id, { reason: '软件内容异常' })
    toast('举报已提交，感谢反馈')
  } catch (e) { toast(e.message) }
}

function goVersionDetail(v) {
  if (v.download_url) window.open(v.download_url, '_blank')
}

function openOverlay(src) {
  overlaySrc.value = src
  showOverlay.value = true
}

function updateSEOTitle() {
  if (app.value) {
    document.title = `${app.value.name} - ${app.value.summary} | 云屿软件聚合社区`
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = `${app.value.name} - ${app.value.summary} | 云屿软件聚合社区`
  }
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="软件详情" />

    <div v-if="loading" class="container mt4">
      <div class="skeleton" style="height:120px;border-radius:16px"></div>
      <div class="skeleton" style="height:60px;margin-top:12px"></div>
      <div class="skeleton" style="height:160px;margin-top:12px"></div>
    </div>

    <template v-else-if="app">
      <!-- 头部 -->
      <div class="detail-head container">
        <div class="dh-icon" :style="{ background: app.icon_color || 'var(--brand-soft)' }">{{ app.icon || '📦' }}</div>
        <div class="dh-info grow">
          <h1>{{ app.name }}</h1>
          <div class="dh-meta">
            <span v-if="app.category_name">{{ app.category_name }}</span>
            <span v-if="app.version">v{{ app.version }}</span>
            <span v-if="app.size">{{ app.size }}</span>
            <span v-if="app.developer">{{ app.developer }}</span>
          </div>
          <div class="dh-stats">
            <span>⬇ {{ fmtNum(app.download_count) }} 下载</span>
            <span class="rate-btn" @click.stop="openRatingList">⭐ {{ app.rating ? app.rating.toFixed(1) : '—' }} <em>{{ app.rating_count }}人评</em></span>
            <span>🔖 {{ fmtNum(app.favorite_count) }} 收藏</span>
          </div>
        </div>
      </div>

      <!-- 摘要 -->
      <p class="summary container mt3">{{ app.summary }}</p>

      <!-- 标签 -->
      <div class="tags container" v-if="app.tags && app.tags.length">
        <span v-for="t in app.tags" :key="t" class="badge">{{ t }}</span>
      </div>

      <!-- 操作 -->
      <div class="actions container mt4">
        <button class="btn btn-primary grow" @click="download">⬇ 下载</button>
        <button class="btn btn-outline" @click="toggleFav">{{ favorited ? '已收藏' : '☆ 收藏' }}</button>
        <button class="btn btn-outline" @click="openRating">⭐ 评分</button>
        <button class="btn btn-outline" @click="showShare = true">分享</button>
      </div>

      <!-- 我的评分提示 -->
      <div class="my-rate container mt2" v-if="app.my_rating">
        <span class="stars">{{ starText(app.my_rating.score) }}</span>
        <span>我已评 {{ app.my_rating.score }} 星 <a @click="openRating">修改评价</a></span>
      </div>

      <!-- 简介 -->
      <div class="section-title container">
        <h3>软件简介</h3>
      </div>
      <div class="card card-pad desc container">
        <div class="rich-content">{{ app.description }}</div>
      </div>

      <!-- 截图预览 -->
      <div class="section-title container" v-if="screenshots.length">
        <h3>截图预览</h3>
      </div>
      <div class="shot-scroll" v-if="screenshots.length">
        <img
          v-for="(s, i) in screenshots.slice(0, 5)"
          :key="i"
          :src="s"
          class="shot"
          loading="lazy"
          @click="openOverlay(s)"
        />
      </div>

      <!-- 版本历史 -->
      <div class="section-title container" v-if="versions.length">
        <h3 class="fold-title" @click="versionsExpanded = !versionsExpanded">
          版本历史
          <span class="fold-arrow" :class="{ expanded: versionsExpanded }">▼</span>
        </h3>
      </div>
      <div class="ver-list" v-show="versionsExpanded" v-if="versions.length">
        <div class="ver-item card" v-for="v in versions" :key="v.id" @click="goVersionDetail(v)">
          <div class="grow">
            <span class="semi">v{{ v.version }}</span>
            <span class="time-text" style="margin-left:8px">{{ fmtDate(v.created_at) }}</span>
            <div class="vlog" v-if="v.changelog">{{ v.changelog }}</div>
          </div>
          <span class="ver-dl" v-if="v.download_url">下载</span>
        </div>
      </div>

      <!-- 相关推荐 -->
      <div class="section-title container" v-if="related.length">
        <h3>相关推荐</h3>
      </div>
      <div v-if="related.length" class="sw-list">
        <SoftwareCard v-for="a in related" :key="a.id" :app="a" />
      </div>

      <button class="btn btn-outline btn-sm report-btn" @click="report">举报该软件</button>
    </template>

    <!-- 分享 bottom sheet -->
    <template v-if="showShare">
      <div class="sheet-mask" @click="showShare = false"></div>
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">分享「{{ app ? app.name : '' }}」</div>
        <button class="sheet-item" @click="copyUrl"><span>🔗</span>复制链接</button>
        <button class="sheet-item" @click="showShare = false"><span>✖️</span>取消</button>
      </div>
    </template>

    <!-- 评分 bottom sheet -->
    <template v-if="showRatingSheet">
      <div class="sheet-mask" @click="showRatingSheet = false"></div>
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">{{ app.my_rating ? '修改我的评价' : '给「' + app.name + '」评分' }}</div>
        <div class="rate-stars">
          <span
            v-for="n in 5" :key="n"
            class="rs-star"
            :class="{ on: n <= ratingScore }"
            @click="ratingScore = n"
          >★</span>
        </div>
        <div class="rate-label">{{ ratingScore ? ratingScore + ' 星' : '点击星星评分' }}</div>
        <textarea
          v-model="ratingComment"
          class="rate-comment"
          placeholder="写点什么评价这款软件吧（选填）"
          maxlength="200"
        ></textarea>
        <button class="btn btn-primary btn-block" @click="submitRating">提交评价</button>
      </div>
    </template>

    <!-- 评价列表 bottom sheet -->
    <template v-if="showRatingList">
      <div class="sheet-mask" @click="showRatingList = false"></div>
      <div class="sheet sheet-list">
        <div class="sheet-handle"></div>
        <div class="sheet-title">用户评价（{{ app ? app.rating_count : 0 }}）</div>
        <div class="rl-body">
          <div v-if="ratingLoading" class="rl-empty">加载中…</div>
          <template v-else>
            <div class="rl-item" v-for="r in ratingList" :key="r.id">
              <div class="rl-head">
                <span class="rl-avatar">{{ (r.nickname || '?').charAt(0) }}</span>
                <span class="rl-name">{{ r.nickname }}</span>
                <span class="rl-score">{{ '★'.repeat(r.score) }}<i>{{ '☆'.repeat(5 - r.score) }}</i></span>
                <span class="rl-time">{{ fmtDate(r.created_at) }}</span>
              </div>
              <div class="rl-comment" v-if="r.comment">{{ r.comment }}</div>
            </div>
            <div v-if="!ratingList.length" class="rl-empty">还没有人评价，来抢首评吧</div>
          </template>
        </div>
      </div>
    </template>

    <!-- 截图放大 overlay -->
    <div v-if="showOverlay" class="overlay-mask" @click="showOverlay = false">
      <img :src="overlaySrc" class="overlay-img" />
      <button class="overlay-close" @click.stop="showOverlay = false">✕</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    async copyUrl() {
      try {
        await navigator.clipboard.writeText(location.href)
        this.showShare = false
        const { toast } = await import('@/utils/ui')
        toast('链接已复制')
      } catch (e) { /* 忽略 */ }
    }
  }
}
</script>

<style scoped>
.detail-head { display: flex; gap: 14px; margin-top: 8px; align-items: flex-start; }
.dh-icon { width: 68px; height: 68px; border-radius: var(--r-lg); display: flex; align-items: center; justify-content: center; font-size: 34px; flex-shrink: 0; box-shadow: var(--shadow-md); }
.dh-info h1 { font-size: var(--fs-20); font-weight: 800; }
.dh-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; font-size: var(--fs-12); color: var(--text-3); }
.dh-stats { display: flex; gap: 14px; margin-top: 8px; font-size: var(--fs-12); color: var(--text-2); }
.summary { font-size: var(--fs-14); color: var(--text-2); line-height: 1.6; }
.tags { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.actions { display: flex; gap: 10px; }
.actions .btn { flex-shrink: 0; }
.shot-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 2px 16px 6px; scrollbar-width: none; }
.shot-scroll::-webkit-scrollbar { display: none; }
.shot { flex-shrink: 0; width: 280px; height: 176px; object-fit: cover; border-radius: var(--r-md); background: var(--card-2); cursor: pointer; transition: transform .15s; }
.shot:active { transform: scale(.97); }
.fold-title { display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
.fold-arrow { display: inline-block; font-size: var(--fs-12); color: var(--text-3); transition: transform .2s; margin-left: 6px; }
.fold-arrow.expanded { transform: rotate(180deg); }
.overlay-mask { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,.88); display: flex; align-items: center; justify-content: center; }
.overlay-img { max-width: 92vw; max-height: 84vh; object-fit: contain; border-radius: var(--r-md); }
.overlay-close { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.15); color: #fff; font-size: 20px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
.ver-item { display: flex; align-items: center; gap: 10px; padding: 13px 16px; margin: 0 16px 8px; }
.vlog { font-size: var(--fs-12); color: var(--text-3); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70vw; }
.ver-dl { color: var(--brand); font-size: var(--fs-13); font-weight: 600; flex-shrink: 0; }
.report-btn { margin: 24px 16px 30px; width: calc(100% - 32px); opacity: .8; }
.rate-btn { cursor: pointer; }
.rate-btn em { font-style: normal; color: var(--text-3); font-size: var(--fs-10); margin-left: 2px; }
.my-rate { display: flex; align-items: center; gap: 8px; font-size: var(--fs-13); color: var(--text-2); }
.my-rate .stars { color: var(--warning); letter-spacing: 2px; }
.my-rate a { color: var(--brand); }
.rate-stars { display: flex; justify-content: center; gap: 10px; padding: 10px 0 4px; }
.rs-star { font-size: 34px; color: var(--divider); cursor: pointer; transition: transform .12s, color .12s; line-height: 1; }
.rs-star.on { color: var(--warning); transform: scale(1.08); }
.rate-label { text-align: center; font-size: var(--fs-12); color: var(--text-3); margin: 4px 0 10px; }
.rate-comment { width: 100%; min-height: 64px; padding: 10px 12px; border-radius: var(--r-md); background: var(--card-2); font-size: var(--fs-14); resize: none; margin-bottom: 12px; }
.sheet-list .sheet-title { margin-bottom: 8px; }
.rl-body { max-height: 46vh; overflow-y: auto; }
.rl-empty { text-align: center; color: var(--text-3); font-size: var(--fs-13); padding: 26px 0; }
.rl-item { padding: 12px 0; border-bottom: 1px solid var(--divider); }
.rl-item:last-child { border-bottom: none; }
.rl-head { display: flex; align-items: center; gap: 8px; }
.rl-avatar { width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 50%; background: var(--brand-soft); color: var(--brand); font-size: var(--fs-12); font-weight: 700; flex-shrink: 0; }
.rl-name { font-size: var(--fs-13); font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rl-score { color: var(--warning); font-size: var(--fs-12); letter-spacing: 1px; }
.rl-score i { font-style: normal; color: var(--divider); }
.rl-time { font-size: var(--fs-10); color: var(--text-3); flex-shrink: 0; }
.rl-comment { margin-top: 6px; font-size: var(--fs-13); color: var(--text-2); line-height: 1.6; }
</style>