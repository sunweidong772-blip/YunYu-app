<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'

const data = ref(null)
const loading = ref(false)
const editing = ref(null)

const groupNames = ['用户管理', '内容管理', '运营管理', '系统管理']

async function load() {
  loading.value = true
  try { data.value = await api.admin.roles() } catch (e) { toast(e.message) } finally { loading.value = false }
}
function groups() {
  const map = {}
  ;(data.value ? data.value.permissions : []).forEach((p) => {
    const g = p.group_name || '其他'
    if (!map[g]) map[g] = []
    map[g].push(p)
  })
  return map
}

function openEdit(role) {
  editing.value = { id: role.id, name: role.name, description: role.description || '', permissions: [...role.permissions] }
}
function togglePer(code) {
  const arr = editing.value.permissions
  const i = arr.indexOf(code)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(code)
}
async function save() {
  try {
    await api.admin.roleUpdate(editing.value.id, { name: editing.value.name, description: editing.value.description, permissions: editing.value.permissions })
    toast('角色已更新')
    editing.value = null
    load()
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <h2 class="p-title">角色权限</h2>

    <div v-if="loading" class="skeleton" style="height:140px;border-radius:14px"></div>

    <div class="role-grid" v-else-if="data">
      <div class="role-card" v-for="r in data.roles" :key="r.id" :class="{ owner: r.code === 'owner' }">
        <div class="rc-head">
          <div>
            <b>{{ r.name }}</b>
            <span class="u-sub">{{ r.description || '自定义角色' }}</span>
          </div>
          <span class="badge">{{ r.permissions.length }} 项权限</span>
        </div>
        <div class="rc-tags">
          <span class="ptag" v-for="code in r.permissions.slice(0, 8)" :key="code">{{ code }}</span>
          <span v-if="r.permissions.length > 8" class="u-sub">+{{ r.permissions.length - 8 }}</span>
        </div>
        <button class="btn btn-outline btn-xs" @click="openEdit(r)">配置权限</button>
      </div>
    </div>

    <div v-if="editing" class="modal-mask" @click.self="editing = null">
      <div class="modal">
        <div class="m-head">
          <div><b>{{ editing.name }}</b><button @click="editing = null">✕</button></div>
        </div>
        <div class="m-body">
          <div class="perm-group" v-for="(perms, g) in groups()" :key="g">
            <div class="pg-title">{{ g }}</div>
            <label class="perm" v-for="p in perms" :key="p.code">
              <input type="checkbox" :checked="editing.permissions.includes(p.code)" @change="togglePer(p.code)" />
              <span>{{ p.name }}</span>
              <em class="u-sub">{{ p.code }}</em>
            </label>
          </div>
          <button class="btn btn-primary btn-block mt2" @click="save">保存权限</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-title { font-size: var(--fs-20); font-weight: 800; margin-bottom: 14px; }
.role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.role-card { padding: 16px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.role-card.owner { outline: 1px solid var(--warning); }
.rc-head { display: flex; justify-content: space-between; align-items: flex-start; }
.rc-head b { display: block; font-size: var(--fs-16); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.rc-tags { display: flex; flex-wrap: wrap; gap: 5px; margin: 12px 0; min-height: 26px; }
.ptag { background: var(--card-2); font-size: var(--fs-10); padding: 3px 8px; border-radius: var(--r-full); color: var(--text-2); }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 12px; border-radius: 8px; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 95; display: flex; align-items: center; justify-content: center; }
.modal { width: min(94vw, 640px); max-height: 86vh; overflow-y: auto; background: var(--card); border-radius: var(--r-lg); padding: 18px; }
.m-head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-16); }
.m-head button { font-size: 16px; margin-left: 10px; }
.perm-group { margin-bottom: 14px; }
.pg-title { font-size: var(--fs-13); font-weight: 700; color: var(--brand); margin-bottom: 6px; }
.perm { display: flex; align-items: center; gap: 8px; padding: 7px 0; font-size: var(--fs-13); border-bottom: 1px dashed var(--divider); cursor: pointer; }
.perm em { margin-left: auto; }
.mt2 { margin-top: 14px; }
@media (max-width: 700px) { .role-grid { grid-template-columns: 1fr; } }
</style>