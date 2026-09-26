<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtNum } from '@/utils/format'
import NavBar from '@/components/NavBar.vue'

const info = ref(null)

onMounted(async () => {
  try { info.value = await api.about() } catch (e) { toast(e.message) }
})
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="关于云屿" showBack />

    <div class="about-hero" v-if="info">
      <div class="about-logo">☁️</div>
      <h1>{{ info.name }}</h1>
      <p class="about-slogan">{{ info.slogan }}</p>
    </div>

    <div class="container" v-if="info">
      <div class="text-card">{{ info.description }}</div>

      <div class="stat-row">
        <div class="st"><b>{{ fmtNum(info.stats.software) }}</b><span>收录软件</span></div>
        <div class="st"><b>{{ fmtNum(info.stats.users) }}</b><span>云屿用户</span></div>
        <div class="st"><b>{{ fmtNum(info.stats.posts) }}</b><span>社区帖子</span></div>
      </div>

      <div class="sec-title">版本信息</div>
      <div class="group">
        <div class="set-row"><span>当前版本</span><span class="val">v{{ info.version }}</span></div>
        <div class="set-row"><span>更新日期</span><span class="val">2026-09</span></div>
        <div class="set-row"><span>技术支持</span><span class="val">云屿团队</span></div>
      </div>

      <div class="sec-title">联系与反馈</div>
      <div class="group">
        <div class="set-row"><span>官方邮箱</span><span class="val">support@yunyu.app</span></div>
      </div>

      <p class="copyright">© 2026 云屿 YunYu · 用心连接每一朵云</p>
    </div>
  </div>
</template>

<style scoped>
.about-hero { padding: 40px 20px 30px; text-align: center; }
.about-logo { width: 84px; height: 84px; line-height: 84px; border-radius: 24px; margin: 0 auto; background: var(--brand-grad); font-size: 42px; box-shadow: 0 12px 30px var(--brand-shadow); }
.about-hero h1 { margin-top: 14px; font-size: var(--fs-24); font-weight: 900; }
.about-slogan { margin-top: 6px; font-size: var(--fs-14); color: var(--text-3); }
.text-card { padding: 16px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); font-size: var(--fs-13); line-height: 1.8; color: var(--text-2); }
.stat-row { display: flex; margin-top: 16px; padding: 16px; border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); }
.st { flex: 1; text-align: center; }
.st b { display: block; font-size: var(--fs-22); font-weight: 900; color: var(--brand); }
.st span { font-size: var(--fs-12); color: var(--text-3); }
.sec-title { margin: 18px 0 8px; font-size: var(--fs-13); color: var(--text-3); font-weight: 700; }
.group { border-radius: var(--r-md); background: var(--card); box-shadow: var(--shadow-sm); overflow: hidden; }
.set-row { display: flex; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: var(--fs-14); }
.set-row:last-child { border-bottom: none; }
.val { color: var(--text-3); }
.copyright { text-align: center; margin-top: 26px; font-size: var(--fs-11); color: var(--text-3); }
</style>