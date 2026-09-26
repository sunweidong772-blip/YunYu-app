<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'

const router = useRouter()
const form = reactive({ email: '', code: '', password: '', confirmPassword: '' })
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
const step = ref(1) // 1 验证邮箱码 → 2 设新密码
let timer = null

async function sendCode() {
  if (!form.email) return toast('请先输入邮箱')
  if (sending.value || countdown.value > 0) return
  sending.value = true
  try {
    const r = await api.sendCode(form.email, 'reset_password')
    toast(r.message || '验证码已发送')
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

async function verify() {
  if (!form.email || !form.code) return toast('请填写邮箱和验证码')
  loading.value = true
  try {
    await api.verifyCode(form.email, 'reset_password', form.code)
    step.value = 2
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}

async function reset() {
  if (form.password !== form.confirmPassword) return toast('两次输入的密码不一致')
  loading.value = true
  try {
    const r = await api.resetPassword({ email: form.email, code: form.code, password: form.password, confirmPassword: form.confirmPassword })
    toast(r.message || '密码已重置')
    setTimeout(() => router.replace('/login'), 600)
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
      <h1>找回密码</h1>
      <p>通过邮箱验证码重置密码</p>
    </div>

    <div class="auth-form" v-if="step === 1">
      <div class="field">
        <input v-model.trim="form.email" type="email" placeholder="注册邮箱" />
      </div>
      <div class="field">
        <input v-model.trim="form.code" type="text" placeholder="邮箱验证码" maxlength="6" />
        <button class="field-btn" :disabled="countdown > 0" @click="sendCode">
          {{ countdown > 0 ? `${countdown}s 后重发` : (sending ? '发送中…' : '获取验证码') }}
        </button>
      </div>
      <button class="btn btn-primary btn-block mt5" :disabled="loading" @click="verify">
        {{ loading ? '验证中…' : '下一步' }}
      </button>
      <div style="text-align:center; margin-top:16px">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </div>

    <div class="auth-form" v-else>
      <div class="field">
        <input v-model="form.password" type="password" placeholder="新密码（至少 6 位）" />
      </div>
      <div class="field">
        <input v-model="form.confirmPassword" type="password" placeholder="确认新密码" @keyup.enter="reset" />
      </div>
      <button class="btn btn-primary btn-block mt5" :disabled="loading" @click="reset">
        {{ loading ? '提交中…' : '重置密码' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-brand.compact { padding: 40px 0 8px; }
.auth-brand.compact h1 { font-size: var(--fs-22); background: none; color: var(--text-1); -webkit-text-fill-color: initial; }
.link { color: var(--brand); font-size: var(--fs-13); }
</style>