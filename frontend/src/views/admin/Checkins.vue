<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const stats = ref(null)
const records = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 15
const editing = ref(null)

async function load() {
  try { stats.value = await api.admin.checkins() } catch (e) { toast(e.message) }
}
async function loadRecords() {
  try {
    const r = await api.admin.checkinRecords(`?page=${page.value}&pageSize=${pageSize}`)
    records.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) }
}

function openEdit(day) {
  const r = (stats.value.rewards || []).find((x) => x.day === day)
  editing.value = { day, exp: r ? r.exp : 10, bonus_exp: r ? r.bonus_exp : 0, reward_desc: r ? r.reward_desc : '' }
}
async function save() {
  try {
    const e = editing.value
    await api.admin.checkinReward(e.day, { exp: Number(e.exp) || 10, bonus_exp: Number(e.bonus_exp) || 0, reward_desc: e.reward_desc })
    toast('奖励已更新')
    editing.value = null
    load()
  } catch (e) { toast(e.message) }
}

onMounted(() => { load(); loadRecords() })
</script>

<template>
  <div class="ad-page">
    <div class="stat-mini">
      <div class="sm-card"><b>{{ stats ? stats.todayCount : '-' }}</b><span>今日签到</span></div>
      <div class="sm-card"><b>{{ stats ? stats.totalRecords : '-' }}</b><span>累计记录</span></div>
    </div>

    <div class="two-col">
      <!-- 签到奖励规则 -->
      <div class="panel">
        <div class="panel-head">签到奖励规则</div>
        <div class="rw-row" v-for="r in (stats ? stats.rewards : [])" :key="r.day" @click="openEdit(r.day)">
          <div><b>第 {{ r.day }} 天</b><span class="u-sub"> {{ r.reward_desc }}</span></div>
          <span class="rw-exp">+{{ r.exp }}<template v-if="r.bonus_exp"> +{{ r.bonus_exp }}</template></span>
          <button class="btn btn-outline btn-xs">调整</button>
        </div>
        <div class="u-sub mt2">点击任意一天的奖励可调整数值</div>
      </div>

      <!-- 排名 -->
      <div class="panel">
        <div class="panel-head">连续签到 TOP</div>
        <div class="rank-row" v-for="(u, i) in (stats ? stats.streakTop : [])" :key="i">
          <span class="rk-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <b class="ellipsis">{{ u.nickname }}</b>
          <span class="u-sub">连续 {{ u.checkin_streak }} 天</span>
        </div>
        <div class="panel-head mt2">累计签到 TOP</div>
        <div class="rank-row" v-for="(u, i) in (stats ? stats.totalTop : [])" :key="'t' + i">
          <span class="rk-num">{{ i + 1 }}</span>
          <b class="ellipsis">{{ u.nickname }}</b>
          <span class="u-sub">累计 {{ u.checkin_total }} 天</span>
        </div>
      </div>
    </div>

    <!-- 记录 -->
    <div class="panel mt2">
      <div class="panel-head">签到记录（共 {{ total }} 条）</div>
      <div class="rec-row" v-for="r in records" :key="r.id">
        <b>{{ r.nickname }}</b>
        <span class="u-sub">第 {{ r.day }} 天 · +{{ r.reward_exp }} EXP</span>
        <span class="u-sub">{{ fmtDateTime(r.created_at) }}</span>
      </div>
      <div class="empty" v-if="!records.length">暂无记录</div>
      <div class="pager" v-if="total > pageSize">
        <button class="btn btn-outline btn-xs" :disabled="page <= 1" @click="page--; loadRecords()">上一页</button>
        <span class="u-sub">第 {{ page }} 页</span>
        <button class="btn btn-outline btn-xs" :disabled="page * pageSize >= total" @click="page++; loadRecords()">下一页</button>
      </div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>调整第 {{ editing.day }} 天奖励</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">基础 EXP</label>
          <input v-model.number="editing.exp" type="number" class="f-input" />
          <label class="m-label">额外 EXP（连续奖励）</label>
          <input v-model.number="editing.bonus_exp" type="number" class="f-input" />
          <label class="m-label">奖励说明</label>
          <input v-model="editing.reward_desc" class="f-input" placeholder="如：签到基础奖励" />
          <button class="btn btn-primary btn-block mt2" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-mini { display: flex; gap: 10px; margin-bottom: 12px; }
.sm-card { flex: 1; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); text-align: center; }
.sm-card b { display: block; font-size: var(--fs-24); font-weight: 900; color: var(--brand); }
.sm-card span { font-size: var(--fs-12); color: var(--text-3); }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.panel { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); padding: 14px; }
.panel-head { font-size: var(--fs-14); font-weight: 700; margin-bottom: 8px; }
.mt2 { margin-top: 12px; }
.rw-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--divider); font-size: var(--fs-13); cursor: pointer; }
.rw-row > div { flex: 1; }
.rw-exp { color: var(--warning); font-weight: 700; font-size: var(--fs-12); }
.rank-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: var(--fs-13); }
.rk-num { width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 6px; background: var(--card-2); font-size: var(--fs-11); }
.rk-num.top { background: var(--warning); color: #fff; }
.rank-row b { flex: 1; }
.rec-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--divider); font-size: var(--fs-13); }
.rec-row b { width: 120px; }
.rec-row .u-sub:last-child { margin-left: auto; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.btn-xs { height: 27px; font-size: var(--fs-11); padding: 0 9px; border-radius: 8px; }
.pager { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 400px); background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.mt2 { margin-top: 14px; }
@media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
</style>