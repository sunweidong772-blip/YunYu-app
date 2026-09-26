<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ currentPassword: '', newEmail: '', code: '' })
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer = null

async function sendCode() {
  if (!form.newEmail) return toast('请先输入新邮箱')
  if (sending.value || countdown.value > 0) return
  sending.value = true
  try {
    const r = await api.sendCode(form.newEmail, 'change_email')
    toast(r.message || '验证码已发送到新邮箱')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    toast(e.message)
  } finally {
    sending.value = false
  }
}

async function submit() {
  if (!form.currentPassword || !form.newEmail || !form.code) return toast('请填写完整信息')
  loading.value = true
  try {
    const r = await api.changeEmail({ ...form, newEmail: form.newEmail.trim() })
    toast(r.message || '邮箱修改成功')
    if (userStore.profile) { userStore.profile.email = form.newEmail.trim() }
    setTimeout(() => router.replace('/settings'), 700)
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-brand compact">
      <h1>修改邮箱</h1>
      <p>验证当前密码，绑定新邮箱</p>
    </div>
    <div class="auth-form">
      <div class="field">
        <input v-model="form.currentPassword" type="password" placeholder="当前密码（验证身份）" autocomplete="current-password" />
      </div>
      <div class="field">
        <input v-model.trim="form.newEmail" type="email" placeholder="新邮箱地址" />
      </div>
      <div class="field">
        <input v-model.trim="form.code" type="text" placeholder="新邮箱收到的验证码" maxlength="6" />
        <button class="field-btn" :disabled="countdown > 0" @click="sendCode">
          {{ countdown > 0 ? `${countdown}s 后重发` : (sending ? '发送中…' : '获取验证码') }}
        </button>
      </div>
      <button class="btn btn-primary btn-block mt5" :disabled="loading" @click="submit">
        {{ loading ? '提交中…' : '确认修改' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-brand.compact { padding: 46px 0 10px; }
.auth-brand.compact h1 { font-size: var(--fs-22); background: none; color: var(--text-1); -webkit-text-fill-color: initial; }
</style>