<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import Avatar from '@/components/Avatar.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const router = useRouter()
const type = ref(route.query.type || 'follow')
const list = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const uid = route.params.uid
    list.value = type.value === 'follow'
      ? await api.following(uid)
      : await api.followers(uid)
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

watch(() => route.query.type, () => { type.value = route.query.type || 'follow'; load() })
onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar :title="type === 'follow' ? '关注列表' : '粉丝列表'" />

    <div class="seg">
      <div class="seg-item" :class="{ on: type === 'follow' }" @click="router.replace({ query: { type: 'follow' } })">关注</div>
      <div class="seg-item" :class="{ on: type === 'fans' }" @click="router.replace({ query: { type: 'fans' } })">粉丝</div>
    </div>

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:60px;margin-bottom:10px;border-radius:12px"></div></div>

    <div class="u-item" v-for="u in list" :key="u.uid" @click="router.push('/user/' + u.uid)">
      <Avatar :user="u" size="44" />
      <div class="ui-body">
        <div class="ui-name">{{ u.nickname }} <span class="lv-mini">Lv.{{ u.lv }}</span></div>
        <div class="ui-bio ellipsis">{{ u.bio || '暂无签名' }}</div>
      </div>
    </div>
    <Empty v-if="!loading && !list.length" icon="👥" title="暂时是空的" :desc="type === 'follow' ? '还没有关注任何人' : '还没有粉丝'" />
  </div>
</template>

<style scoped>
.seg { display: flex; margin: 14px 16px 0; background: var(--card-2); border-radius: var(--r-md); padding: 3px; }
.seg-item { flex: 1; text-align: center; padding: 7px 0; font-size: var(--fs-13); color: var(--text-3); border-radius: 8px; }
.seg-item.on { background: var(--card); color: var(--brand); font-weight: 700; box-shadow: var(--shadow-sm); }
.u-item { display: flex; align-items: center; gap: 12px; margin: 10px 16px 0; padding: 13px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.ui-name { font-size: var(--fs-14); font-weight: 700; display: flex; align-items: center; gap: 6px; }
.lv-mini { font-size: var(--fs-10); color: var(--brand); background: var(--brand-soft); padding: 1px 6px; border-radius: var(--r-full); }
.ui-bio { font-size: var(--fs-12); color: var(--text-3); margin-top: 3px; }
</style>