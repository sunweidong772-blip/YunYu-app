<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  right: { type: String, default: '' },
  transparent: { type: Boolean, default: false },
  back: { type: Boolean, default: true },
})
const router = useRouter()
const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/home')
}
</script>

<template>
  <header class="navbar" :class="{ transparent }">
    <button v-if="back" class="navbar-back" @click="goBack">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <span v-else class="navbar-side"></span>
    <div class="navbar-title">{{ title }}</div>
    <span v-if="right" class="navbar-side" style="text-align: right"><slot name="right">{{ right }}</slot></span>
    <span v-else class="navbar-side"></span>
  </header>
</template>

<style scoped>
.transparent { background: transparent; backdrop-filter: none; }
</style>