<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const list = ref([])
const loading = ref(false)
const editing = ref(null)

async function load() {
  loading.value = true
  try { list.value = await api.admin.announcements() } catch (e) { toast(e.message) } finally { loading.value = false }
}

function openEdit(a) {
  editing.value = a
    ? { id: a.id, title: a.title, type: a.type, content: a.content || '', is_pinned: !!a.is_pinned, is_published: !!a.is_published }
    : { id: null, title: '', type: 'home', content: '', is_pinned: false, is_published: true }
}

async function save() {
  const e = editing.value
  if (!e.title.trim()) { toast('请输入公告标题'); return }
  const body = { title: e.title.trim(), type: e.type, content: e.content, is_pinned: e.is_pinned, is_published: e.is_published }
  try {
    if (e.id) await api.admin.announcementUpdate(e.id, body)
    else await api.admin.announcementCreate(body)
    toast('已保存')
    editing.value = null
    load()
  } catch (err) { toast(err.message) }
}

async function remove(a) {
  const ok = await confirmDialog('删除公告', `确定删除公告「${a.title}」吗？`)
  if (!ok) return
  try {
    await api.admin.announcementDelete(a.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">公告管理</h2>
      <button class="btn btn-primary btn-sm" @click="openEdit(null)">＋ 发布公告</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>标题</th><th>类型</th><th>状态</th><th>发布时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in list" :key="a.id">
            <td><b>{{ a.is_pinned ? '📌 ' : '' }}{{ a.title }}</b></td>
            <td><span class="badge" :class="a.type === 'home' ? '' : (a.type === 'activity' ? 'warning' : 'success')">{{ a.type }}</span></td>
            <td><span class="badge" :class="a.is_published ? 'success' : ''">{{ a.is_published ? '已发布' : '草稿' }}</span></td>
            <td class="u-sub">{{ fmtDateTime(a.publish_time) }}</td>
            <td>
              <div class="op-group">
                <button class="btn btn-outline btn-xs" @click="openEdit(a)">编辑</button>
                <button class="btn btn-danger btn-xs" @click="remove(a)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无公告</div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>{{ editing.id ? '编辑公告' : '发布公告' }}</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">标题</label>
          <input v-model="editing.title" class="f-input" maxlength="60" placeholder="公告标题" />
          <label class="m-label">类型</label>
          <select v-model="editing.type" class="f-input">
            <option value="home">首页公告</option>
            <option value="activity">活动</option>
            <option value="news">资讯</option>
            <option value="system">系统公告（推送所有用户）</option>
          </select>
          <label class="m-label">内容</label>
          <textarea v-model="editing.content" class="f-input" rows="6" placeholder="公告正文"></textarea>
          <div class="check-row">
            <label class="switch"><input type="checkbox" v-model="editing.is_pinned" /> 置顶</label>
            <label class="switch"><input type="checkbox" v-model="editing.is_published" /> 立即发布</label>
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
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 700px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 6px; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 560px); max-height: 86vh; overflow-y: auto; background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.check-row { display: flex; gap: 18px; margin-top: 12px; }
.switch { display: flex; gap: 6px; align-items: center; font-size: var(--fs-13); }
.mt2 { margin-top: 14px; }
</style>