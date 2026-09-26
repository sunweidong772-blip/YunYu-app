<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { timeAgo } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const router = useRouter()
const pickMode = computed(() => route.query.pick === '1')

const list = ref([])
const loading = ref(true)
const picked = ref(new Set())

const pickCount = computed(() => picked.value.size)
const canPick = computed(() => list.value.some((f) => f.target_type === 'software'))

async function load() {
  try {
    const r = await api.myFavorites('?page=1&pageSize=100')
    list.value = r.list || []
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function open(item) {
  if (pickMode.value) return
  router.push(item.target_type === 'post' ? '/post/' + item.target_id : '/software/' + item.target_id)
}

function togglePick(item) {
  if (item.target_type !== 'software') return
  const s = new Set(picked.value)
  if (s.has(item.target_id)) s.delete(item.target_id)
  else s.add(item.target_id)
  picked.value = s
}

function genTopic() {
  const ids = [...picked.value]
  if (!ids.length) return toast('请先勾选至少一款软件')
  router.push('/collection/create?selected=' + ids.join(','))
}

async function remove(item) {
  const ok = await confirmDialog('取消收藏', `确定不再收藏「${item.name}」吗？`)
  if (!ok) return
  try {
    if (item.target_type === 'post') await api.postUnfavorite(item.target_id)
    else await api.softwareUnfavorite(item.target_id)
    toast('已取消收藏')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar :title="pickMode ? '选择软件生成专题' : '我的收藏'" :showBack="!!route.query.pick" />

    <div v-if="!pickMode" class="topic-bar">
      <button class="tb-btn" @click="router.push('/my/collections')">📚 我的专题</button>
      <button class="tb-btn primary" @click="router.push('/my/favorites?pick=1')">＋ 生成专题</button>
    </div>

    <div v-if="pickMode" class="pick-tip">
      <span>仅可勾选收藏的<b>软件</b>，帖子不可选</span>
    </div>

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:70px;margin-bottom:10px;border-radius:12px"></div></div>

    <template v-else>
      <div class="fav-item" v-for="f in list" :key="f.fav_id" :class="{ pickable: pickMode && f.target_type === 'software', picked: picked.has(f.target_id) }" @click="pickMode ? togglePick(f) : open(f)">
        <span v-if="pickMode" class="fi-check">{{ picked.has(f.target_id) ? '✓' : '' }}</span>
        <span class="fi-type" :class="f.target_type">{{ f.target_type === 'post' ? '帖' : '软' }}</span>
        <div class="fi-body">
          <div class="fi-name ellipsis">{{ f.name }}</div>
          <div class="fi-sum clamp2">{{ f.summary || '暂无简介' }}</div>
          <div class="fi-time">收藏于 {{ timeAgo(f.created_at) }}</div>
        </div>
        <span v-if="!pickMode" class="fi-del" @click.stop="remove(f)">✕</span>
      </div>
      <Empty v-if="!list.length" icon="⭐" title="还没有收藏" desc="收藏的帖子与软件会出现在这里" />
    </template>

    <div class="pick-bar" v-if="pickMode">
      <span class="pb-count">已选 {{ pickCount }} 款</span>
      <button class="btn btn-primary grow" :disabled="!pickCount" @click="genTopic">生成专题（{{ pickCount }}）</button>
    </div>
  </div>
</template>

<style scoped>
.topic-bar { display: flex; gap: 10px; padding: 12px 16px 0; }
.tb-btn { flex: 1; height: 38px; border-radius: var(--r-full); border: 1px solid var(--divider); background: var(--card); color: var(--text-1); font-size: var(--fs-13); font-weight: 600; }
.tb-btn.primary { background: var(--brand); color: #fff; border-color: var(--brand); }
.pick-tip { margin: 12px 16px 0; font-size: var(--fs-12); color: var(--text-3); }
.pick-tip b { color: var(--brand); }
.fav-item { display: flex; gap: 12px; align-items: flex-start; margin: 10px 16px 0; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.fav-item.pickable { cursor: pointer; }
.fav-item.picked { box-shadow: 0 0 0 2px var(--brand) inset; }
.fi-check { flex-shrink: 0; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; border: 1.5px solid var(--divider-2, var(--divider)); font-size: 12px; color: #fff; margin-top: 6px; }
.fav-item.picked .fi-check { background: var(--brand); border-color: var(--brand); }
.fi-type { flex-shrink: 0; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 10px; font-size: var(--fs-11); font-weight: 700; }
.fi-type.post { background: var(--brand-soft); color: var(--brand); }
.fi-type.software { background: var(--warning-soft); color: var(--warning); }
.fi-body { flex: 1; min-width: 0; }
.fi-name { font-size: var(--fs-14); font-weight: 700; }
.fi-sum { font-size: var(--fs-12); color: var(--text-3); margin-top: 3px; line-height: 1.5; }
.fi-time { font-size: var(--fs-10); color: var(--text-3); margin-top: 5px; }
.fi-del { color: var(--text-3); font-size: 14px; padding: 4px; }
.pick-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: var(--bg); border-top: 1px solid var(--divider); }
.pb-count { font-size: var(--fs-13); color: var(--text-2); white-space: nowrap; }
</style>