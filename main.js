import Vue from 'vue'
import App from './App'

import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

// 引入全局TuniaoUI
import TuniaoUI from '@/uni_modules/tuniao-ui'
Vue.use(TuniaoUI)
// 引入TuniaoUI提供的vuex简写方法
let vuexStore = require('@/store/$tn.mixin.js')
Vue.mixin(vuexStore)
// 引入TuniaoUI对小程序分享的mixin封装
let mpShare = require('@/uni_modules/tuniao-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)

// 引入vuex
import store from './store/index.js'
// 把vuex定义成全局组件
Vue.prototype.$store = store

//接口和网络
import API from './utils/api.js'
import Net from './utils/net.js'
Vue.prototype.$API = API
Vue.prototype.$Net = Net
// import cuCustom from './colorui/components/cu-custom.vue'
// Vue.component('cu-custom',cuCustom)

//页面类型
//文章为主风格
// import find from './pages/tabPage/find.vue'
// Vue.component('find',find)

// import home from './pages/tabPage/home.vue'
// Vue.component('home',home)

// import square from './pages/tabPage/square.vue'
// Vue.component('square',square)

// import user from './pages/tabPage/user.vue'
// Vue.component('user',user)

//通用
import articleItem from './pages/components/articleItem.vue'
Vue.component('articleItem',articleItem)

import articleItemtop from './pages/components/articleItemtop.vue'
Vue.component('articleItemtop',articleItemtop)

import commentItem from './pages/components/commentItem.vue'
Vue.component('commentItem',commentItem)

import spaceItem from './pages/components/spaceItem.vue'
Vue.component('spaceItem',spaceItem)

import shopItem from './pages/components/shopItem.vue'
Vue.component('shopItem',shopItem)

import Share from './pages/components/Share.vue'
Vue.component('Share',Share)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()

 



