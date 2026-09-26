import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import './styles/theme.css'
import './styles/base.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 初始化主题（在渲染前应用，避免闪烁）
const theme = useThemeStore(pinia)
theme.init()

// 初始化用户态并安装路由守卫
const user = useUserStore(pinia)
user.init()

app.use(router)
app.mount('#app')

// 若应用初始带 splash 则等待后进入
const splashOnce = sessionStorage.getItem('yunyu_splash') || ''
if (location.pathname === '/home' && !splashOnce) {
  sessionStorage.setItem('yunyu_splash', '1')
  location.replace('/splash')
}