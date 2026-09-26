<script setup>
import { computed } from 'vue'
import { avatarText, avatarColor } from '@/utils/format'

const props = defineProps({
  name: { type: String, default: '?' },
  src: { type: String, default: '' },
  size: { type: String, default: 'm' }, // s / m / l / xl
})
const color = computed(() => avatarColor(props.name))
const cls = computed(() => 'avatar avatar-' + props.size)
const hasImg = computed(() => !!props.src && props.src !== 'undefined')
</script>

<template>
  <span v-if="hasImg" class="avatar" :class="cls"><img :src="src" alt="" loading="lazy" /></span>
  <span v-else class="avatar" :class="cls" :style="{ background: color }">{{ avatarText(name) }}</span>
</template>