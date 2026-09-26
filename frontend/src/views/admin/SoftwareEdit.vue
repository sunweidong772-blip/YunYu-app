<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'

const route = useRoute()
const router = useRouter()
const isNew = route.params.id === 'new'

const catList = ref([])
const form = ref({
  name: '', icon: '📦', icon_color: '#5B8DEF', category_id: null, summary: '', description: '',
  version: '1.0.0', size: '0 MB', developer: '', download_url: '', tags: [],
  is_recommend: false, is_hot: false, is_featured: false, is_banner: false, status: 'normal',
})
const versions = ref([])
const loading = ref(false)
const tagInput = ref('')

const newVer = ref({ version: '', size: '', download_url: '', changelog: '' })

async function load() {
  loading.value = true
  try {
    catList.value = await api.softwareCategories()
    if (!isNew) {
      const s = await api.admin.softwareDetail(route.params.id)
      form.value = {
        name: s.name, icon: s.icon, icon_color: s.icon_color || '#5B8DEF', category_id: s.category_id,
        summary: s.summary || '', description: s.description || '', version: s.version, size: s.size,
        developer: s.developer || '', download_url: s.download_url || '', tags: s.tags || [],
        is_recommend: !!s.is_recommend, is_hot: !!s.is_hot, is_featured: !!s.is_featured, is_banner: !!s.is_banner,
        status: s.status || 'normal',
      }
      versions.value = await api.admin.softwareVersions(route.params.id)
    }
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.value.tags.includes(t)) form.value.tags.push(t)
  tagInput.value = ''
}
function removeTag(i) { form.value.tags.splice(i, 1) }

async function save() {
  if (!form.value.name.trim()) { toast('请填写软件名称'); return }
  const body = {
    ...form.value,
    name: form.value.name.trim(),
    tags: form.value.tags.slice(0, 8),
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
  }
  try {
    if (isNew) {
      await api.admin.softwareCreate(body)
      toast('软件已添加')
      router.replace('/admin/software')
    } else {
      await api.admin.softwareUpdate(route.params.id, body)
      toast('软件已更新')
      load()
    }
  } catch (e) { toast(e.message) }
}

async function addVersion() {
  const v = newVer.value
  if (!v.version.trim()) { toast('请填写版本号'); return }
  try {
    await api.admin.softwareVersionCreate(route.params.id, { version: v.version.trim(), size: v.size, download_url: v.download_url, changelog: v.changelog })
    toast('版本已添加')
    newVer.value = { version: '', size: '', download_url: '', changelog: '' }
    versions.value = await api.admin.softwareVersions(route.params.id)
    if (v.version.trim()) form.value.version = v.version.trim()
  } catch (e) { toast(e.message) }
}

async function delVersion(v) {
  const ok = await confirmDialog('删除版本', `确定删除 v${v.version} 记录吗？`)
  if (!ok) return
  try {
    await api.admin.softwareVersionDelete(v.id)
    toast('已删除')
    versions.value = await api.admin.softwareVersions(route.params.id)
  } catch (e) { toast(e.message) }
}

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <button class="btn btn-outline btn-xs" @click="router.push('/admin/software')">← 返回</button>
      <h2 class="p-title">{{ isNew ? '添加软件' : '编辑软件' }}</h2>
      <span class="p-cnt" v-if="!isNew">ID: {{ route.params.id }}</span>
    </div>

    <div v-if="loading" class="skeleton" style="height:200px;border-radius:14px"></div>

    <div class="form-grid" v-else>
      <div class="panel">
        <div class="panel-head">基本信息</div>
        <label class="m-label">软件名称 *</label>
        <input v-model="form.name" class="f-input" placeholder="软件名称" />
        <div class="grid2">
          <div><label class="m-label">图标</label><input v-model="form.icon" class="f-input" placeholder="📦" /></div>
          <div><label class="m-label">图标底色</label><input v-model="form.icon_color" class="f-input" placeholder="#5B8DEF" /></div>
        </div>
        <label class="m-label">分类</label>
        <select v-model="form.category_id" class="f-input">
          <option :value="null">未分类</option>
          <option v-for="c in catList" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <label class="m-label">一句话简介</label>
        <input v-model="form.summary" class="f-input" placeholder="概述软件亮点" />
        <label class="m-label">详细介绍</label>
        <textarea v-model="form.description" class="f-input" rows="5" placeholder="详细介绍文字"></textarea>
      </div>

      <div class="panel">
        <div class="panel-head">版本与下载</div>
        <div class="grid2">
          <div><label class="m-label">版本号</label><input v-model="form.version" class="f-input" placeholder="1.0.0" /></div>
          <div><label class="m-label">大小</label><input v-model="form.size" class="f-input" placeholder="12 MB" /></div>
        </div>
        <label class="m-label">开发者</label>
        <input v-model="form.developer" class="f-input" placeholder="开发者 / 团队" />
        <label class="m-label">下载地址</label>
        <input v-model="form.download_url" class="f-input" placeholder="https://…" />
        <label class="m-label">标签（回车添加）</label>
        <div class="tag-editor">
          <span v-for="(t, i) in form.tags" :key="t" class="tag"><span>{{ t }}</span><i @click="removeTag(i)">✕</i></span>
          <input v-model="tagInput" class="tag-input" placeholder="添加标签…" @keyup.enter="addTag" @blur="addTag" />
        </div>
        <div class="check-grid">
          <label class="switch"><input type="checkbox" v-model="form.is_recommend" /> 推荐</label>
          <label class="switch"><input type="checkbox" v-model="form.is_hot" /> 热门</label>
          <label class="switch"><input type="checkbox" v-model="form.is_featured" /> 精选</label>
          <label class="switch"><input type="checkbox" v-model="form.is_banner" /> Banner</label>
        </div>
        <button class="btn btn-primary btn-block mt2" @click="save">{{ isNew ? '添加软件' : '保存修改' }}</button>
      </div>

      <div class="panel" v-if="!isNew">
        <div class="panel-head">版本记录（开发日志）</div>
        <div class="ver-new">
          <input v-model="newVer.version" class="f-input" placeholder="版本号，如 1.1.0" />
          <input v-model="newVer.size" class="f-input" placeholder="大小，如 12.5 MB" />
          <input v-model="newVer.download_url" class="f-input" placeholder="下载地址" />
          <input v-model="newVer.changelog" class="f-input" placeholder="更新说明" />
          <button class="btn btn-primary btn-sm" @click="addVersion">添加版本</button>
        </div>
        <div class="ver-row" v-for="v in versions" :key="v.id">
          <div class="vr-body">
            <b>v{{ v.version }}</b>
            <span class="u-sub">{{ v.size }}</span>
            <span class="vr-log" v-if="v.changelog">{{ v.changelog }}</span>
          </div>
          <button class="btn btn-outline btn-xs" @click="delVersion(v)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-cnt { font-size: var(--fs-12); color: var(--text-3); }
.btn-xs { height: 28px; font-size: var(--fs-11); padding: 0 10px; border-radius: 8px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
.panel { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); padding: 16px; }
.panel-head { font-size: var(--fs-15); font-weight: 700; margin-bottom: 10px; }
.m-label { display: block; font-size: var(--fs-12); color: var(--text-3); margin: 10px 0 5px; }
.f-input { width: 100%; padding: 9px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--bg); font-size: var(--fs-13); box-sizing: border-box; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tag-editor { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--bg); }
.tag { display: inline-flex; align-items: center; gap: 4px; background: var(--brand-soft); color: var(--brand); font-size: var(--fs-12); padding: 2px 8px; border-radius: var(--r-full); }
.tag i { font-style: normal; cursor: pointer; }
.tag-input { flex: 1; min-width: 90px; border: none; outline: none; background: transparent; font-size: var(--fs-12); color: var(--text-1); }
.check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.switch { display: flex; gap: 6px; align-items: center; font-size: var(--fs-13); }
.mt2 { margin-top: 12px; }
.ver-new { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
.ver-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--divider); }
.vr-body { flex: 1; display: flex; gap: 10px; align-items: baseline; font-size: var(--fs-13); flex-wrap: wrap; }
.vr-log { font-size: var(--fs-12); color: var(--text-3); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
@media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .grid2, .ver-new { grid-template-columns: 1fr; } }
</style>