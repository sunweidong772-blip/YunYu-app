<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const showPwd = ref(false)

async function submit() {
  if (!form.email || !form.password) return toast('请输入邮箱和密码')
  loading.value = true
  try {
    const user = await userStore.login(form.email, form.password)
    toast(`欢迎回来，${user.nickname}`)
    // 管理员首次登录强制改密
    if (user.must_change_password) {
      router.push('/reset-password')
    } else if (userStore.isAdmin) {
      router.push('/admin')
    } else {
      router.replace(route.query.redirect || '/home')
    }
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-brand">
      <div class="logo">🏝️</div>
      <h1>云屿</h1>
      <p>软件聚合社区 · 发现好软件</p>
    </div>

    <div class="auth-form">
      <div class="field">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></svg>
        <input v-model.trim="form.email" type="email" placeholder="邮箱地址" autocomplete="username" />
      </div>
      <div class="field">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
        <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="密码" autocomplete="current-password" @keyup.enter="submit" />
        <button class="field-btn" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</button>
      </div>

      <button class="btn btn-primary btn-block mt5" :disabled="loading" @click="submit">
        {{ loading ? '登录中…' : '登 录' }}
      </button>

      <div class="auth-links between mt4">
        <router-link to="/forgot" class="link">忘记密码？</router-link>
        <router-link to="/register" class="link">注册新账号 →</router-link>
      </div>
    </div>

    <p class="auth-tip">登录即代表同意《用户协议》与《隐私政策》</p>
  </div>
</template>

<style scoped>
.auth-form { margin-top: 36px; }
.auth-form .field svg { margin-right: 10px; flex-shrink: 0; }
.link { color: var(--brand); font-size: var(--fs-13); font-weight: 500; }
.auth-tip { margin-top: auto; padding: 26px 0 calc(20px + var(--safe-bottom)); text-align: center; font-size: var(--fs-11); color: var(--text-3); }
</style>