<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { toast, confirmDialog } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const themes = [
  { key: 'system', label: '跟随系统' },
  { key: 'light', label: '浅色模式' },
  { key: 'dark', label: '深色模式' },
]

async function logout() {
  const ok = await confirmDialog('退出登录', '确定要退出当前账号吗？')
  if (!ok) return
  userStore.logout()
  toast('已退出登录')
  router.replace('/login')
}
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="设置" showBack />

    <div class="container">
      <div class="sec-title">外观</div>
      <div class="group">
        <div class="set-row" v-for="t in themes" :key="t.key" @click="themeStore.setMode(t.key)">
          <span>{{ t.label }}</span>
          <span class="radio" :class="{ on: themeStore.mode === t.key }">✓</span>
        </div>
      </div>

      <div class="sec-title">账号安全</div>
      <div class="group">
        <div class="set-row" @click="router.push('/reset-password')"><span>修改密码</span><span class="arrow">›</span></div>
        <div class="set-row" @click="router.push('/change-email')"><span>更换邮箱</span><span class="arrow">›</span></div>
      </div>

      <div class="sec-title">更多</div>
      <div class="group">
        <div class="set-row" @click="router.push('/announcements')"><span>公告</span><span class="arrow">›</span></div>
        <div class="set-row" @click="router.push('/about')"><span>关于云屿</span><span class="arrow">›</span></div>
      </div>

      <button v-if="userStore.isLogin" class="btn btn-danger btn-block logout" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 16px; }
.sec-title { margin: 14px 0 8px; font-size: var(--fs-13); color: var(--text-3); font-weight: 700; }
.group { border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); overflow: hidden; }
.set-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: var(--fs-14); cursor: pointer; }
.set-row:last-child { border-bottom: none; }
.radio { width: 20px; height: 20px; line-height: 20px; border-radius: var(--r-full); border: 1px solid var(--line); text-align: center; font-size: var(--fs-11); color: transparent; }
.radio.on { background: var(--brand); border-color: var(--brand); color: #fff; }
.arrow { color: var(--text-3); font-size: 18px; }
.logout { margin-top: 24px; }
</style>