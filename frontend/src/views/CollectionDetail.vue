<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { timeAgo } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Empty from '@/components/Empty.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const coll = ref(null)
const list = ref([])
const loading = ref(true)

const mine = computed(() => coll.value && userStore.profile && coll.value.user_id === userStore.profile.id)
const followed = computed(() => coll.value && coll.value.is_followed)

async function toggleFollow() {
  if (!userStore.isLogin) { router.push('/login'); return }
  const act = followed.value ? api.collectionUnfollow : api.collectionFollow
  try {
    const r = await act(coll.value.id)
    coll.value.is_followed = !followed.value
    coll.value.follow_count = r.follow_count || 0
    toast(followed.value ? '已关注' : '已取消关注')
  } catch (e) { toast(e.message) }
}

onMounted(async () => {
  try {
    const data = await api.collectionDetail(route.params.id)
    coll.value = data
    list.value = data.software_list || []
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
})

async function togglePublic() {
  const next = coll.value.is_public ? 0 : 1
  try {
    const r = await api.collectionUpdate(coll.value.id, { is_public: next })
    coll.value.is_public = r.is_public
    toast(r.is_public ? '专题已公开，所有人可见' : '专题已设为私密')
  } catch (e) { toast(e.message) }
}

async function remove() {
  const ok = await confirmDialog('删除专题', `确定删除「${coll.value.name}」吗？删除后不可恢复`)
  if (!ok) return
  try {
    await api.collectionDelete(coll.value.id)
    toast('专题已删除')
    router.replace('/my/collections')
  } catch (e) { toast(e.message) }
}
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="专题详情" />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:120px;border-radius:16px"></div></div>

    <template v-else-if="coll">
      <div class="hero" :style="{ background: coll.cover_color ? 'linear-gradient(135deg,' + coll.cover_color + ', ' + coll.cover_color + '99)' : 'var(--brand-grad)' }">
        <div class="hero-inner">
          <span class="hero-icon">📚</span>
          <h1>{{ coll.name }}</h1>
          <p>{{ coll.summary || '暂无简介' }}</p>
          <div class="hero-meta">
            <span class="hero-tag">{{ coll.is_public ? '🌐 公开' : '🔒 私密' }}</span>
            <span class="hero-tag">{{ list.length }} 款软件</span>
            <span class="hero-tag" v-if="coll.nickname">by {{ coll.nickname }}</span>
            <span class="hero-tag" v-if="coll.updated_at">更新于 {{ timeAgo(coll.updated_at) }}</span>
          </div>
        </div>
      </div>

      <div class="opt mt3" v-if="mine">
        <button class="btn btn-outline btn-sm grow" @click="router.push('/collection/' + coll.id + '/edit')">编辑专题</button>
        <button class="btn btn-outline btn-sm grow" @click="togglePublic">{{ coll.is_public ? '设为私密' : '设为公开' }}</button>
        <button class="btn btn-outline btn-sm grow danger" @click="remove">删除</button>
      </div>
      <div class="opt mt3" v-else-if="userStore.isLogin">
        <button class="btn btn-primary btn-block" @click="toggleFollow">{{ followed ? '✓ 已关注' : '+ 关注专题' }}</button>
      </div>

      <div class="sw-list mt4" v-if="list.length">
        <SoftwareCard v-for="a in list" :key="a.id" :app="a" />
      </div>
      <Empty v-else icon="📦" title="专题中还没有软件" desc="点击编辑添加收藏的软件" />
    </template>
  </div>
</template>

<style scoped>
.hero { padding: 34px 20px 26px; color: #fff; }
.hero-inner { text-align: center; }
.hero-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 18px; background: rgba(255,255,255,.2); font-size: 28px; }
.hero h1 { margin-top: 12px; font-size: var(--fs-22); font-weight: 800; }
.hero p { margin-top: 6px; font-size: var(--fs-13); opacity: .9; }
.hero-meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.hero-tag { font-size: var(--fs-11); background: rgba(255,255,255,.2); padding: 3px 10px; border-radius: var(--r-full); }
.opt { display: flex; gap: 10px; margin: 0 16px; }
.danger { color: var(--danger, #e5484d) !important; border-color: var(--danger, #e5484d) !important; }
</style>