<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { LEVELS, expProgress } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const userStore = useUserStore()

const me = computed(() => userStore.userInfo || {})
const myLv = computed(() => (me.value.lv ? Number(me.value.lv) : 1))
const cur = computed(() => LEVELS.find((l) => l.lv === myLv.value) || LEVELS[0])
const prog = computed(() => expProgress(myLv.value, Number(me.value.exp || 0)))
const maxed = computed(() => myLv.value >= LEVELS[LEVELS.length - 1].lv)

function clickEntry(routePath) {
  if (!userStore.isLogin) { router.push('/login'); return }
  router.push(routePath)
}
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="我的等级" />

    <div class="lv-hero" v-if="cur">
      <div class="lv-big">Lv.{{ cur.lv }}</div>
      <div class="lv-name">{{ cur.name }}</div>
      <div class="lv-progress">
        <div class="pbar"><div class="pfill" :style="{ width: prog.pct + '%' }"></div></div>
        <div class="ptext">
          <template v-if="!maxed">当前 EXP {{ prog.cur }}，距 {{ prog.nextName }}（Lv.{{ prog.nextLv }}）还差 {{ prog.need - (prog.cur - cur.exp) }} EXP</template>
          <template v-else>已满级，太酷了！</template>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="sec-title">等级权益</div>
      <div class="benefit-card" v-for="(l, i) in LEVELS" :key="l.lv" :class="{ active: cur && l.lv === cur.lv }">
        <span class="b-lv">Lv.{{ l.lv }}</span>
        <div class="b-body">
          <div class="b-name">{{ l.name }}</div>
          <div class="b-benefit">{{ l.benefits || '解锁社区基础权益' }}</div>
        </div>
        <span class="b-mark" v-if="cur && l.lv === cur.lv">当前</span>
      </div>
    </div>

    <div class="container mt3">
      <div class="sec-title">快速升级</div>
      <div class="quick-item" @click="clickEntry('/checkin')">
        <span class="qi-icon">📅</span>
        <div class="qi-body"><b>每日签到</b><span>每天签到获得 EXP 与积分</span></div>
        <span class="qi-arrow">›</span>
      </div>
      <div class="quick-item" @click="clickEntry('/tasks')">
        <span class="qi-icon">🎯</span>
        <div class="qi-body"><b>做任务</b><span>完成任务获得大量 EXP</span></div>
        <span class="qi-arrow">›</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lv-hero { margin: 14px 16px; padding: 24px 20px; border-radius: var(--r-lg); background: var(--brand-grad); color: #fff; text-align: center; }
.lv-big { font-size: 46px; font-weight: 900; line-height: 1; }
.lv-name { margin-top: 6px; font-size: var(--fs-15); font-weight: 700; opacity: .95; }
.lv-progress { margin-top: 16px; text-align: left; }
.pbar { height: 8px; background: rgba(255,255,255,.3); border-radius: var(--r-full); overflow: hidden; }
.pfill { height: 100%; background: #fff; border-radius: var(--r-full); transition: width .4s; }
.ptext { margin-top: 6px; font-size: var(--fs-11); opacity: .9; }
.sec-title { margin: 18px 0 10px; font-size: var(--fs-15); font-weight: 800; }
.benefit-card { display: flex; gap: 12px; align-items: center; padding: 13px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); margin-bottom: 10px; position: relative; }
.benefit-card.active { outline: 2px solid var(--brand); }
.b-lv { font-size: var(--fs-15); font-weight: 800; color: var(--brand); width: 46px; }
.b-name { font-size: var(--fs-14); font-weight: 700; }
.b-benefit { font-size: var(--fs-12); color: var(--text-3); margin-top: 3px; }
.b-mark { position: absolute; right: 10px; top: 10px; font-size: var(--fs-10); color: #fff; background: var(--brand); padding: 2px 8px; border-radius: var(--r-full); }
.quick-item { display: flex; gap: 12px; align-items: center; padding: 13px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); margin-bottom: 10px; }
.qi-icon { font-size: 22px; }
.qi-body { flex: 1; }
.qi-body b { display: block; font-size: var(--fs-14); }
.qi-body span { font-size: var(--fs-12); color: var(--text-3); }
.qi-arrow { color: var(--text-3); font-size: 18px; }
</style>