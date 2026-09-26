<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast, confirmDialog } from '@/utils/ui'
import { timeAgo } from '@/utils/format'

const list = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)

async function load() {
  try {
    const r = await api.admin.userCollections(`?page=${page.value}&pageSize=15`)
    list.value = r.list || []
    total.value = r.total || 0
  } catch (e) { toast(e.message) } finally { loading.value = false }
}

async function remove(c) {
  const ok = await confirmDialog('下架专题', `确定下架用户「${c.nickname || c.user_uid}」的专题「${c.name}」吗？下架后用户端不可见`)
  if (!ok) return
  try {
    await api.admin.userCollectionDelete(c.id)
    toast('已下架')
    load()
  } catch (e) { toast(e.message) }
}

function prev() { if (page.value > 1) { page.value--; load() } }
function next() { if (page.value * 15 < total.value) { page.value++; load() } }

onMounted(load)
</script>

<template>
  <div class="ad-page">
    <div class="p-head">
      <h2 class="p-title">用户专题 <span class="sub">共 {{ total }} 个 · 用户生成 · 可下架违规内容</span></h2>
    </div>

    <div class="tbl">
      <div class="tbl-head">
        <span class="th th-name">专题名称</span>
        <span class="th th-mid">作者</span>
        <span class="th th-cnt">软件数</span>
        <span class="th th-vis">可见性</span>
        <span class="th th-time">更新时间</span>
        <span class="th th-ops"></span>
      </div>

      <div class="tbl-body">
        <div v-if="loading" class="tbl-empty">加载中…</div>
        <template v-else>
          <div class="tbl-row" v-for="c in list" :key="c.id">
            <span class="th th-name ellipsis">{{ c.name }}</span>
            <span class="th th-mid">{{ c.nickname }} <em class="uid">UID {{ c.user_uid }}</em></span>
            <span class="th th-cnt">{{ c.software_count || 0 }}</span>
            <span class="th th-vis">
              <span class="tag" :class="c.is_public ? 'pub' : 'pri'">{{ c.is_public ? '公开' : '私密' }}</span>
              <span class="tag" :class="c.status === 'normal' ? 'ok' : 'bad'">{{ c.status === 'normal' ? '正常' : '已下架' }}</span>
            </span>
            <span class="th th-time">{{ timeAgo(c.updated_at) }}</span>
            <span class="th th-ops">
              <button class="op-btn danger" v-if="c.status === 'normal'" @click="remove(c)">下架</button>
            </span>
          </div>
          <div class="tbl-empty" v-if="!list.length">暂无用户专题</div>
        </template>
      </div>
    </div>

    <div class="pager" v-if="total > 15">
      <button class="pg-btn" :disabled="page <= 1" @click="prev">上一页</button>
      <span class="pg-info">{{ page }} / {{ Math.ceil(total / 15) }}</span>
      <button class="pg-btn" :disabled="page * 15 >= total" @click="next">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.p-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
.p-title { font-size: var(--fs-20); font-weight: 800; }
.p-title .sub { font-size: var(--fs-12); color: var(--text-3); font-weight: 400; margin-left: 8px; }
.tbl { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); }
.tbl-head, .tbl-row { display: grid; grid-template-columns: 2fr 1.4fr 0.7fr 1fr 1fr 0.8fr; gap: 10px; align-items: center; padding: 12px 14px; }
.tbl-head { font-size: var(--fs-11); color: var(--text-3); border-bottom: 1px solid var(--divider); }
.tbl-row { font-size: var(--fs-13); border-bottom: 1px solid var(--divider); }
.tbl-row:last-child { border-bottom: none; }
.th-name { font-weight: 600; }
.th-mid em.uid { font-style: normal; color: var(--text-3); font-size: var(--fs-10); margin-left: 4px; }
.th-vis { display: flex; gap: 6px; }
.tag { font-size: var(--fs-10); padding: 2px 8px; border-radius: var(--r-full); }
.tag.pub { background: var(--success-soft, rgba(16,185,129,.12)); color: var(--success, #2fb344); }
.tag.pri { background: var(--warning-soft); color: var(--warning); }
.tag.ok { background: var(--brand-soft); color: var(--brand); }
.tag.bad { background: rgba(229,72,77,.1); color: var(--danger, #e5484d); }
.op-btn { height: 26px; padding: 0 12px; border-radius: var(--r-full); font-size: var(--fs-11); border: 1px solid var(--divider); background: var(--card-2); color: var(--text-2); }
.op-btn.danger { color: var(--danger, #e5484d); border-color: rgba(229,72,77,.35); }
.tbl-empty { padding: 32px 0; text-align: center; color: var(--text-3); font-size: var(--fs-13); }
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 16px; }
.pg-btn { padding: 6px 14px; border-radius: var(--r-full); border: 1px solid var(--divider); background: var(--card); color: var(--text-2); font-size: var(--fs-12); }
.pg-btn:disabled { opacity: .4; }
.pg-info { font-size: var(--fs-12); color: var(--text-3); }
</style>