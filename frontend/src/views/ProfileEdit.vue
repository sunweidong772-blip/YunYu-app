<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const userStore = useUserStore()

const nickname = ref('')
const bio = ref('')
const saving = ref(false)

onMounted(() => {
  const u = userStore.userInfo
  if (u) { nickname.value = u.nickname || ''; bio.value = u.bio || '' }
})

async function save() {
  if (!nickname.value.trim()) { toast('请输入昵称'); return }
  saving.value = true
  try {
    await api.updateProfile({ nickname: nickname.value.trim(), bio: bio.value.trim() })
    userStore.refreshMe()
    toast('资料已更新')
    router.back()
  } catch (e) { toast(e.message) } finally { saving.value = false }
}
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="编辑资料" showBack />

    <div class="container">
      <div class="form-group">
        <label>昵称</label>
        <input v-model="nickname" class="input" maxlength="16" placeholder="2-16 个字符" />
        <span class="tip">{{ nickname.length }}/16</span>
      </div>

      <div class="form-group">
        <label>个性签名</label>
        <textarea v-model="bio" class="input textarea" maxlength="120" rows="3" placeholder="介绍一下自己吧 (120 字以内)"></textarea>
        <span class="tip">{{ bio.length }}/120</span>
      </div>

      <div class="form-group">
        <label>头像</label>
        <div class="avatar-tip">头像暂支持系统默认头像，后续将开放自定义上传</div>
      </div>

      <button class="btn btn-primary btn-block" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存修改' }}</button>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 16px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: var(--fs-14); font-weight: 700; margin-bottom: 8px; }
.input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--card); color: var(--text-1); font-size: var(--fs-14); }
.input.textarea { resize: none; line-height: 1.6; }
.tip { display: block; text-align: right; font-size: var(--fs-10); color: var(--text-3); margin-top: 4px; }
.avatar-tip { font-size: var(--fs-12); color: var(--text-3); padding: 10px 0; }
.btn-block { width: 100%; }
</style>