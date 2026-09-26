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
const status = ref('all')
const loading = ref(false)
const detail = ref(null)

const statusMap = { normal: '正常', muted: '禁言', suspended: '暂停', banned: '封禁', deleted: '已删除' }
const statusColor = { normal: 'success', muted: 'warning', banned: 'danger', suspended: 'warning' }

async function load() {
  loading.value = true
  try {
    const r = await api.admin.users(`?page=${page.value}&pageSize=${pageSize}&q=${encodeURIComponent(kw.value)}&status=${status.value}`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function search() { page.value = 1; load() }

async function changeStatus(u, s) {
  const label = { muted: '禁言', suspended: '暂停使用', banned: '封禁', normal: '恢复正常' }
  const ok = await confirmDialog('状态变更', `确定将「${u.nickname}」设为「${label[s]}」吗？`)
  if (!ok) return
  try {
    await api.admin.userStatus(u.id, s)
    toast('状态已更新')
    load()
  } catch (e) { toast(e.message) }
}

async function adjustExp(u) {
  const input = prompt('输入 EXP 调整值（正数为增加，负数为减少）', '10')
  if (input === null) return
  const delta = Number(input.trim())
  if (!delta || isNaN(delta)) return toast('请输入有效数字')
  try {
    await api.admin.userExp(u.id, { exp: delta })
    toast('EXP 已调整')
    load()
  } catch (e) { toast(e.message) }
}

async function openDetail(u) {
  try {
    detail.value = await api.admin.userDetail(u.id)
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">用户管理</h2>
      <span class="p-cnt">共 {{ total }} 位用户</span>
    </div>

    <div class="toolbar">
      <input v-model="kw" class="t-input" placeholder="搜索昵称 / 邮箱 / UID" @keyup.enter="search" />
      <select v-model="status" class="t-select" @change="search">
        <option value="all">全部状态</option>
        <option value="normal">正常</option>
        <option value="muted">禁言</option>
        <option value="suspended">暂停</option>
        <option value="banned">封禁</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="search">搜索</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>用户</th><th>UID</th><th>等级/EXP</th><th>状态</th><th>数据</th><th>注册时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="u in list" :key="u.id">
            <td>
              <span class="u-cell"><i class="u-ava">{{ (u.nickname || '?').charAt(0) }}</i><b>{{ u.nickname }}</b></span>
              <span class="u-sub">{{ u.email }}</span>
            </td>
            <td>{{ u.uid }}</td>
            <td>Lv.{{ u.lv }}<br><span class="u-sub">EXP {{ u.exp }}</span></td>
            <td><span class="badge" :class="statusColor[u.status] || 'success'">{{ statusMap[u.status] }}</span></td>
            <td><span class="u-sub">帖 {{ u.post_count }} · 评 {{ u.comment_count }} · 藏 {{ u.favorite_count }}</span></td>
            <td class="u-sub">{{ fmtDateTime(u.created_at) }}</td>
            <td>
              <div class="op-group">
                <button class="btn btn-outline btn-xs" @click="openDetail(u)">详情</button>
                <button class="btn btn-ghost btn-xs" @click="adjustExp(u)">调EXP</button>
                <template v-if="u.status === 'normal'">
                  <button class="btn btn-outline btn-xs" @click="changeStatus(u, 'muted')">禁言</button>
                  <button class="btn btn-danger btn-xs" @click="changeStatus(u, 'banned')">封禁</button>
                </template>
                <button v-else class="btn btn-ghost btn-xs" @click="changeStatus(u, 'normal')">恢复</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无用户</div>
    </div>

    <div class="pager" v-if="total > pageSize">
      <button class="btn btn-outline btn-sm" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button class="btn btn-outline btn-sm" :disabled="page * pageSize >= total" @click="page++; load()">下一页</button>
    </div>

    <!-- 详情 -->
    <div v-if="detail" class="modal-mask" @click.self="detail = null">
      <div class="modal">
        <div class="m-head"><b>用户详情</b><button @click="detail = null">✕</button></div>
        <div class="m-body">
          <div class="m-row"><span>昵称</span><b>{{ detail.nickname }}</b></div>
          <div class="m-row"><span>UID</span><b>{{ detail.uid }}</b></div>
          <div class="m-row"><span>邮箱</span><b>{{ detail.email }}</b></div>
          <div class="m-row"><span>身份</span><b>{{ detail.role_type === 'admin' ? '管理员' : '普通用户' }}</b></div>
          <div class="m-row"><span>等级</span><b>Lv.{{ detail.lv }}（EXP {{ detail.exp }}）</b></div>
          <div class="m-row"><span>签到</span><b>连续 {{ detail.checkin_streak }} 天 / 累计 {{ detail.checkin_total }} 天</b></div>
          <div class="m-row"><span>签名</span><b>{{ detail.bio || '暂无' }}</b></div>
          <div class="m-title">最近动态（EXP 记录）</div>
          <div class="mini-line" v-for="l in (detail.expLogs || []).slice(0, 5)" :key="l.id">
            <span>{{ l.reason || 'EXP 变动' }}</span>
            <b :class="l.delta >= 0 ? 'plus' : 'minus'">{{ l.delta >= 0 ? '+' : '' }}{{ l.delta }}</b>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); }
.toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.t-input { flex: 1; min-width: 200px; height: 38px; padding: 0 14px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-13); }
.t-select { height: 38px; padding: 0 10px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-13); }
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 860px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); white-space: nowrap; }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); vertical-align: middle; }
.u-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; white-space: nowrap; }
.u-ava { width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; background: var(--brand-soft); color: var(--brand); font-style: normal; flex-shrink: 0; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-3); }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 520px); max-height: 82vh; overflow-y: auto; background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-body { margin-top: 12px; }
.m-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed var(--divider); font-size: var(--fs-13); }
.m-row span { color: var(--text-3); }
.m-title { font-size: var(--fs-13); font-weight: 700; margin: 14px 0 6px; }
.mini-line { display: flex; justify-content: space-between; font-size: var(--fs-12); padding: 5px 0; border-bottom: 1px solid var(--divider); }
.mini-line .plus { color: var(--success); }
.mini-line .minus { color: var(--danger); }
</style>