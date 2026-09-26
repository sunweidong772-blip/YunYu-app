<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const tab = ref('official')
const official = ref([])
const userColls = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    official.value = await api.softwareCollections()
    userColls.value = await api.collectionGallary()
  } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="发现合集" />

    <div class="tabs">
      <div class="tab" :class="{ on: tab === 'official' }" @click="tab = 'official'">官方合集</div>
      <div class="tab" :class="{ on: tab === 'user' }" @click="tab = 'user'">用户专题</div>
    </div>

    <div v-if="loading" class="container mt3">
      <div class="skeleton" style="height:110px;margin-bottom:12px;border-radius:16px"></div>
      <div class="skeleton" style="height:110px;border-radius:16px"></div>
    </div>

    <div class="coll-grid container" v-else-if="tab === 'official'">
      <div class="coll-card" v-for="c in official" :key="c.id" @click="router.push('/s-collection/' + c.id)">
        <div class="cc-top">
          <span class="cc-icon" :style="{ background: c.cover_color || 'var(--brand-grad)' }">💎</span>
          <span class="cc-count">{{ (c.software_ids || []).length }} 款</span>
        </div>
        <div class="cc-title">{{ c.name }}</div>
        <div class="cc-desc clamp2">{{ c.description }}</div>
      </div>
      <Empty v-if="!official.length" icon="💎" title="暂无合集" desc="管理员正在准备中" />
    </div>

    <div class="coll-grid container" v-else>
      <div class="coll-card" v-for="c in userColls" :key="c.id" @click="router.push('/collection/' + c.id)">
        <div class="cc-top">
          <span class="cc-icon" :style="{ background: c.cover_color || 'var(--brand-grad)' }">📚</span>
          <span class="cc-count">{{ c.software_count || 0 }} 款</span>
        </div>
        <div class="cc-title">{{ c.name }}</div>
        <div class="cc-desc clamp2">{{ c.summary || '暂无简介' }}</div>
        <div class="cc-meta">
          <span>by {{ c.nickname }}</span>
          <span v-if="c.follow_count !== undefined">👤 {{ c.follow_count }} 关注</span>
        </div>
      </div>
      <Empty v-if="!userColls.length" icon="📚" title="暂无用户专题" desc="快去创建你的第一个专题吧" />
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; border-bottom: 1px solid var(--divider); background: var(--card); margin-top: 8px; }
.tab { flex: 1; text-align: center; padding: 12px 0; font-size: var(--fs-14); color: var(--text-3); }
.tab.on { color: var(--brand); font-weight: 700; box-shadow: inset 0 -2px 0 var(--brand); }
.coll-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
.coll-card { padding: 14px; border-radius: var(--r-lg); background: var(--card); box-shadow: var(--shadow-sm); }
.cc-top { display: flex; justify-content: space-between; align-items: center; }
.cc-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; font-size: 20px; color: #fff; }
.cc-count { font-size: var(--fs-11); color: var(--text-3); background: var(--card-2); padding: 2px 8px; border-radius: var(--r-full); }
.cc-title { margin-top: 12px; font-size: var(--fs-15); font-weight: 700; }
.cc-desc { margin-top: 4px; font-size: var(--fs-12); color: var(--text-3); line-height: 1.5; }
.cc-meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: var(--fs-11); color: var(--text-3); }
</style>