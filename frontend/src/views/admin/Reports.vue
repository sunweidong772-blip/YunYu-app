<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { fmtDateTime } from '@/utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 15
const status = ref('all')
const loading = ref(false)

const statusMap = { pending: '待处理', approved: '已受理', rejected: '已驳回', handled: '已处理' }

async function load() {
  loading.value = true
  try {
    const r = await api.admin.reports(`?page=${page.value}&pageSize=${pageSize}&status=${status.value}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

async function handle(r, action) {
  if (action === 'reject') {
    const ok = await confirmDialog('驳回举报', '确定驳回该举报吗？')
    if (!ok) return
    try {
      await api.admin.reportHandle(r.id, { status: 'rejected', result: '经核实不成立' })
      toast('已驳回')
      load()
    } catch (e) { toast(e.message) }
    return
  }
  const res = prompt('处理备注（可选）', '违规内容已处理')
  if (res === null) return
  try {
    await api.admin.reportHandle(r.id, { status: 'approved', result: res || '违规内容已处理', action: action || undefined, targetUserId: r.target_type === 'user' ? r.target_id : undefined })
    toast('已处理')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">举报管理</h2>
      <span class="p-cnt">共 {{ total }} 条</span>
      <select v-model="status" class="t-select" @change="page = 1; load()">
        <option value="all">全部</option>
        <option value="pending">待处理</option>
        <option value="approved">已受理</option>
        <option value="rejected">已驳回</option>
        <option value="handled">已处理</option>
      </select>
    </div>

    <div class="rep-list">
      <div class="rep-card" v-for="r in list" :key="r.id" :class="{ pending: r.status === 'pending' }">
        <div class="rc-head">
          <span class="badge" :class="r.status === 'pending' ? 'warning' : (r.status === 'approved' ? 'success' : '')">{{ statusMap[r.status] }}</span>
          <span class="u-sub">#{{ r.id }} · {{ fmtDateTime(r.created_at) }}</span>
        </div>
        <div class="rc-reason">「{{ r.reason || '未填写举报原因' }}」</div>
        <div class="rc-target">对象类型：<b>{{ r.target_type }}</b> · 对象：{{ r.target_title || '#' + r.target_id }}（举报人：{{ r.reporter_name }}）</div>
        <div class="rc-foot" v-if="r.status === 'pending'">
          <button class="btn btn-danger btn-xs" @click="handle(r, 'delete_content')">删除内容</button>
          <button class="btn btn-outline btn-xs" @click="handle(r, r.target_type === 'user' ? 'mute_user' : 'mute_user')">禁言用户</button>
          <button class="btn btn-outline btn-xs" @click="handle(r, null)">仅受理</button>
          <button class="btn btn-ghost btn-xs" @click="handle(r, 'reject')">驳回</button>
        </div>
        <div class="rc-result" v-else>处理结果：{{ r.result || '—' }}<span class="u-sub" v-if="r.handler_name">（{{ r.handler_name }}）</span></div>
      </div>
    </div>
    <div class="empty" v-if="!loading && !list.length">暂无举报</div>

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
.t-select { height: 36px; padding: 0 10px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-13); }
.rep-list { display: flex; flex-direction: column; gap: 8px; }
.rep-card { padding: 14px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.rep-card.pending { outline: 1px solid var(--warning); }
.rc-head { display: flex; justify-content: space-between; align-items: center; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.rc-reason { margin-top: 8px; font-size: var(--fs-14); font-weight: 600; }
.rc-target { margin-top: 5px; font-size: var(--fs-12); color: var(--text-3); }
.rc-foot { display: flex; gap: 7px; margin-top: 10px; flex-wrap: wrap; }
.rc-result { margin-top: 8px; font-size: var(--fs-12); }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
</style>