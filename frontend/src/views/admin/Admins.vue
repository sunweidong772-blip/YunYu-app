<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const userStore = useUserStore()
const list = ref([])
const roles = ref([])
const loading = ref(false)
const editing = ref(null)
const adding = ref(null)

async function load() {
  loading.value = true
  try {
    list.value = await api.admin.admins()
    roles.value = await api.admin.roles().then((r) => r.roles || [])
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function openEdit(a) {
  editing.value = { id: a.admin_id, email: a.email, title: a.title, role_id: roles.value.find((r) => r.code === a.role_code) ? roles.value.find((r) => r.code === a.role_code).id : null }
}

async function saveEdit() {
  try {
    await api.admin.adminUpdate(editing.value.id, { title: editing.value.title, role_id: editing.value.role_id })
    toast('已更新')
    editing.value = null
    load()
  } catch (e) { toast(e.message) }
}

function openAdd() {
  adding.value = { email: '', role_id: (roles.value.find((r) => r.code !== 'owner') || {}).id || null, title: '' }
}
async function saveAdd() {
  if (!adding.value.email.trim()) { toast('请输入邮箱'); return }
  try {
    await api.admin.adminCreate({ email: adding.value.email.trim(), role_id: adding.value.role_id, title: adding.value.title })
    toast('管理员已添加')
    adding.value = null
    load()
  } catch (e) { toast(e.message) }
}

async function remove(a) {
  const ok = await confirmDialog('移除管理员', `确定移除管理员「${a.nickname}」吗？`)
  if (!ok) return
  try {
    await api.admin.adminDelete(a.admin_id)
    toast('已移除')
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">管理员</h2>
      <span class="p-cnt" v-if="!userStore.isOwner">仅云屿岛主可添加/移除管理员</span>
      <button v-if="userStore.isOwner" class="btn btn-primary btn-sm" @click="openAdd">＋ 添加管理员</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>管理员</th><th>邮箱</th><th>角色</th><th>职位</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in list" :key="a.admin_id">
            <td>
              <div class="a-cell">
                <i class="a-ava">{{ (a.nickname || '?').charAt(0) }}</i>
                <div><b>{{ a.nickname }}</b><span class="u-sub">UID {{ a.uid }}</span></div>
              </div>
            </td>
            <td class="u-sub">{{ a.email }}</td>
            <td>
              <span class="badge" :class="a.role_code === 'owner' ? 'warning' : ''">{{ a.role_name }}</span>
            </td>
            <td>{{ a.title }}</td>
            <td><span class="badge" :class="a.status === 'normal' ? 'success' : 'danger'">{{ a.status === 'normal' ? '正常' : a.status }}</span></td>
            <td>
              <div class="op-group">
                <button class="btn btn-outline btn-xs" @click="openEdit(a)">编辑</button>
                <button v-if="a.role_code !== 'owner' && userStore.isOwner" class="btn btn-danger btn-xs" @click="remove(a)">移除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty" v-if="!loading && !list.length">暂无管理员</div>
    </div>

    <!-- 编辑 -->
    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head"><b>编辑管理员</b><button @click="editing = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">职位名称</label>
          <input v-model="editing.title" class="f-input" placeholder="如：内容运营" />
          <label class="m-label">角色</label>
          <select v-model="editing.role_id" class="f-input">
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
          <button class="btn btn-primary btn-block mt2" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加 -->
    <div v-if="adding" class="modal-mask" @click.self="adding = null">
      <div class="modal">
        <div class="m-head"><b>添加管理员</b><button @click="adding = null">✕</button></div>
        <div class="m-body">
          <label class="m-label">用户邮箱（需已注册）</label>
          <input v-model="adding.email" class="f-input" placeholder="user@example.com" />
          <label class="m-label">角色</label>
          <select v-model="adding.role_id" class="f-input">
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
          <label class="m-label">职位名称</label>
          <input v-model="adding.title" class="f-input" placeholder="如：社区运营" />
          <button class="btn btn-primary btn-block mt2" @click="saveAdd">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); flex: 1; }
.table-wrap { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); overflow-x: auto; }
.tbl { width: 100%; border-collapse: collapse; font-size: var(--fs-13); min-width: 780px; }
.tbl th { text-align: left; padding: 12px 14px; background: var(--card-2); font-weight: 600; color: var(--text-3); }
.tbl td { padding: 12px 14px; border-top: 1px solid var(--divider); }
.a-cell { display: flex; gap: 10px; align-items: center; }
.a-ava { width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; background: var(--brand-soft); color: var(--brand); font-style: normal; font-weight: 700; }
.a-cell div b { display: block; }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.op-group { display: flex; gap: 6px; }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(92vw, 460px); background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; }
.m-label { display: block; font-size: var(--fs-13); color: var(--text-3); margin: 12px 0 6px; }
.f-input { width: 100%; padding: 10px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--card); font-size: var(--fs-14); box-sizing: border-box; }
.mt2 { margin-top: 14px; }
</style>