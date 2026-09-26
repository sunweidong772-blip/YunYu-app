<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => {
  setTimeout(() => router.replace('/home'), 1800)
})
</script>

<template>
  <div class="splash">
    <div class="cloud cloud-1">☁️</div>
    <div class="cloud cloud-2">☁️</div>
    <div class="cloud cloud-3">🌫️</div>
    <div class="glow"></div>
    <div class="splash-inner">
      <div class="logo">
        <div class="logo-island"></div>
        <svg class="logo-cloud" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6">
          <path d="M7 18a4 4 0 0 1-.5-8A4.5 4.5 0 0 1 15 9a3.5 3.5 0 0 1 .7 6.9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-wave w1"></span><span class="logo-wave w2"></span><span class="logo-wave w3"></span>
      </div>
      <h1>云屿</h1>
      <p class="sub">发现好软件 · 遇见好社区</p>
      <div class="loading-spin"></div>
    </div>
  </div>
</template>

<style scoped>
.splash { position: relative; height: 100vh; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(160deg, #6fb7ff 0%, #2f8cff 55%, #1e6fd6 100%); color: #fff; }
.glow { position: absolute; width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 65%); top: 12%; animation: floatY 5s ease-in-out infinite; }
.cloud { position: absolute; font-size: 60px; opacity: 0.35; animation: floatY 6s ease-in-out infinite; }
.cloud-1 { top: 14%; left: 12%; }
.cloud-2 { top: 30%; right: 10%; animation-delay: 1.4s; font-size: 44px; }
.cloud-3 { bottom: 26%; left: 16%; animation-delay: 2.6s; font-size: 34px; }
.splash-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
.logo { position: relative; width: 92px; height: 92px; border-radius: 26px; background: rgba(255,255,255,0.16); backdrop-filter: blur(6px); border: 1.5px solid rgba(255,255,255,0.35); box-shadow: 0 18px 40px rgba(20, 80, 150, 0.35); animation: popIn 0.7s cubic-bezier(0.2, 1.2, 0.4, 1) both; }
.logo-island { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); width: 40px; height: 20px; border-radius: 60% 60% 30% 30%; background: #2f8cff; }
.logo-cloud { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 44px; height: 44px; }
.logo-wave { position: absolute; bottom: 4px; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.85); }
.w1 { left: 22px; } .w2 { left: 34px; width: 11px; height: 11px; } .w3 { left: 48px; width: 7px; height: 7px; }
h1 { margin-top: 26px; font-size: 42px; font-weight: 800; letter-spacing: 6px; text-shadow: 0 4px 20px rgba(20, 80, 150, 0.3); animation: fadeUp 0.8s 0.15s ease both; }
.sub { margin-top: 8px; font-size: var(--fs-14); opacity: 0.9; letter-spacing: 2px; animation: fadeUp 0.8s 0.3s ease both; }
.loading-spin { margin-top: 46px; border-color: rgba(255,255,255,0.3); border-top-color: #fff; animation-delay: 0.4s; }
</style>