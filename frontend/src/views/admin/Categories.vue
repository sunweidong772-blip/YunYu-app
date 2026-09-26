<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const list = ref([])
const loading = ref(false)
const editing = ref(null)

async function load() {
  loading.value = true
  try { list.value = await api.admin.categories() } catch (e) { toast(e.message) } finally { loading.value = false }
}
function openEdit(c) {
  editing.value = c ? { id: c.id, name: c.name, icon: c.icon || '📦', sort: c.sort } : { id: null, name: '', icon: '📦', sort: 0 }
}
async function save() {
  const e = editing.value
  if (!e.name.trim()) { toast('请输入分类名称'); return }
  try {
    if (e.id) await api.admin.categoryUpdate(e.id, { name: e.name.trim(), icon: e.icon, sort: Number(e.sort) || 0 })
    else await api.admin.categoryCreate({ name: e.name.trim(), icon: e.icon })
    toast('已保存')
    editing.value = null
    load()
  } catch (err) { toast(err.message) }
}
async function remove(c) {
  const ok = await confirmDialog('删除分类', `确定删除分类「${c.name}」吗？`)
  if (!ok) return
  try {
    await api.admin.categoryDelete(c.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}
onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">软件分类</h2>
      <button class="btn btn-primary btn-sm" @click="openEdit(null)">＋ 新建分类</button>
    </div>

    <div class="cat-grid">
      <div class="cat-card" v-for="c in list" :key="c.id">
        <span class="c-icon">{{ c.icon || '📦' }}</span>
        <div class="c-body">
          <b>{{ c.name }}</b>
          <span class="u-sub">{{ c.software_count }} 款软件</span>
        </div>
        <div class="op-group">
          <button class="btn btn-outline btn-xs" @click="openEdit(c)">编辑</button>
          <button class="btn btn-danger btn-xs" @click="remove(c)">删除</button>
        </div>
      </div>
    </div>
    <div class="empty" v-if="!loading && !list.length">暂无分类</div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>{{ editing.id ? '编辑分类' : '新建分类' }}</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">名称</label>
          <input v-model="editing.name" class="f-input" placeholder="分类名称" />
          <label class="m-label">图标</label>
          <input v-model="editing.icon" class="f-input" placeholder="📦" />
          <label class="m-label">排序（越小越靠前）</label>
          <input v-model.number="editing.sort" type="number" class="f-input" />
          <button class="btn btn-primary btn-block mt2" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.cat-card { display: flex; gap: 10px; align-items: center; padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.c-icon { width: 40px; height: 40px; line-height: 40px; text-align: center; border-radius: 11px; background: var(--brand-soft); font-size: 19px; }
.c-body { flex: 1; }
.c-body b { display: block; font-size: var(--fs-14); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 5px; }
.btn-xs { height: 27px; font-size: var(--fs-11); padding: 0 9px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 420px); background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.mt2 { margin-top: 14px; }
@media (max-width: 700px) { .cat-grid { grid-template-columns: 1fr; } }
</style>