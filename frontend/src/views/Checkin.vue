<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const userStore = useUserStore()

const status = ref(null)
const loading = ref(true)
const done = computed(() => !!(status.value && status.value.done))
const streak = computed(() => (status.value ? status.value.streak : 0))
const total = computed(() => (status.value ? status.value.total : 0))
const level = computed(() => (status.value ? status.value.level : null))

// 以最近 4 周（28 天）渲染签到日历，today 位于最后一列
const weeks = computed(() => {
  const set = new Set(status.value ? status.value.days || [] : [])
  const rows = []
  const today = new Date()
  for (let w = 0; w < 4; w++) {
    const row = []
    for (let d = 0; d < 7; d++) {
      const dt = new Date(today)
      dt.setDate(dt.getDate() - (7 * (3 - w)) + d) // 从最早一周的周一算起，最后一天=今天
      const key = dt.toISOString().slice(0, 10)
      row.push({
        key,
        day: dt.getDate(),
        done: set.has(key),
        isToday: key === today.toISOString().slice(0, 10),
        isFuture: dt.getTime() > today.getTime(),
      })
    }
    rows.push(row)
  }
  return rows
})

async function load() {
  loading.value = true
  try {
    status.value = await api.checkinStatus()
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function doCheckin() {
  if (!userStore.isLogin) { router.push('/login'); return }
  api.checkin().then((data) => {
    toast(`签到成功，EXP +${data.reward || data.baseExp || 5}${data.bonusExp ? '（含连签奖励 +' + data.bonusExp + '）' : ''}`)
    if (data.upgraded && data.lvInfo) toast(`🎉 升级啦！Lv.${data.lvInfo.level} ${data.lvInfo.title}`)
    userStore.refreshMe()
    load()
  }).catch((e) => toast(e.message))
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="每日签到" />

    <div class="ck-hero">
      <div class="ck-streak"><b>{{ streak }}</b><span>连续签到天数</span></div>
      <div class="ck-total">累计签到 {{ total }} 天</div>
      <div class="ck-btn-wrap">
        <button class="btn btn-primary btn-lg" :disabled="done" @click="doCheckin">{{ done ? '今日已签到' : '立即签到' }}</button>
      </div>
      <div class="ck-tip">连续签到奖励更多，7 天还有额外惊喜！</div>
    </div>

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:200px;border-radius:16px"></div></div>

    <template v-else>
      <div class="container">
        <div class="sec-title">签到日历 <span class="sub">每日 00:00 刷新</span></div>
        <div class="cal-card">
          <div class="week-head" v-for="(row) in weeks" :key="row[0].key">
            <div class="w-day" v-for="cell in row" :key="cell.key">
              <div class="w-dot" :class="{ on: cell.done, today: cell.isToday, future: cell.isFuture }">{{ cell.done ? '✓' : cell.day }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mt3">
        <div class="sec-title">签到奖励规则</div>
        <div class="rule-row" v-for="r in (status.rewards || [])" :key="r.id || r.day">
          <span class="rr-day">第 {{ r.day }} 天</span>
          <span class="rr-desc">{{ r.reward_desc }}</span>
          <span class="rr-exp">EXP +{{ r.exp }}<template v-if="r.bonus_exp"> +{{ r.bonus_exp }}</template></span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ck-hero { margin: 14px 16px; padding: 26px 20px; border-radius: var(--r-lg); background: var(--brand-grad); color: #fff; text-align: center; }
.ck-streak b { font-size: 44px; font-weight: 900; display: block; line-height: 1; }
.ck-streak span { font-size: var(--fs-12); opacity: .9; }
.ck-total { margin-top: 6px; font-size: var(--fs-12); opacity: .9; }
.ck-btn-wrap { margin-top: 16px; }
.ck-btn-wrap .btn { border: none; background: #fff; color: var(--brand); min-width: 150px; }
.ck-btn-wrap .btn:disabled { opacity: .7; }
.ck-tip { margin-top: 10px; font-size: var(--fs-11); opacity: .85; }
.sec-title { margin: 18px 0 10px; font-size: var(--fs-15); font-weight: 800; }
.sec-title .sub { font-size: var(--fs-11); color: var(--text-3); font-weight: 400; }
.cal-card { padding: 12px 8px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.week-head { display: flex; }
.w-day { flex: 1; text-align: center; padding: 4px 0; }
.w-dot { width: 32px; height: 32px; line-height: 32px; border-radius: var(--r-full); margin: 0 auto; font-size: var(--fs-12); background: var(--card-2); color: var(--text-2); }
.w-dot.on { background: var(--brand); color: #fff; }
.w-dot.today { box-shadow: 0 0 0 2px var(--brand); }
.w-dot.future { color: var(--text-3); opacity: .5; }
.rule-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); margin-bottom: 8px; }
.rr-day { font-size: var(--fs-13); font-weight: 700; color: var(--brand); width: 62px; }
.rr-desc { flex: 1; font-size: var(--fs-13); }
.rr-exp { font-size: var(--fs-12); color: var(--warn); font-weight: 700; }
</style>