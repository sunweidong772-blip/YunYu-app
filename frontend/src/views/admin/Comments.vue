<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 15
const kw = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const r = await api.admin.comments(`?page=${page.value}&pageSize=${pageSize}&q=${encodeURIComponent(kw.value)}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}
function search() { page.value = 1; load() }

async function remove(c) {
  const ok = await confirmDialog('删除评论', `确定删除这条评论吗？`)
  if (!ok) return
  try {
    await api.admin.commentDelete(c.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">评论管理</h2>
      <span class="p-cnt">共 {{ total }} 条评论</span>
    </div>

    <div class="toolbar">
      <input v-model="kw" class="t-input" placeholder="搜索评论内容" @keyup.enter="search" />
      <button class="btn btn-primary btn-sm" @click="search">搜索</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>评论内容</th><th>所属帖子</th><th>评论人</th><th>点赞</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="c in list" :key="c.id">
            <td><div class="c-content clamp1">{{ c.content }}</div></td>
            <td><div class="u-sub clamp1" style="max-width:220px">{{ c.post_title }}</div></td>
            <td><b>{{ c.nickname }}</b><br><span class="u-sub">UID {{ c.uid }}</span></td>
            <td>{{ c.like_count }}</td>
            <td class="u-sub">{{ fmtDateTime(c.created_at) }}</td>
            <td><button class="btn btn-danger btn-xs" @click="remove(c)">删除</button></td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无评论</div>
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
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 820px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); white-space: nowrap; }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.c-content { max-width: 320px; }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
</style>