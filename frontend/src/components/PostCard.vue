<script setup>
import { useRouter } from 'vue-router'
import Avatar from './Avatar.vue'
import { timeAgo, fmtNum } from '@/utils/format'

const props = defineProps({
  post: { type: Object, required: true },
})
const router = useRouter()
</script>

<template>
  <div class="post-card card" @click="router.push('/post/' + post.id)">
    <!-- 作者行 -->
    <div class="pc-author">
      <Avatar :name="post.nickname" :src="post.avatar" size="m" />
      <div class="pc-meta">
        <div class="pc-name-row">
          <span class="pc-nick">{{ post.nickname }}</span>
          <span class="pc-lv" v-if="post.lv">LV{{ post.lv }}</span>
          <span class="pc-tag official" v-if="post.is_official">官方</span>
        </div>
        <div class="pc-time">{{ timeAgo(post.created_at) }}</div>
      </div>
      <span class="pc-topic" v-if="post.topic_name">{{ post.topic_name }}</span>
    </div>

    <!-- 标题 -->
    <h3 class="pc-title" v-html="post.highlighted || post.title"></h3>

    <!-- 内容摘要 -->
    <p class="pc-body clamp2" v-if="post.content">{{ post.content }}</p>

    <!-- 图片 -->
    <div class="pc-images" v-if="post.images && post.images.length">
      <div class="img-grid" :class="{ 'single': post.images.length === 1, 'triple': post.images.length >= 2 }">
        <img
          v-for="(img, i) in post.images.slice(0, 3)"
          :key="i"
          :src="img"
          class="pc-img"
          loading="lazy"
          @click.stop="router.push('/post/' + post.id)"
        />
      </div>
    </div>

    <!-- 底部交互 -->
    <div class="pc-footer">
      <div class="pc-stat">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
        <span>{{ fmtNum(post.like_count) }}</span>
      </div>
      <div class="pc-stat">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <span>{{ fmtNum(post.comment_count) }}</span>
      </div>
      <div class="pc-stat">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
        <span>{{ fmtNum(post.share_count || 0) }}</span>
      </div>
      <div class="pc-more" @click.stop>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  padding: 14px 16px;
  margin: 0 16px 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.post-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

/* 作者 */
.pc-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.pc-meta {
  flex: 1;
  min-width: 0;
}
.pc-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pc-nick {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}
.pc-lv {
  font-size: 10px;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 1px 7px;
  border-radius: var(--r-full);
}
.pc-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--r-full);
}
.pc-tag.official {
  background: var(--brand-soft);
  color: var(--brand);
}
.pc-time {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
.pc-topic {
  font-size: 11px;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 3px 10px;
  border-radius: var(--r-full);
  flex-shrink: 0;
  font-weight: 500;
}

/* 标题 */
.pc-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--text-1);
  margin-bottom: 8px;
}

/* 内容 */
.pc-body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
  margin-bottom: 10px;
}

/* 图片 */
.pc-images {
  margin-bottom: 10px;
}
.img-grid {
  display: grid;
  gap: 6px;
}
.img-grid.single {
  grid-template-columns: 1fr;
}
.img-grid.single .pc-img {
  aspect-ratio: 16/9;
  border-radius: var(--r-md);
}
.img-grid.triple {
  grid-template-columns: repeat(3, 1fr);
}
.img-grid.triple .pc-img {
  aspect-ratio: 1;
  border-radius: var(--r-sm);
}
.pc-img {
  width: 100%;
  object-fit: cover;
  background: var(--bg-elev);
}

/* 底部 */
.pc-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 10px;
  border-top: 1px solid var(--divider);
}
.pc-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
}
.pc-stat svg {
  opacity: 0.6;
}
.pc-more {
  margin-left: auto;
  color: var(--text-3);
  padding: 4px;
}
</style>
