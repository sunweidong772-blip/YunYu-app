<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { timeAgo } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const list = ref([])
const loading = ref(true)

async function load() {
  try {
    list.value = await api.myCollections()
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

async function togglePublic(c) {
  try {
    const r = await api.collectionUpdate(c.id, { is_public: c.is_public ? 0 : 1 })
    c.is_public = r.is_public
    toast(r.is_public ? '已公开' : '已设为私密')
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="我的专题" showBack />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:110px;margin-bottom:12px;border-radius:16px"></div></div>

    <div class="coll-grid container" v-else>
      <div class="coll-card" v-for="c in list" :key="c.id" @click="router.push('/collection/' + c.id)">
        <div class="cc-top">
          <span class="cc-icon" :style="{ background: c.cover_color || 'var(--brand-grad)' }">📚</span>
          <span class="cc-vis" :class="{ pub: c.is_public }">{{ c.is_public ? '🌐 公开' : '🔒 私密' }}</span>
        </div>
        <div class="cc-title ellipsis">{{ c.name }}</div>
        <div class="cc-desc clamp2">{{ c.summary || '暂无简介' }}</div>
        <div class="cc-foot">
          <span class="cc-count">{{ c.software_count || 0 }} 款软件</span>
          <span class="cc-time">{{ timeAgo(c.updated_at) }}</span>
        </div>
        <div class="cc-ops" @click.stop>
          <button class="cc-btn" @click="router.push('/collection/' + c.id + '/edit')">编辑</button>
          <button class="cc-btn" @click="togglePublic(c)">{{ c.is_public ? '设私密' : '设公开' }}</button>
        </div>
      </div>

      <Empty v-if="!list.length" icon="📚" title="还没有专题" desc="把你的收藏软件整理成专题分享出去" />
    </div>

    <div class="footer-bar" v-if="!loading">
      <button class="btn btn-primary btn-block" @click="router.push('/my/favorites?pick=1')">＋ 生成新专题</button>
    </div>
  </div>
</template>

<style scoped>
.coll-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; padding-bottom: 90px; }
.coll-card { padding: 14px; border-radius: var(--r-lg); background: var(--card); box-shadow: var(--shadow-sm); }
.cc-top { display: flex; justify-content: space-between; align-items: center; }
.cc-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; font-size: 20px; color: #fff; }
.cc-vis { font-size: var(--fs-10); color: var(--text-3); }
.cc-vis.pub { color: var(--success, #2fb344); }
.cc-title { margin-top: 12px; font-size: var(--fs-15); font-weight: 700; }
.cc-desc { margin-top: 4px; font-size: var(--fs-12); color: var(--text-3); line-height: 1.5; }
.cc-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.cc-count { font-size: var(--fs-11); color: var(--brand); background: var(--brand-soft); padding: 2px 8px; border-radius: var(--r-full); }
.cc-time { font-size: var(--fs-10); color: var(--text-3); }
.cc-ops { display: flex; gap: 8px; margin-top: 10px; }
.cc-btn { flex: 1; height: 28px; border-radius: var(--r-full); border: 1px solid var(--divider); background: var(--card-2); color: var(--text-2); font-size: var(--fs-12); }
.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: var(--bg); border-top: 1px solid var(--divider); }
</style>