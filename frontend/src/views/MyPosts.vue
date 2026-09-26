<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import PostCard from '@/components/PostCard.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()
const list = ref([])
const page = ref(1)
const done = ref(false)
const loading = ref(false)

async function load(append = false) {
  loading.value = true
  try {
    const r = await api.myPosts(`?page=${page.value}&pageSize=10`)
    const rows = r.list || []
    if (append) list.value.push(...rows)
    else list.value = rows
    if (!rows.length || !r.hasMore) done.value = true
  } catch (e) { toast(e.message) } finally { loading.value = false }
}
function loadMore() { if (!done.value && !loading.value) { page.value++; load(true) } }
onMounted(() => load())
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="我的帖子" showBack />
    <div class="plus-wrap"><button class="btn btn-primary" @click="router.push('/post/create')">＋ 发布新帖</button></div>

    <PostCard v-for="p in list" :key="p.id" :post="p" />
    <Empty v-if="!loading && !list.length" icon="📝" title="还没有发过帖子" desc="去社区分享你的第一帖吧" />
    <div class="load-more" v-if="list.length" @click="loadMore">{{ done ? '— 到底啦 —' : '加载更多' }}</div>
  </div>
</template>

<style scoped>
.plus-wrap { padding: 12px 16px 0; }
.plus-wrap .btn { width: 100%; }
</style>