<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { fmtNum } from '@/utils/format'
import { toast } from '@/utils/ui'

const router = useRouter()
const data = ref(null)
const loading = ref(true)

const cards = computed(() => data.value ? [
  { label: '用户总数', value: fmtNum(data.value.stats.userTotal), sub: `今日 +${data.value.stats.userToday}`, icon: '👥', color: 'blue', path: '/admin/users' },
  { label: '帖子总数', value: fmtNum(data.value.stats.postTotal), sub: `今日 +${data.value.stats.postToday}`, icon: '📝', color: 'green', path: '/admin/posts' },
  { label: '软件收录', value: fmtNum(data.value.stats.softwareTotal), sub: `下载 ${fmtNum(data.value.stats.downloadTotal)} 次`, icon: '📦', color: 'orange', path: '/admin/software' },
  { label: '今日签到', value: fmtNum(data.value.stats.checkinToday), sub: `活跃用户 ${fmtNum(data.value.stats.activeUsers)}`, icon: '📅', color: 'purple', path: '/admin/checkins' },
  { label: '累计下载', value: fmtNum(data.value.stats.downloadTotal), sub: `近7天 +${sumOf(data.value.downloadTrend, 'downloads')}`, icon: '⬇️', color: 'cyan', path: '/admin/software' },
  { label: '用户专题', value: fmtNum(data.value.collectionTotal), sub: `评分总数 ${ratingTotal.value}`, icon: '📚', color: 'pink', path: '/admin/u-collections' },
] : [])

function sumOf(arr, key) {
  return (arr || []).reduce((s, x) => s + (x[key] || 0), 0)
}

const ratingTotal = computed(() => (data.value ? sumOf(data.value.ratingDist, 'count') : 0))

const ratingAvg = computed(() => {
  const d = data.value
  if (!d || !ratingTotal.value) return '—'
  const sum = (d.ratingDist || []).reduce((s, x) => s + x.score * x.count, 0)
  return (sum / ratingTotal.value).toFixed(2)
})

function ratingPct(score) {
  if (!ratingTotal.value) return 0
  const c = (data.value.ratingDist || []).find((x) => x.score === score)
  return Math.round(((c ? c.count : 0) / ratingTotal.value) * 100)
}

const trendMax = computed(() => {
  const arr = data.value ? data.value.downloadTrend || [] : []
  return Math.max(1, ...arr.map((x) => Math.max(x.downloads, x.ratings)))
})

const eventMax = computed(() => {
  const arr = data.value && data.value.eventStats ? data.value.eventStats.eventTrend || [] : []
  return Math.max(1, ...arr.map((x) => Math.max(x.pageViews, x.clicks)))
})

onMounted(async () => {
  try {
    data.value = await api.admin.dashboard()
  } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="ad-page">
    <h2 class="p-title">数据看板 <span class="sub">云屿运营总览</span></h2>

    <div v-if="loading" class="skeleton" style="height:120px;border-radius:14px"></div>

    <template v-else-if="data">
      <!-- 统计卡片 -->
      <div class="stat-grid">
        <div class="stat-card" v-for="c in cards" :key="c.label" @click="router.push(c.path)">
          <div class="sc-icon" :class="c.color">{{ c.icon }}</div>
          <div class="sc-body">
            <b>{{ c.value }}</b>
            <span>{{ c.label }}</span>
            <em>{{ c.sub }}</em>
          </div>
        </div>
      </div>

      <!-- 待处理 + 最近动态 -->
      <div class="two-col">
        <div class="panel">
          <div class="panel-head">待处理举报 <span class="cnt" v-if="data.stats.reportPending">{{ data.stats.reportPending }}</span></div>
          <div class="mini-row" v-for="r in data.pendingReports" :key="r.id" @click="router.push('/admin/reports')">
            <span class="mr-type">{{ r.target_type }}</span>
            <div class="mr-body">
              <b class="ellipsis">{{ r.reason || '举报' }}</b>
              <span class="mr-sub">举报人：{{ r.reporter_name }} · 对象：{{ r.target_title || '#' + r.target_id }}</span>
            </div>
            <span class="badge warning">待处理</span>
          </div>
          <div class="panel-empty" v-if="!data.pendingReports.length">✅ 暂无待处理举报</div>
        </div>

        <div class="panel">
          <div class="panel-head">最新成员</div>
          <div class="mini-row" v-for="u in data.latestUsers" :key="u.id" @click="router.push('/admin/users')">
            <span class="mr-avatar">{{ (u.nickname || '?').charAt(0) }}</span>
            <div class="mr-body">
              <b class="ellipsis">{{ u.nickname }} <em class="lv">Lv.{{ u.lv }}</em></b>
              <span class="mr-sub">UID {{ u.uid }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近 7 天趋势 -->
      <div class="panel mt2">
        <div class="panel-head">近 7 天趋势</div>
        <div class="trend-chart">
          <div class="trend-col" v-for="(t, i) in data.trend" :key="t.date">
            <div class="tc-bar-wrap">
              <div class="tc-bar users" :style="{ height: (t.users / Math.max(1, Math.max(...data.trend.map(x => x.users))) * 60) + 'px' }" :title="'新增用户 ' + t.users"></div>
              <div class="tc-bar posts" :style="{ height: (t.posts / Math.max(1, Math.max(...data.trend.map(x => x.posts))) * 60) + 'px' }" :title="'新增帖子 ' + t.posts"></div>
            </div>
            <span class="tc-day">{{ t.date.slice(5) }}</span>
            <span class="tc-num">{{ t.users }}</span>
          </div>
        </div>
        <div class="legend"><span><i class="lg users"></i>新增用户</span><span><i class="lg posts"></i>新增帖子</span></div>
      </div>

      <!-- 下载与评分趋势 -->
      <div class="panel mt2">
        <div class="panel-head">下载 / 评分趋势 <span class="cnt info">近 7 天</span></div>
        <div class="trend-chart">
          <div class="trend-col" v-for="(t, i) in data.downloadTrend" :key="t.date">
            <div class="tc-bar-wrap wide">
              <div class="tc-bar dl" :style="{ height: (t.downloads / trendMax * 60) + 'px' }" :title="'下载 ' + t.downloads"></div>
              <div class="tc-bar rt" :style="{ height: (t.ratings / trendMax * 60) + 'px' }" :title="'评分 ' + t.ratings"></div>
            </div>
            <span class="tc-day">{{ t.date.slice(5) }}</span>
            <span class="tc-num">{{ t.downloads }}</span>
          </div>
        </div>
        <div class="legend"><span><i class="lg dl"></i>下载 {{ sumOf(data.downloadTrend, 'downloads') }}</span><span><i class="lg rt"></i>评分 {{ sumOf(data.downloadTrend, 'ratings') }}</span></div>
      </div>

      <!-- 评分分布 -->
      <div class="panel mt2">
        <div class="panel-head">评分分布 <span class="cnt info">{{ ratingTotal }} 人评分 · 平均 {{ ratingAvg }} 星</span></div>
        <div class="rd-list">
          <div class="rd-row" v-for="s in [5, 4, 3, 2, 1]" :key="s">
            <span class="rd-star">{{ s }}★</span>
            <div class="rd-track">
              <div class="rd-fill" :style="{ width: ratingPct(s) + '%' }"></div>
            </div>
            <span class="rd-pct">{{ ratingPct(s) }}%</span>
          </div>
        </div>
      </div>

      <!-- 活跃软件榜 -->
      <div class="panel mt2">
        <div class="panel-head">活跃软件 TOP8 <span class="cnt info">按下载量</span></div>
        <div class="hot-row" v-for="(a, i) in data.activeSoftware" :key="a.id" @click="router.push('/admin/software/' + a.id)">
          <span class="hr-rank" :class="'r' + (i + 1)">{{ i + 1 }}</span>
          <span class="hr-icon" :style="{ background: a.icon_color || 'var(--brand-soft)' }">{{ a.icon || '📦' }}</span>
          <span class="hr-name ellipsis">{{ a.name }}</span>
          <span class="hr-nums">
            <em>⬇ {{ fmtNum(a.download_count) }}</em>
            <em>⭐ {{ a.rating ? a.rating.toFixed(1) : '—' }}</em>
            <em>🔖 {{ fmtNum(a.favorite_count) }}</em>
          </span>
        </div>
        <div class="panel-empty" v-if="!data.activeSoftware.length">暂无软件</div>
      </div>

      <!-- 用户行为事件看板 -->
      <template v-if="data.eventStats">
        <div class="panel mt2">
          <div class="panel-head">用户行为事件 <span class="cnt info">{{ data.eventStats.pageViewsToday }} PV 今日</span></div>
          <div class="ev-grid">
            <div class="ev-card">
              <b>{{ fmtNum(data.eventStats.pageViewsToday) }}</b>
              <span>今日页面浏览</span>
            </div>
            <div class="ev-card">
              <b>{{ fmtNum(data.eventStats.eventsToday) }}</b>
              <span>今日总事件</span>
            </div>
          </div>
        </div>

        <div class="panel mt2">
          <div class="panel-head">事件趋势 <span class="cnt info">近 7 天</span></div>
          <div class="trend-chart">
            <div class="trend-col" v-for="(t, i) in data.eventStats.eventTrend" :key="t.date">
              <div class="tc-bar-wrap wide">
                <div class="tc-bar ev-pv" :style="{ height: (t.pageViews / Math.max(1, eventMax) * 60) + 'px' }" :title="'PV ' + t.pageViews"></div>
                <div class="tc-bar ev-click" :style="{ height: (t.clicks / Math.max(1, eventMax) * 60) + 'px' }" :title="'点击 ' + t.clicks"></div>
              </div>
              <span class="tc-day">{{ t.date.slice(5) }}</span>
              <span class="tc-num">{{ t.pageViews }}</span>
            </div>
          </div>
          <div class="legend"><span><i class="lg ev-pv"></i>页面浏览</span><span><i class="lg ev-click"></i>点击事件</span></div>
        </div>

        <div class="panel mt2">
          <div class="panel-head">热门事件 TOP8 <span class="cnt info">近 7 天</span></div>
          <div class="hot-row" v-for="(e, i) in data.eventStats.topEvents" :key="e.event_name">
            <span class="hr-rank" :class="'r' + (i + 1)">{{ i + 1 }}</span>
            <span class="hr-name ellipsis">{{ e.event_name }}</span>
            <span class="hr-nums"><em>{{ fmtNum(e.c) }} 次</em></span>
          </div>
          <div class="panel-empty" v-if="!data.eventStats.topEvents.length">暂无事件数据</div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.p-title { font-size: var(--fs-20); font-weight: 800; margin-bottom: 16px; }
.p-title .sub { font-size: var(--fs-12); color: var(--text-3); font-weight: 400; margin-left: 8px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { display: flex; gap: 12px; align-items: center; padding: 16px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); cursor: pointer; }
.sc-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.sc-icon.blue { background: var(--brand-soft); }
.sc-icon.green { background: var(--success-soft, rgba(16,185,129,.12)); }
.sc-icon.orange { background: var(--warning-soft); }
.sc-icon.purple { background: rgba(155,107,255,.12); }
.sc-icon.cyan { background: rgba(14,165,233,.12); }
.sc-icon.pink { background: rgba(236,72,153,.12); }
.sc-body { display: flex; flex-direction: column; }
.sc-body b { font-size: var(--fs-22); font-weight: 900; }
.sc-body span { font-size: var(--fs-12); color: var(--text-3); }
.sc-body em { font-style: normal; font-size: var(--fs-11); color: var(--text-3); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.panel { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); padding: 14px; }
.panel-head { font-size: var(--fs-14); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.panel-head .cnt { background: var(--danger); color: #fff; font-size: var(--fs-10); padding: 0 7px; border-radius: var(--r-full); }
.mini-row { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-top: 1px solid var(--divider); cursor: pointer; }
.mr-type { font-size: var(--fs-10); color: var(--brand); background: var(--brand-soft); padding: 2px 8px; border-radius: var(--r-full); flex-shrink: 0; }
.mr-avatar { width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; background: var(--brand-soft); color: var(--brand); font-weight: 700; flex-shrink: 0; }
.mr-body { flex: 1; min-width: 0; }
.mr-body b { display: block; font-size: var(--fs-13); }
.mr-body em.lv { font-style: normal; color: var(--brand); font-size: var(--fs-11); }
.mr-sub { font-size: var(--fs-11); color: var(--text-3); }
.panel-empty { text-align: center; color: var(--text-3); font-size: var(--fs-13); padding: 20px 0; }
.trend-chart { display: flex; align-items: flex-end; gap: 8px; height: 110px; padding: 10px 4px 0; }
.trend-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.tc-bar-wrap { display: flex; align-items: flex-end; gap: 3px; height: 68px; }
.tc-bar { width: 14px; border-radius: 4px 4px 0 0; min-height: 2px; transition: height .5s; }
.tc-bar.users { background: var(--brand); opacity: .85; }
.tc-bar.posts { background: var(--warning); opacity: .85; }
.tc-day { font-size: var(--fs-10); color: var(--text-3); }
.tc-num { font-size: var(--fs-10); color: var(--text-2); }
.legend { display: flex; gap: 16px; margin-top: 8px; font-size: var(--fs-11); color: var(--text-3); }
.legend span { display: flex; align-items: center; gap: 5px; }
.lg { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.lg.users { background: var(--brand); }
.lg.posts { background: var(--warning); }
.lg.dl { background: var(--success, #2fb344); }
.lg.rt { background: var(--danger, #e5484d); }
.tc-bar-wrap.wide { gap: 4px; }
.tc-bar.dl { background: var(--success, #2fb344); opacity: .9; }
.tc-bar.rt { background: var(--danger, #e5484d); opacity: .85; }
.cnt.info { background: var(--brand-soft); color: var(--brand); font-size: var(--fs-10); padding: 0 8px; border-radius: var(--r-full); }
.rd-list { display: flex; flex-direction: column; gap: 8px; }
.rd-row { display: flex; align-items: center; gap: 10px; }
.rd-star { width: 28px; font-size: var(--fs-12); color: var(--warning); font-weight: 700; }
.rd-track { flex: 1; height: 14px; border-radius: var(--r-full); background: var(--divider); overflow: hidden; }
.rd-fill { height: 100%; border-radius: var(--r-full); background: linear-gradient(90deg, var(--warning), #f6b93b); transition: width .5s; }
.rd-pct { width: 40px; text-align: right; font-size: var(--fs-11); color: var(--text-3); }
.hot-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--divider); cursor: pointer; }
.hot-row:first-of-type { border-top: none; }
.hr-rank { width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 6px; background: var(--card-2); color: var(--text-3); font-size: var(--fs-11); font-weight: 700; flex-shrink: 0; }
.hr-rank.r1 { background: rgba(255,193,7,.18); color: #d4a017; }
.hr-rank.r2 { background: rgba(148,163,184,.2); color: #64748b; }
.hr-rank.r3 { background: rgba(180,83,9,.15); color: #b45309; }
.hr-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; font-size: 16px; flex-shrink: 0; }
.hr-name { flex: 1; min-width: 0; font-size: var(--fs-13); font-weight: 600; }
.hr-nums { display: flex; gap: 10px; flex-shrink: 0; }
.hr-nums em { font-style: normal; font-size: var(--fs-11); color: var(--text-3); }
.mt2 { margin-top: 12px; }

@media (max-width: 700px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
</style>