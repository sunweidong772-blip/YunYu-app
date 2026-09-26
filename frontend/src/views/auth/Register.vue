<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ email: '', code: '', nickname: '', password: '', confirmPassword: '', agree: true })
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
const showPwd = ref(false)
const showPwd2 = ref(false)
let timer = null

async function sendCode() {
  if (!form.email) return toast('请先输入邮箱')
  if (sending.value || countdown.value > 0) return
  sending.value = true
  try {
    const r = await api.sendCode(form.email, 'register')
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

async function submit() {
  if (!form.email || !form.code) return toast('请填写邮箱和验证码')
  if (!form.agree) return toast('请先同意用户协议与隐私政策')
  if (form.password !== form.confirmPassword) return toast('两次输入的密码不一致')
  loading.value = true
  try {
    const data = await api.register({ ...form, email: form.email.trim() })
    userStore.token = data.token
    toast('注册成功，欢迎来到云屿！')
    router.replace('/home')
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
      <h1>注册云屿</h1>
      <p>创建你的云屿账号</p>
    </div>

    <div class="auth-form">
      <div class="field">
        <input v-model.trim="form.email" type="email" placeholder="邮箱地址" />
      </div>
      <div class="field">
        <input v-model.trim="form.code" type="text" placeholder="邮箱验证码" maxlength="6" />
        <button class="field-btn" :disabled="countdown > 0" @click="sendCode">
          {{ countdown > 0 ? `${countdown}s 后重发` : (sending ? '发送中…' : '获取验证码') }}
        </button>
      </div>
      <div class="field">
        <input v-model.trim="form.nickname" type="text" placeholder="昵称（2-16 个字符）" maxlength="16" />
      </div>
      <div class="field">
        <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="设置密码（至少 6 位）" />
        <button class="field-btn" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</button>
      </div>
      <div class="field">
        <input v-model="form.confirmPassword" :type="showPwd2 ? 'text' : 'password'" placeholder="确认密码" />
        <button class="field-btn" @click="showPwd2 = !showPwd2">{{ showPwd2 ? '隐藏' : '显示' }}</button>
      </div>

      <label class="agree flex">
        <input v-model="form.agree" type="checkbox" />
        <span>我已阅读并同意 <a @click.prevent>《用户协议》</a>与<a @click.prevent>《隐私政策》</a></span>
      </label>

      <button class="btn btn-primary btn-block mt4" :disabled="loading" @click="submit">
        {{ loading ? '注册中…' : '注 册' }}
      </button>

      <div class="auth-links" style="text-align:center; margin-top:16px">
        <router-link to="/login" class="link">已有账号？去登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-brand.compact { padding: 40px 0 8px; }
.auth-brand.compact h1 { font-size: var(--fs-22); background: none; color: var(--text-1); -webkit-text-fill-color: initial; }
.agree { margin-top: 14px; gap: 8px; font-size: var(--fs-12); color: var(--text-2); }
.agree a { color: var(--brand); }
.agree input { width: 16px; height: 16px; accent-color: var(--brand); flex-shrink: 0; }
.link { color: var(--brand); font-size: var(--fs-13); font-weight: 500; }
</style>