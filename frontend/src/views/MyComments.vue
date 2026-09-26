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

onMounted(async () => {
  try {
    const r = await api.myComments('?page=1&pageSize=50')
    list.value = r.list || []
  } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="我的评论" showBack />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:70px;margin-bottom:10px;border-radius:12px"></div></div>

    <div class="cmt-item" v-for="c in list" :key="c.id" @click="router.push('/post/' + c.post_id)">
      <div class="ci-content">{{ c.content }}</div>
      <div class="ci-meta">
        <span>评论了《{{ c.post_title }}》</span>
        <span class="ci-time">{{ timeAgo(c.created_at) }}</span>
      </div>
    </div>
    <Empty v-if="!loading && !list.length" icon="💬" title="还没有评论" desc="看到感兴趣的帖子就去评论吧" />
  </div>
</template>

<style scoped>
.cmt-item { margin: 10px 16px 0; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.ci-content { font-size: var(--fs-14); line-height: 1.6; }
.ci-meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: var(--fs-11); color: var(--text-3); }
</style>