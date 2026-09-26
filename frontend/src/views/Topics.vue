<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const topics = ref([])
const loading = ref(true)

onMounted(async () => {
  try { topics.value = await api.topics() } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="热门话题" />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:90px;margin-bottom:10px;border-radius:14px"></div></div>

    <div class="topic-grid container mt3" v-else>
      <div class="t-card" v-for="t in topics" :key="t.id" @click="router.push('/topic/' + t.id)">
        <span class="t-icon">{{ t.icon || '💬' }}</span>
        <div class="t-body">
          <div class="t-name">{{ t.name }} <span class="badge" v-if="t.is_hot">🔥 热门</span></div>
          <div class="t-desc ellipsis">{{ t.description || '暂无描述' }}</div>
          <div class="t-count">{{ t.post_count || 0 }} 篇帖子</div>
        </div>
      </div>
      <Empty v-if="!topics.length" icon="💬" title="还没有话题" desc="很快会有新话题上线" />
    </div>
  </div>
</template>

<style scoped>
.topic-grid { display: flex; flex-direction: column; gap: 10px; }
.t-card { display: flex; gap: 12px; align-items: center; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.t-icon { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 14px; background: var(--brand-soft); font-size: 22px; flex-shrink: 0; }
.t-name { font-size: var(--fs-15); font-weight: 700; }
.t-desc { font-size: var(--fs-12); color: var(--text-3); margin-top: 3px; }
.t-count { font-size: var(--fs-11); color: var(--brand); margin-top: 5px; }
</style>