<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'

const settings = ref({})
const loading = ref(true)
const saving = ref(false)

const defs = [
  { key: 'site_name', label: '站点名称', type: 'text', desc: '展示在首页与页面的品牌名' },
  { key: 'site_slogan', label: '站点标语', type: 'text', desc: '品牌一句话介绍' },
  { key: 'announcement_enabled', label: '首页公告显示', type: 'switch', desc: '是否在首页展示公告栏' },
  { key: 'register_enabled', label: '开放注册', type: 'switch', desc: '是否允许新用户注册' },
  { key: 'checkin_enabled', label: '开启签到', type: 'switch', desc: '是否启用每日签到功能' },
  { key: 'upload_enabled', label: '开启上传', type: 'switch', desc: '预留：是否允许上传图片' },
]

onMounted(async () => {
  try {
    settings.value = await api.admin.settings()
    defs.forEach((d) => { if (settings.value[d.key] === undefined) settings.value[d.key] = d.type === 'switch' ? '1' : '' })
  } catch (e) { toast(e.message) } finally { loading.value = false }
})

async function save() {
  saving.value = true
  try {
    await api.admin.settingsUpdate(settings.value)
    toast('设置已保存')
  } catch (e) { toast(e.message) } finally { saving.value = false }
}
</script>

<template>
  <div class="ad-page">
    <h2 class="p-title">系统设置</h2>

    <div v-if="loading" class="skeleton" style="height:200px;border-radius:14px"></div>

    <div class="panel" v-else>
      <div class="set-row" v-for="d in defs" :key="d.key">
        <div class="sr-body">
          <b>{{ d.label }}</b>
          <span class="u-sub">{{ d.desc }}</span>
        </div>
        <template v-if="d.type === 'switch'">
          <label class="switch">
            <input type="checkbox" :checked="settings[d.key] === '1'" @change="settings[d.key] = $event.target.checked ? '1' : '0'" />
          </label>
        </template>
        <template v-else>
          <input v-model="settings[d.key]" class="f-input mono" :placeholder="d.label" />
        </template>
      </div>

      <button class="btn btn-primary btn-sm mt3" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存设置' }}</button>
    </div>
  </div>
</template>

<style scoped>
.p-title { font-size: var(--fs-20); font-weight: 800; margin-bottom: 14px; }
.panel { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); padding: 16px; max-width: 620px; }
.set-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--divider); }
.sr-body b { display: block; font-size: var(--fs-14); }
.u-sub { font-size: var(--fs-11); color: var(--text-3); }
.f-input { width: 220px; padding: 8px 12px; border: 1px solid var(--divider); border-radius: var(--r-md); background: var(--bg); font-size: var(--fs-13); }
.mono { font-family: monospace; }
.switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch::after {
  content: ''; position: absolute; inset: 0; border-radius: var(--r-full); background: var(--card-2);
  border: 1px solid var(--divider); transition: background .2s;
}
.switch:has(input:checked)::after { background: var(--brand); border-color: var(--brand); }
.switch::before {
  content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
  background: #fff; z-index: 1; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.25);
}
.switch:has(input:checked)::before { left: 23px; }
.mt3 { margin-top: 18px; }
</style>