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
    const r = await api.admin.software(`?page=${page.value}&pageSize=${pageSize}&q=${encodeURIComponent(kw.value)}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}
function search() { page.value = 1; load() }

async function remove(s) {
  const ok = await confirmDialog('删除软件', `确定删除软件「${s.name}」吗？`)
  if (!ok) return
  try {
    await api.admin.softwareDelete(s.id)
    toast('已删除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">软件管理</h2>
      <span class="p-cnt">共 {{ total }} 款</span>
      <button class="btn btn-primary btn-sm" @click="router.push('/admin/software/new')">＋ 添加软件</button>
    </div>

    <div class="toolbar">
      <input v-model="kw" class="t-input" placeholder="搜索名称 / 开发者" @keyup.enter="search" />
      <button class="btn btn-primary btn-sm" @click="search">搜索</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>软件</th><th>分类</th><th>版本</th><th>数据</th><th>标记</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="s in list" :key="s.id">
            <td>
              <div class="s-cell"><i class="s-icon">{{ s.icon || '📦' }}</i><div><b>{{ s.name }}</b><div class="u-sub ellipsis" style="max-width:200px">{{ s.summary || '暂无简介' }}</div></div></div>
            </td>
            <td>{{ s.category_name || '未分类' }}</td>
            <td class="u-sub">v{{ s.version }}<br>{{ s.size }}</td>
            <td class="u-sub">⬇️ {{ s.download_count }}<br>⭐ {{ s.favorite_count }}</td>
            <td>
              <div class="tags">
                <span v-if="s.is_recommend" class="badge">推荐</span>
                <span v-if="s.is_hot" class="badge warning">热门</span>
                <span v-if="s.is_featured" class="badge success">精选</span>
                <span v-if="s.is_banner" class="badge">Banner</span>
              </div>
            </td>
            <td class="u-sub">{{ fmtDateTime(s.update_time) }}</td>
            <td>
              <div class="op-group">
                <button class="btn btn-ghost btn-xs" @click="router.push('/admin/software/' + s.id)">编辑</button>
                <button class="btn btn-danger btn-xs" @click="remove(s)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无软件</div>
    </div>

    <div class="pager" v-if="total > pageSize">
      <button class="btn btn-outline btn-sm" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button class="btn btn-outline btn-sm" :disabled="page * pageSize >= total" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); flex: 1; }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
.t-input { flex: 1; min-width: 200px; max-width: 360px; height: 38px; padding: 0 14px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-13); }
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 960px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); white-space: nowrap; }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.s-cell { display: flex; gap: 10px; align-items: center; }
.s-icon { width: 38px; height: 38px; line-height: 38px; text-align: center; border-radius: 10px; background: var(--brand-soft); font-style: normal; flex-shrink: 0; font-size: 18px; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.op-group { display: flex; gap: 6px; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
</style>