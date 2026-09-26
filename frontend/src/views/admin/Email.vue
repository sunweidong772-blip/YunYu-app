<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const cfg = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    cfg.value = await api.admin.emailConfig()
  } catch (e) { toast(e.message) } finally { loading.value = false }
})
</script>

<template>
  <div class="ad-page">
    <h2 class="p-title">邮箱配置</h2>

    <div v-if="loading" class="skeleton" style="height:160px;border-radius:14px"></div>

    <div class="panel" v-else-if="cfg">
      <div class="panel-head">SMTP 服务状态</div>
      <div class="cfg-row">
        <span>邮箱系统</span>
        <b :class="cfg.smtpConfigured ? 'ok' : 'no'">{{ cfg.smtpConfigured ? '✅ 已配置' : '⚠️ 未配置（开发模式）' }}</b>
      </div>
      <div class="cfg-row"><span>当前模式</span><b :class="cfg.devMode ? 'warn' : 'ok'">{{ cfg.devMode ? '开发模式' : '生产模式' }}</b></div>
      <div class="cfg-row"><span>SMTP 主机</span><b class="mono">{{ cfg.smtpHost || '—' }}</b></div>
      <div class="cfg-row"><span>SMTP 端口</span><b class="mono">{{ cfg.smtpPort || '—' }}</b></div>
      <div class="cfg-row"><span>发件账号</span><b class="mono">{{ cfg.smtpUser || '—' }}</b></div>
      <div class="cfg-row"><span>发件人名称</span><b>{{ cfg.smtpFrom || '—' }}</b></div>

      <div class="notice mt3">
        <b>配置说明</b>
        <p>SMTP 凭据通过服务端环境变量配置（不存储于数据库，也无法在此查看）。</p>
        <p>开发模式：验证码会直接显示在服务端日志，并随接口返回，方便本地演示注册、找回密码、更换邮箱流程。</p>
        <p>生产模式：设置以下环境变量后重启服务即可：</p>
        <pre class="code-block">SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=your_password_or_auth_code
SMTP_FROM=云屿 &lt;your@email.com&gt;</pre>
      </div>
      <button class="btn btn-outline btn-sm mt3" @click="router.push('/admin/settings')">前往系统设置</button>
    </div>
  </div>
</template>

<style scoped>
.p-title { font-size: var(--fs-20); font-weight: 800; margin-bottom: 14px; }
.panel { background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow-sm); padding: 16px; max-width: 640px; }
.panel-head { font-size: var(--fs-15); font-weight: 700; margin-bottom: 10px; }
.cfg-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--divider); font-size: var(--fs-13); }
.cfg-row span { color: var(--text-3); }
.cfg-row .ok { color: var(--success); }
.cfg-row .no { color: var(--warning); }
.cfg-row .warn { color: var(--warning); }
.mono { font-family: monospace; }
.notice { background: var(--brand-soft); border-radius: var(--r-md); padding: 14px; font-size: var(--fs-13); }
.notice b { color: var(--brand); }
.notice p { margin-top: 6px; color: var(--text-2); line-height: 1.7; }
.code-block { background: var(--bg); border-radius: 8px; padding: 12px; font-size: var(--fs-12); line-height: 1.8; overflow-x: auto; color: var(--text-2); }
.mt3 { margin-top: 16px; }
</style>