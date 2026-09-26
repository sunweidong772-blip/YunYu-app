<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const router = useRouter()
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 15
const kw = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const r = await api.admin.posts(`?page=${page.value}&pageSize=${pageSize}&q=${encodeURIComponent(kw.value)}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}
function search() { page.value = 1; load() }

async function toggleState(p, field, label) {
  const next = p[field] ? 0 : 1
  const act = next ? `置顶` : '取消置顶'
  if (field === 'is_pinned') {
    const ok = await confirmDialog('置顶操作', `确定${act}帖子《${p.title}》吗？`)
    if (!ok) return
  }
  try {
    await api.admin.postState(p.id, field, next)
    toast('已更新')
    load()
  } catch (e) { toast(e.message) }
}

async function remove(p) {
  const ok = await confirmDialog('删除帖子', `确定删除《${p.title}》吗？此操作不可恢复。`)
  if (!ok) return
  try {
    await api.admin.postDelete(p.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">帖子管理</h2>
      <span class="p-cnt">共 {{ total }} 篇帖子</span>
    </div>

    <div class="toolbar">
      <input v-model="kw" class="t-input" placeholder="搜索标题 / 内容" @keyup.enter="search" />
      <button class="btn btn-primary btn-sm" @click="search">搜索</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>标题</th><th>作者</th><th>数据</th><th>状态</th><th>发布时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="p in list" :key="p.id">
            <td>
              <div class="post-title ellipsis">{{ p.is_pinned ? '📌 ' : '' }}{{ p.title }}</div>
              <div class="u-sub clamp1" v-if="p.content">{{ p.content.slice(0, 60) }}</div>
            </td>
            <td>
              <b>{{ p.nickname }}</b><br><span class="u-sub">UID {{ p.uid }}</span>
            </td>
            <td class="u-sub">👍 {{ p.like_count }} · 💬 {{ p.comment_count }}</td>
            <td>
              <span class="badge" :class="p.status === 'deleted' ? 'danger' : (p.is_hidden ? 'warning' : 'success')">{{ p.status === 'deleted' ? '已删除' : (p.is_hidden ? '已隐藏' : '正常') }}</span>
            </td>
            <td class="u-sub">{{ fmtDateTime(p.created_at) }}</td>
            <td>
              <div class="op-group">
                <button class="btn btn-ghost btn-xs" @click="router.push('/post/' + p.id)">查看</button>
                <button class="btn btn-outline btn-xs" @click="toggleState(p, 'is_pinned', '置顶')">{{ p.is_pinned ? '取消置顶' : '置顶' }}</button>
                <button class="btn btn-outline btn-xs" @click="toggleState(p, 'is_hidden', '隐藏')">{{ p.is_hidden ? '恢复' : '隐藏' }}</button>
                <button class="btn btn-danger btn-xs" @click="remove(p)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无帖子</div>
    </div>

    <div class="pager" v-if="total > pageSize">
      <button class="btn btn-outline btn-sm" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button class="btn btn-outline btn-sm" :disabled="page * pageSize >= total" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.t-input { flex: 1; min-width: 200px; max-width: 360px; height: 38px; padding: 0 14px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-13); }
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 900px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); white-space: nowrap; }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.post-title { font-weight: 600; max-width: 320px; }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 320px; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
</style>