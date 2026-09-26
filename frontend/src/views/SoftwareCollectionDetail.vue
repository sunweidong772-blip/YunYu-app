<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import SoftwareCard from '@/components/SoftwareCard.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const coll = ref(null)
const list = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.softwareCollectionDetail(route.params.id)
    coll.value = data
    list.value = data.software_list || []
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="合集详情" />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:120px;border-radius:16px"></div></div>

    <template v-else-if="coll">
      <div class="hero" :style="{ background: coll.cover_color ? 'linear-gradient(135deg,' + coll.cover_color + ', ' + coll.cover_color + '99)' : 'var(--brand-grad)' }">
        <div class="hero-inner">
          <span class="hero-icon">💎</span>
          <h1>{{ coll.name }}</h1>
          <p>{{ coll.description }}</p>
          <span class="hero-count">{{ list.length }} 款精选软件</span>
        </div>
      </div>

      <div class="sw-list mt4" v-if="list.length">
        <SoftwareCard v-for="a in list" :key="a.id" :app="a" />
      </div>
      <Empty v-else icon="📦" title="合集中还没有软件" desc="管理员正在补充中" />
    </template>
  </div>
</template>

<style scoped>
.hero { padding: 34px 20px 26px; color: #fff; }
.hero-inner { text-align: center; }
.hero-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 18px; background: rgba(255,255,255,.2); font-size: 28px; }
.hero h1 { margin-top: 12px; font-size: var(--fs-22); font-weight: 800; }
.hero p { margin-top: 6px; font-size: var(--fs-13); opacity: .9; }
.hero-count { display: inline-block; margin-top: 14px; font-size: var(--fs-11); background: rgba(255,255,255,.2); padding: 3px 10px; border-radius: var(--r-full); }
</style>