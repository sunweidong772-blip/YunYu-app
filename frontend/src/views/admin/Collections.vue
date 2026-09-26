<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const list = ref([])
const software = ref([])
const loading = ref(false)
const editing = ref(null)

async function load() {
  loading.value = true
  try {
    list.value = await api.admin.collections()
    software.value = await api.admin.software('?page=1&pageSize=100').then((r) => r.list || [])
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function openEdit(c) {
  editing.value = c
    ? { id: c.id, name: c.name, cover: c.cover || '', summary: c.summary || '', software_ids: c.software_ids || [] }
    : { id: null, name: '', cover: '', summary: '', software_ids: [] }
}

function toggleSoftware(id) {
  const arr = editing.value.software_ids
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
}

async function save() {
  const e = editing.value
  if (!e.name.trim()) { toast('请输入合集名称'); return }
  try {
    if (e.id) await api.admin.collectionUpdate(e.id, { name: e.name.trim(), cover: e.cover, summary: e.summary, software_ids: e.software_ids })
    else await api.admin.collectionCreate({ name: e.name.trim(), cover: e.cover, summary: e.summary, software_ids: e.software_ids })
    toast('已保存')
    editing.value = null
    load()
  } catch (err) { toast(err.message) }
}

async function remove(c) {
  const ok = await confirmDialog('删除合集', `确定删除合集「${c.name}」吗？`)
  if (!ok) return
  try {
    await api.admin.collectionDelete(c.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">软件合集</h2>
      <button class="btn btn-primary btn-sm" @click="openEdit(null)">＋ 新建合集</button>
    </div>

    <div class="coll-list">
      <div class="coll-row" v-for="c in list" :key="c.id">
        <span class="col-icon">💎</span>
        <div class="col-body">
          <b>{{ c.name }}</b>
          <span class="u-sub ellipsis" style="max-width:420px">{{ c.summary || '暂无简介' }}</span>
        </div>
        <span class="badge">{{ c.software_count }} 款</span>
        <div class="op-group">
          <button class="btn btn-outline btn-xs" @click="openEdit(c)">编辑</button>
          <button class="btn btn-danger btn-xs" @click="remove(c)">删除</button>
        </div>
      </div>
    </div>
    <div class="empty" v-if="!loading && !list.length">暂无合集</div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal wide">
        <div class="m-head"><b>{{ editing.id ? '编辑合集' : '新建合集' }}</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">名称</label>
          <input v-model="editing.name" class="f-input" placeholder="合集名称" />
          <label class="m-label">封面</label>
          <input v-model="editing.cover" class="f-input" placeholder="封面图标或颜色" />
          <label class="m-label">简介</label>
          <textarea v-model="editing.summary" class="f-input" rows="2" placeholder="合集简介"></textarea>
          <label class="m-label">选择软件（已选 {{ editing.software_ids.length }} 款）</label>
          <div class="pick-list">
            <label class="pick" v-for="s in software" :key="s.id">
              <input type="checkbox" :checked="editing.software_ids.includes(s.id)" @change="toggleSoftware(s.id)" />
              <span>{{ s.icon || '📦' }}</span>
              <b class="ellipsis">{{ s.name }}</b>
            </label>
          </div>
          <button class="btn btn-primary btn-block mt2" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.coll-list { display: flex; flex-direction: column; gap: 8px; }
.coll-row { display: flex; align-items: center; gap: 12px; padding: 13px 15px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.col-icon { width: 38px; height: 38px; line-height: 38px; text-align: center; border-radius: 11px; background: var(--brand-soft); font-size: 18px; }
.col-body { flex: 1; min-width: 0; }
.col-body b { display: block; font-size: var(--fs-14); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 5px; }
.btn-xs { height: 27px; font-size: var(--fs-11); padding: 0 9px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(94vw, 640px); max-height: 86vh; overflow-y: auto; background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.pick-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-height: 240px; overflow-y: auto; }
.pick { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--divider); border-radius: 9px; font-size: var(--fs-13); cursor: pointer; }
.pick b { flex: 1; }
.mt2 { margin-top: 14px; }
</style>