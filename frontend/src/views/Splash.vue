<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => {
  setTimeout(() => router.replace('/home'), 2000)
})
</script>

<template>
  <div class="splash">
    <!-- 背景装饰 -->
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
    <div class="grid-bg"></div>

    <!-- 浮动粒子 -->
    <div class="particle p1">●</div>
    <div class="particle p2">●</div>
    <div class="particle p3">●</div>
    <div class="particle p4">●</div>
    <div class="particle p5">●</div>

    <!-- 主内容 -->
    <div class="splash-inner">
      <div class="brand-mark">
        <div class="mark-bg">
          <svg class="mark-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round">
            <path d="M7 18a4 4 0 01-.5-8A4.5 4.5 0 0115 9a3.5 3.5 0 01.7 6.9"/>
          </svg>
        </div>
        <div class="mark-glow"></div>
      </div>
      <h1 class="brand-name">云屿</h1>
      <p class="brand-tag">发现好软件 · 遇见好社区</p>

      <!-- 加载指示器 -->
      <div class="loader">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>
    </div>

    <!-- 底部版本号 -->
    <div class="version">v2.0</div>
  </div>
</template>

<style scoped>
.splash {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #6366F1 0%, #4F46E5 40%, #4338CA 100%);
  color: #fff;
}

/* 背景光球 */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation: orbFloat 8s ease-in-out infinite;
}
.orb-1 {
  width: 280px; height: 280px;
  background: #818CF8;
  top: 10%; left: -10%;
  animation-delay: 0s;
}
.orb-2 {
  width: 200px; height: 200px;
  background: #A5B4FC;
  top: 50%; right: -8%;
  animation-delay: -2s;
}
.orb-3 {
  width: 160px; height: 160px;
  background: #C7D2FE;
  bottom: 15%; left: 30%;
  animation-delay: -4s;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.95); }
}

/* 网格背景 */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* 浮动粒子 */
.particle {
  position: absolute;
  font-size: 6px;
  color: rgba(255,255,255,0.3);
  animation: particleFloat 6s ease-in-out infinite;
}
.p1 { top: 20%; left: 20%; animation-delay: 0s; }
.p2 { top: 35%; right: 25%; animation-delay: -1s; }
.p3 { top: 60%; left: 15%; animation-delay: -2s; }
.p4 { top: 70%; right: 20%; animation-delay: -3s; }
.p5 { top: 45%; left: 70%; animation-delay: -4s; }
@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
}

/* 主内容 */
.splash-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: contentReveal 0.6s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}

@keyframes contentReveal {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.brand-mark {
  position: relative;
  margin-bottom: 24px;
}
.mark-bg {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 40px rgba(79, 70, 229, 0.3);
  animation: markPulse 2s ease-in-out infinite;
}
@keyframes markPulse {
  0%, 100% { box-shadow: 0 12px 40px rgba(79, 70, 229, 0.3); }
  50% { box-shadow: 0 12px 50px rgba(79, 70, 229, 0.5); }
}
.mark-icon {
  width: 44px;
  height: 44px;
}
.mark-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.brand-name {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 8px;
  text-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
  animation: nameReveal 0.8s 0.2s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}
@keyframes nameReveal {
  from { opacity: 0; transform: translateY(10px); letter-spacing: 20px; }
  to { opacity: 1; transform: translateY(0); letter-spacing: 8px; }
}

.brand-tag {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.75;
  letter-spacing: 3px;
  animation: fadeUp 0.6s 0.5s ease both;
}

/* 加载器 */
.loader {
  display: flex;
  gap: 6px;
  margin-top: 48px;
  animation: fadeUp 0.4s 0.8s ease both;
}
.loader-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.6);
  animation: dotBounce 1.4s ease-in-out infinite;
}
.loader-dot:nth-child(2) { animation-delay: 0.2s; }
.loader-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 版本号 */
.version {
  position: absolute;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  font-size: 11px;
  opacity: 0.4;
  letter-spacing: 1px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
</style>
