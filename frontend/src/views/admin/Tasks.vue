<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const list = ref([])
const loading = ref(false)
const editing = ref(null)

async function load() {
  loading.value = true
  try { list.value = await api.admin.tasks() } catch (e) { toast(e.message) } finally { loading.value = false }
}

function openEdit(t) {
  editing.value = t
    ? { id: t.id, code: t.code, name: t.name, description: t.description || '', exp: t.exp, target_count: t.target_count, sort: t.sort, status: t.status }
    : { id: null, code: '', name: '', description: '', exp: 10, target_count: 1, sort: 0, status: 'active' }
}

async function save() {
  const e = editing.value
  if (!e.name.trim()) { toast('请输入任务名称'); return }
  try {
    const body = { name: e.name.trim(), description: e.description, exp: Number(e.exp) || 5, target_count: Number(e.target_count) || 1, sort: Number(e.sort) || 0 }
    if (e.id) await api.admin.taskUpdate(e.id, body)
    else await api.admin.taskCreate({ ...body, code: e.code.trim() || undefined })
    toast('已保存')
    editing.value = null
    load()
  } catch (err) { toast(err.message) }
}

async function remove(t) {
  const ok = await confirmDialog('删除任务', `确定删除任务「${t.name}」吗？`)
  if (!ok) return
  try {
    await api.admin.taskDelete(t.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">任务管理</h2>
      <button class="btn btn-primary btn-sm" @click="openEdit(null)">＋ 新建任务</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>编码</th><th>任务</th><th>说明</th><th>奖励</th><th>目标</th><th>排序</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="t in list" :key="t.id">
            <td class="u-sub mono">{{ t.code }}</td>
            <td><b>{{ t.name }}</b></td>
            <td><div class="u-sub clamp1" style="max-width:240px">{{ t.description || '—' }}</div></td>
            <td><span class="badge warning">+{{ t.exp }} EXP</span></td>
            <td class="u-sub">完成 {{ t.target_count }} 次</td>
            <td>{{ t.sort }}</td>
            <td><span class="badge" :class="t.status === 'active' ? 'success' : ''">{{ t.status === 'active' ? '启用' : '停用' }}</span></td>
            <td>
              <div class="op-group">
                <button class="btn btn-outline btn-xs" @click="openEdit(t)">编辑</button>
                <button class="btn btn-danger btn-xs" @click="remove(t)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无任务</div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>{{ editing.id ? '编辑任务' : '新建任务' }}</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">任务编码（新建时必填，如 checkin/post/comment/like）</label>
          <input v-model="editing.code" class="f-input" placeholder="checkin" :disabled="!!editing.id" />
          <label class="m-label">名称</label>
          <input v-model="editing.name" class="f-input" placeholder="任务名称" />
          <label class="m-label">说明</label>
          <input v-model="editing.description" class="f-input" placeholder="任务说明" />
          <div class="grid2">
            <div><label class="m-label">奖励 EXP</label><input v-model.number="editing.exp" type="number" class="f-input" /></div>
            <div><label class="m-label">目标次数</label><input v-model.number="editing.target_count" type="number" class="f-input" /></div>
          </div>
          <div class="grid2">
            <div><label class="m-label">排序</label><input v-model.number="editing.sort" type="number" class="f-input" /></div>
            <div>
              <label class="m-label">状态</label>
              <select v-model="editing.status" class="f-input">
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
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
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 860px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.mono { font-family: monospace; }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.op-group { display: flex; gap: 6px; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 500px); background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mt2 { margin-top: 14px; }
</style>