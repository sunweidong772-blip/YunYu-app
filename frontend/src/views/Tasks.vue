<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const userStore = useUserStore()

const data = ref(null)
const loading = ref(true)

async function load() {
  try {
    data.value = await api.tasks()
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function claim(t) {
  api.claimTask(t.id).then((r) => {
    toast(`+EXP ${r.gained || ''} 领取成功`)
    userStore.refreshMe()
    load()
  }).catch((e) => toast(e.message))
}

function go(name) {
  const m = { checkin: '/checkin', post: '/post/create', comment: '/community', like: '/community', browse: '/software', favorite: '/software' }
  router.push(m[name] || '/community')
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="每日任务" />

    <div class="task-hero" v-if="data">
      <div class="th-grid">
        <div class="th-cell"><b>{{ data.doneCount }}</b><span>今日完成</span></div>
        <div class="th-cell"><b>{{ data.claimable }}</b><span>可领取</span></div>
        <div class="th-cell"><b>{{ data.expToday }}</b><span>今日 EXP</span></div>
      </div>
    </div>

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:80px;margin-bottom:10px;border-radius:14px"></div></div>

    <div class="container mt3" v-else-if="data">
      <div class="task-card" v-for="t in data.list" :key="t.id">
        <div class="tc-icon">{{ t.icon || '🎯' }}</div>
        <div class="tc-body">
          <div class="tc-name">{{ t.name }} <span class="tc-exp">+{{ t.exp }} EXP</span></div>
          <div class="tc-desc">{{ t.description }}</div>
          <div class="tc-progress"><div class="pbar"><div class="pfill" :style="{ width: Math.min(100, t.progress / t.target * 100) + '%' }"></div></div><span>{{ t.progress }}/{{ t.target }}</span></div>
        </div>
        <button class="btn btn-sm" :class="t.claimed ? 'btn-disabled' : (t.completed ? 'btn-primary' : 'btn-outline')"
          :disabled="t.claimed || !t.completed" @click="t.claimed ? null : (t.completed ? claim(t) : go(t.code))">
          {{ t.claimed ? '已领取' : (t.completed ? '领取' : '去完成') }}
        </button>
      </div>
      <Empty v-if="!data.list.length" icon="🎯" title="暂无任务" desc="任务正在准备中" />
    </div>
  </div>
</template>

<style scoped>
.task-hero { margin: 14px 16px; padding: 20px; border-radius: var(--r-lg); background: var(--brand-grad); color: #fff; }
.th-grid { display: flex; }
.th-cell { flex: 1; text-align: center; }
.th-cell b { display: block; font-size: var(--fs-26); font-weight: 900; }
.th-cell span { font-size: var(--fs-12); opacity: .9; }
.task-card { display: flex; gap: 12px; align-items: center; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); margin-bottom: 10px; }
.tc-icon { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 12px; background: var(--brand-soft); font-size: 20px; flex-shrink: 0; }
.tc-body { flex: 1; min-width: 0; }
.tc-name { font-size: var(--fs-14); font-weight: 700; }
.tc-exp { font-size: var(--fs-11); color: var(--warn); margin-left: 4px; }
.tc-desc { font-size: var(--fs-12); color: var(--text-3); margin-top: 2px; }
.tc-progress { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.tc-progress .pbar { flex: 1; height: 5px; background: var(--card-2); border-radius: var(--r-full); overflow: hidden; }
.tc-progress .pfill { height: 100%; background: var(--brand); border-radius: var(--r-full); }
.tc-progress span { font-size: var(--fs-10); color: var(--text-3); }
.btn-sm { min-width: 64px; font-size: var(--fs-12); }
</style>