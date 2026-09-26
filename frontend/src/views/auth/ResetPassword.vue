<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)

async function submit() {
  if (!form.oldPassword || !form.newPassword) return toast('请填写完整信息')
  if (form.newPassword !== form.confirmPassword) return toast('两次输入的密码不一致')
  if (form.newPassword === form.oldPassword) return toast('新密码不能与原密码相同')
  loading.value = true
  try {
    const r = await api.changePassword({ ...form })
    toast(r.message || '密码修改成功')
    if (userStore.profile) userStore.profile.must_change_password = 0
    setTimeout(() => {
      if (userStore.isAdmin) router.replace('/admin')
      else router.replace('/mine')
    }, 600)
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
      <h1>修改密码</h1>
      <p v-if="userStore.mustChangePassword">首次登录请先设置新密码</p>
      <p v-else>定期更换密码更安全</p>
    </div>
    <div class="auth-form">
      <div class="field">
        <input v-model="form.oldPassword" type="password" placeholder="当前密码" autocomplete="current-password" />
      </div>
      <div class="field">
        <input v-model="form.newPassword" type="password" placeholder="新密码（至少 6 位）" />
      </div>
      <div class="field">
        <input v-model="form.confirmPassword" type="password" placeholder="确认新密码" @keyup.enter="submit" />
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