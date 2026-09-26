<script setup>
import { useRouter } from 'vue-router'
import { fmtNum } from '@/utils/format'

const props = defineProps({
  app: { type: Object, required: true },
})
const router = useRouter()
</script>

<template>
  <div class="sw-row" @click="router.push('/software/' + app.id)">
    <div class="sw-icon-wrap" :style="{ background: app.icon_color || 'var(--brand-soft)' }">
      <span class="sw-emoji">{{ app.icon || '📦' }}</span>
    </div>
    <div class="sw-info">
      <div class="sw-name-row">
        <span class="sw-name" v-html="app.highlighted || app.name"></span>
        <span class="sw-ver" v-if="app.version">v{{ app.version }}</span>
      </div>
      <p class="sw-desc ellipsis">{{ app.summary || '暂无简介' }}</p>
      <div class="sw-tags">
        <span class="sw-tag">{{ app.category_name || (app.category && app.category.name) || '分类' }}</span>
        <span class="sw-tag secondary">{{ fmtNum(app.download_count) }} 下载</span>
      </div>
    </div>
    <div class="sw-action">
      <button class="sw-download" @click.stop>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sw-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--card);
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid var(--divider);
}
.sw-row:last-child {
  border-bottom: none;
}
.sw-row:active {
  background: var(--bg-elev);
}

.sw-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sw-emoji {
  font-size: 26px;
}

.sw-info {
  flex: 1;
  min-width: 0;
}
.sw-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.sw-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}
.sw-ver {
  font-size: 11px;
  color: var(--text-3);
  background: var(--bg-elev);
  padding: 1px 7px;
  border-radius: var(--r-full);
  font-weight: 500;
}
.sw-desc {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 6px;
}
.sw-tags {
  display: flex;
  gap: 6px;
}
.sw-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--r-full);
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 500;
}
.sw-tag.secondary {
  background: var(--bg-elev);
  color: var(--text-3);
}

.sw-action {
  flex-shrink: 0;
}
.sw-download {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.sw-download:active {
  background: var(--brand);
  color: #fff;
  transform: scale(0.92);
}
</style>
