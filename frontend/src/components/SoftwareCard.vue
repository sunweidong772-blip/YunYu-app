<script setup>
import { useRouter } from 'vue-router'
import { fmtNum } from '@/utils/format'

const props = defineProps({
  app: { type: Object, required: true },
})
const router = useRouter()
</script>

<template>
  <div class="sw-card" @click="router.push('/software/' + app.id)">
    <div class="sw-icon" :style="{ background: app.icon_color || 'var(--brand-soft)' }">{{ app.icon || '📦' }}</div>
    <div class="sw-body grow">
      <div class="sw-name" v-html="app.highlighted || app.name"></div>
      <div class="sw-summary ellipsis">{{ app.summary }}</div>
      <div class="sw-meta">
        <span class="badge">{{ app.category_name || (app.category && app.category.name) || '分类' }}</span>
        <span class="sw-ver" v-if="app.version">v{{ app.version }}</span>
      </div>
    </div>
    <div class="sw-stats">
      <div class="sw-dl">{{ fmtNum(app.download_count) }} 下载</div>
      <div class="sw-fav" v-if="app.favorite_count !== undefined">{{ fmtNum(app.favorite_count) }} 收藏</div>
    </div>
  </div>
</template>

<style scoped>
.sw-card { display: flex; align-items: center; gap: 12px; padding: var(--sp-3) var(--sp-4); background: var(--card); margin-bottom: 2px; cursor: pointer; transition: background 0.15s ease; }
.sw-card:nth-child(1) { border-radius: var(--r-md) var(--r-md) 0 0; }
.sw-card:last-child { border-radius: 0 0 var(--r-md) var(--r-md); }
.sw-icon { width: 46px; height: 46px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.sw-body { min-width: 0; }
.sw-name { font-size: var(--fs-15); font-weight: 600; margin-bottom: 2px; }
.sw-summary { font-size: var(--fs-12); color: var(--text-3); margin-bottom: 6px; }
.sw-meta { display: flex; align-items: center; gap: 8px; }
.sw-ver { font-size: var(--fs-11); color: var(--text-3); }
.sw-stats { text-align: right; flex-shrink: 0; }
.sw-dl { font-size: var(--fs-12); color: var(--text-2); font-weight: 600; }
.sw-fav { font-size: var(--fs-11); color: var(--text-3); margin-top: 2px; }
</style>