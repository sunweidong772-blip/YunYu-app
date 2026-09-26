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
    <div class="pc-head">
      <Avatar :name="post.nickname" :src="post.avatar" size="m" />
      <div class="pc-user grow">
        <div class="flex">
          <span class="pc-nick">{{ post.nickname }}</span>
          <span class="pc-lv" v-if="post.lv">LV{{ post.lv }}</span>
          <span class="badge badge-success" v-if="post.is_official">官方</span>
        </div>
        <div class="time-text">{{ timeAgo(post.created_at) }}</div>
      </div>
      <span class="pc-topic" v-if="post.topic_name">{{ post.topic_name }}</span>
    </div>
    <div class="pc-title" v-html="post.highlighted || post.title"></div>
    <p class="pc-summary clamp2" v-if="post.content">{{ post.content }}</p>
    <div class="pc-imgs" v-if="post.images && post.images.length">
      <img
        v-for="(img, i) in post.images.slice(0, 3)"
        :key="i"
        :src="img"
        class="pc-img"
        :class="{ wide: post.images.length === 1 }"
        loading="lazy"
        @click.stop="router.push('/post/' + post.id)"
      />
    </div>
    <div class="pc-actions">
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10v11H4V10h3zm13-1v12h-10V9l1.5-6h3l-1 6h6.5z" stroke-linejoin="round"/></svg>{{ fmtNum(post.like_count) }}</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3c5 0 9 3.7 9 8.3 0 4.6-4 8.3-9 8.3-1 0-2-.1-2.9-.4L4 21l1.4-3.5C3.9 16 3 14 3 11.8 3 6.7 7 3 12 3z" stroke-linejoin="round"/></svg>{{ fmtNum(post.comment_count) }}</span>
      <span class="pc-more" @click.stop>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.post-card { padding: var(--sp-4); margin: 0 var(--sp-4) var(--sp-3); cursor: pointer; }
.pc-head { display: flex; align-items: center; gap: 10px; }
.pc-user { min-width: 0; }
.pc-nick { font-size: var(--fs-14); font-weight: 600; margin-right: 6px; }
.pc-lv { font-size: var(--fs-10); color: var(--brand); background: var(--brand-soft); padding: 1px 7px; border-radius: var(--r-full); margin-right: 6px; }
.pc-topic { font-size: var(--fs-12); color: var(--brand); background: var(--brand-soft); padding: 3px 10px; border-radius: var(--r-full); flex-shrink: 0; }
.pc-title { margin-top: 12px; font-size: var(--fs-16); font-weight: 700; line-height: 1.4; }
.pc-summary { margin-top: 6px; font-size: var(--fs-14); color: var(--text-2); }
.pc-imgs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
.pc-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--r-sm); background: var(--card-2); }
.pc-img.wide { grid-column: 1 / -1; aspect-ratio: 16/9; }
.pc-actions { display: flex; align-items: center; gap: 22px; margin-top: 12px; color: var(--text-2); font-size: var(--fs-13); }
.pc-actions span { display: inline-flex; align-items: center; gap: 5px; }
.pc-actions svg { width: 16px; height: 16px; }
.pc-more { margin-left: auto; color: var(--text-3); }
</style>