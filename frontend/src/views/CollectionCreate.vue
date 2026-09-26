<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.name === 'collection-edit')

const name = ref('')
const summary = ref('')
const isPublic = ref(true)
const apps = ref([])
const saving = ref(false)
const loading = ref(true)

function pushApp(a) {
  if (!apps.value.some((x) => x.id === a.id)) apps.value.push(a)
}

async function resolveIds(ids) {
  const uniq = [...new Set(ids.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 30)
  const rs = await Promise.allSettled(uniq.map((id) => api.softwareDetail(id)))
  rs.forEach((r) => { if (r.status === 'fulfilled' && r.value && r.value.id) pushApp(r.value) })
  return uniq.filter((id) => apps.value.some((a) => a.id === id))
}

onMounted(async () => {
  try {
    if (isEdit.value) {
      const c = await api.collectionDetail(route.params.id)
      name.value = c.name
      summary.value = c.summary || ''
      isPublic.value = !!c.is_public
      apps.value = (c.software_list || []).slice()
    } else {
      const selected = String(route.query.selected || '').split(',').map(Number).filter((n) => n > 0)
      if (selected.length) {
        const ids = await resolveIds(selected)
        if (!ids.length) toast('所选软件不存在或已下架')
      }
    }
  } catch (e) { toast(e.message) } finally { loading.value = false }
})

async function save() {
  if (!name.value.trim()) return toast('请输入专题名称')
  if (!apps.value.length) return toast('请至少选择一款软件')
  saving.value = true
  try {
    const body = {
      name: name.value.trim(),
      summary: summary.value.trim(),
      softwareIds: apps.value.map((a) => a.id),
      isPublic: isPublic.value,
    }
    if (isEdit.value) {
      await api.collectionUpdate(route.params.id, body)
      toast('专题已更新')
      router.replace('/collection/' + route.params.id)
    } else {
      const r = await api.collectionCreate(body)
      toast('专题创建成功')
      router.replace('/collection/' + r.id)
    }
  } catch (e) { toast(e.message) } finally { saving.value = false }
}
</script>

<template>
  <div class="page page-nofooter">
    <NavBar :title="isEdit ? '编辑专题' : '生成专题'" back />

    <div v-if="loading" class="container mt3"><div class="skeleton" style="height:70px;border-radius:12px"></div></div>

    <div v-else class="container mt3">
      <div class="field">
        <input v-model="name" placeholder="专题名称（2-30 字）" maxlength="30" />
      </div>
      <div class="field field-area mt3">
        <textarea v-model="summary" placeholder="一句话介绍这个专题（选填）" maxlength="200"></textarea>
      </div>

      <div class="vis-row mt3">
        <div>
          <div class="vis-title">公开专题</div>
          <div class="vis-desc">公开后其他用户也能看到</div>
        </div>
        <button class="switch" :class="{ on: isPublic }" @click="isPublic = !isPublic"><i></i></button>
      </div>

      <div class="sec-title mt4">专题软件（{{ apps.length }}/30）</div>
      <div class="app-list mt2">
        <div class="app-item" v-for="a in apps" :key="a.id">
          <span class="ai-icon" :style="{ background: a.icon_color || 'var(--brand-soft)' }">{{ a.icon || '📦' }}</span>
          <span class="ai-name ellipsis">{{ a.name }}</span>
          <button class="ai-del" @click="apps = apps.filter((x) => x.id !== a.id)">✕</button>
        </div>
        <div class="app-empty" v-if="!apps.length">
          还没有软件 —— 从「我的收藏」勾选要收录的软件
          <router-link class="go-fav" to="/my/favorites?pick=1">去选择</router-link>
        </div>
      </div>

      <button class="btn btn-primary btn-block mt5" :disabled="saving" @click="save">
        {{ saving ? '保存中…' : (isEdit ? '保存修改' : '生成专题') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.field-area textarea { min-height: 90px; }
.vis-row { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-radius: var(--r-md); background: var(--card); }
.vis-title { font-size: var(--fs-14); font-weight: 600; }
.vis-desc { font-size: var(--fs-11); color: var(--text-3); margin-top: 2px; }
.switch { width: 46px; height: 26px; border-radius: var(--r-full); background: var(--divider-2, var(--divider)); border: none; position: relative; transition: background .2s; }
.switch i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.switch.on { background: var(--brand); }
.switch.on i { left: 23px; }
.sec-title { font-size: var(--fs-14); font-weight: 700; }
.app-list { display: flex; flex-direction: column; gap: 10px; }
.app-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--r-md); background: var(--card); }
.ai-icon { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; font-size: 17px; }
.ai-name { flex: 1; min-width: 0; font-size: var(--fs-14); font-weight: 600; }
.ai-del { width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,.08); color: var(--text-3); font-size: 11px; }
.app-empty { text-align: center; padding: 22px 12px; font-size: var(--fs-13); color: var(--text-3); border: 1px dashed var(--divider); border-radius: var(--r-md); }
.go-fav { color: var(--brand); margin-left: 6px; }
</style>