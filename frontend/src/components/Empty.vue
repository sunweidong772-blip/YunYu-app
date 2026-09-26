<script setup>
defineProps({
  icon: { type: String, default: '🌤️' },
  title: { type: String, default: '这里还没有内容' },
  desc: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <div class="empty-icon">{{ icon }}</div>
    <div class="empty-title">{{ title }}</div>
    <div class="empty-desc" v-if="desc">{{ desc }}</div>
  </div>
</template>