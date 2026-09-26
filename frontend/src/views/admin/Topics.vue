<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const list = ref([])
const loading = ref(false)
const editing = ref(null) // { id?, name, description, icon, is_hot }

async function load() {
  loading.value = true
  try { list.value = await api.admin.topics() } catch (e) { toast(e.message) } finally { loading.value = false }
}

function openEdit(t) {
  editing.value = t ? { id: t.id, name: t.name, description: t.description || '', icon: t.icon || '💬', is_hot: !!t.is_hot } : { id: null, name: '', description: '', icon: '💬', is_hot: false }
}

async function save() {
  const e = editing.value
  if (!e.name.trim()) { toast('请输入话题名称'); return }
  try {
    if (e.id) await api.admin.topicUpdate(e.id, { name: e.name.trim(), description: e.description, icon: e.icon, is_hot: e.is_hot })
    else await api.admin.topicCreate({ name: e.name.trim(), description: e.description, icon: e.icon, is_hot: e.is_hot })
    toast('已保存')
    editing.value = null
    load()
  } catch (err) { toast(err.message) }
}

async function remove(t) {
  const ok = await confirmDialog('删除话题', `确定删除话题「${t.name}」吗？帖子将不再关联该话题。`)
  if (!ok) return
  try {
    await api.admin.topicDelete(t.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">话题管理</h2>
      <button class="btn btn-primary btn-sm" @click="openEdit(null)">＋ 新建话题</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>图标</th><th>名称</th><th>描述</th><th>热度</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="t in list" :key="t.id">
            <td class="t-icon">{{ t.icon || '💬' }}</td>
            <td><b>{{ t.name }}</b> <span class="u-sub" v-if="t.status !== 'normal'">（{{ t.status }}）</span></td>
            <td><div class="u-sub clamp1" style="max-width:280px">{{ t.description || '暂无描述' }}</div></td>
            <td><span class="badge" :class="t.is_hot ? 'warning' : ''">{{ t.is_hot ? '🔥 热门' : '普通' }}</span></td>
            <td>
              <div class="op-group">
                <button class="btn btn-outline btn-xs" @click="openEdit(t)">编辑</button>
                <button class="btn btn-danger btn-xs" @click="remove(t)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无话题</div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>{{ editing.id ? '编辑话题' : '新建话题' }}</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">名称</label>
          <input v-model="editing.name" class="f-input" maxlength="20" placeholder="话题名称" />
          <label class="m-label">图标（emoji）</label>
          <input v-model="editing.icon" class="f-input" maxlength="4" placeholder="💬" />
          <label class="m-label">描述</label>
          <textarea v-model="editing.description" class="f-input" rows="3" placeholder="话题描述"></textarea>
          <label class="m-label switch"><input type="checkbox" v-model="editing.is_hot" /> 设为热门话题</label>
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
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 700px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.t-icon { font-size: 20px; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.op-group { display: flex; gap: 6px; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 460px); max-height: 84vh; overflow-y: auto; background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.m-label.switch { display: flex; align-items: center; gap: 8px; color: var(--text-1); }
.mt2 { margin-top: 14px; }
</style>