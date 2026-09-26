<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const r = await api.admin.logs(`?page=${page.value}&pageSize=${pageSize}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">操作日志</h2>
      <span class="p-cnt">共 {{ total }} 条</span>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>操作人</th><th>动作</th><th>对象</th><th>详情</th><th>时间</th></tr></thead>
        <tbody>
          <tr v-for="l in list" :key="l.id">
            <td><b>{{ l.admin_name || '未知' }}</b><br><span class="u-sub">#{{ l.admin_user_id }}</span></td>
            <td>{{ l.action }}</td>
            <td><span class="badge">{{ l.target_type || '—' }}</span></td>
            <td><div class="u-sub clamp1" style="max-width:340px">{{ l.detail || ('对象 #' + l.target_id) }}</div></td>
            <td class="u-sub">{{ fmtDateTime(l.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无日志</div>
    </div>

    <div class="pager" v-if="total > pageSize">
      <button class="btn btn-outline btn-sm" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button class="btn btn-outline btn-sm" :disabled="page * pageSize >= total" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); }
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 860px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); white-space: nowrap; }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.clamp1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
</style>