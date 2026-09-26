<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import Avatar from '@/components/Avatar.vue'
import { expProgress, levelName, fmtNum, timeAgo } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const me = ref(null)
const pd = ref({ pct: 0, cur: 0, need: 1, nextName: '' })

async function load() {
  try {
    await userStore.fetchMe()
    me.value = userStore.profile
    if (me.value) pd.value = expProgress(me.value.lv, me.value.exp)
  } catch (e) { toast(e.message) }
}

async function doCheckin() {
  if (!userStore.token) return router.push('/login')
  try {
    const r = await api.checkin()
    toast(r.message || '签到成功')
    userStore.setCheckedToday(true)
    await userStore.fetchMe()
    me.value = userStore.profile
    if (me.value) pd.value = expProgress(me.value.lv, me.value.exp)
  } catch (e) {
    toast(e.message)
  }
}

async function logout() {
  userStore.clear()
  router.replace('/home')
}

onMounted(load)
</script>

<template>
  <div class="page">
    <!-- 用户身份卡片 -->
    <div class="profile-hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <Avatar :name="me ? me.nickname : '云'" :src="me ? me.avatar : ''" size="xl" />
        <div class="hero-info grow">
          <div class="hero-name">
            <span class="semi">{{ me ? me.nickname : '未登录' }}</span>
            <span class="lv-badge" v-if="me" @click="router.push('/level')">LV{{ me.lv }} {{ levelName(me.lv) }}</span>
          </div>
          <div class="hero-bio ellipsis">{{ me ? (me.bio || '这个人很懒，还没有写签名~') : '登录后开启云屿之旅' }}</div>
          <div class="exp-bar" v-if="me">
            <div class="exp-inner" :style="{ width: pd.pct + '%' }"></div>
            <span class="exp-text">{{ me.exp }} / {{ pd.need }} EXP</span>
          </div>
        </div>
      </div>
      <div class="hero-stats">
        <div v-if="!userStore.token">
          <button class="btn btn-primary btn-sm" @click="router.push('/login')">登录</button>
          <button class="btn btn-outline btn-sm" @click="router.push('/register')" style="margin-left:8px">注册</button>
        </div>
        <div v-else class="stats-row">
          <div class="stat" @click="router.push('/user/' + me.id)"><b>{{ fmtNum(me.like_count) }}</b><span>获赞</span></div>
          <div class="stat" @click="router.push('/user/' + me.id + '/following')"><b>{{ fmtNum(me.followCount) }}</b><span>关注</span></div>
          <div class="stat" @click="router.push('/user/' + me.id + '/followers')"><b>{{ fmtNum(me.followerCount) }}</b><span>粉丝</span></div>
          <div class="stat" @click="router.push('/my/posts')"><b>{{ fmtNum(me.post_count) }}</b><span>帖子</span></div>
        </div>
      </div>
    </div>

    <!-- 快捷功能区 -->
    <div class="action-grid container" v-if="userStore.token">
      <div class="act" @click="router.push('/checkin')">
        <span class="act-icon chk">✅</span><em>签到</em>
        <i class="check-dot" v-if="userStore.checkedToday"></i>
      </div>
      <div class="act" @click="router.push('/tasks')"><span class="act-icon tsk">📋</span><em>任务</em></div>
      <div class="act" @click="router.push('/level')"><span class="act-icon lv">🏆</span><em>等级</em></div>
      <div class="act" @click="router.push('/my/favorites')"><span class="act-icon fav">⭐</span><em>收藏</em></div>
      <div class="act" @click="router.push('/invite')"><span class="act-icon inv">🎁</span><em>邀请</em></div>
    </div>

    <!-- 列表 -->
    <div class="cell-list mt3" v-if="userStore.token">
      <div class="cell" @click="router.push('/my/posts')">
        <span class="cell-icon" style="background:var(--info-soft)">📝</span>
        <span class="cell-label">我的帖子</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/my/comments')">
        <span class="cell-icon" style="background:var(--success-soft)">💬</span>
        <span class="cell-label">我的评论</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/my/favorites')">
        <span class="cell-icon" style="background:var(--warning-soft)">⭐</span>
        <span class="cell-label">我的收藏</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/user/' + (me ? me.id : 0) + '/following')">
        <span class="cell-icon" style="background:var(--danger-soft)">👥</span>
        <span class="cell-label">我的关注</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/user/' + (me ? me.id : 0) + '/followers')">
        <span class="cell-icon" style="background:var(--accent-soft)">🧑‍🤝‍🧑</span>
        <span class="cell-label">我的粉丝</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/profile-edit')">
        <span class="cell-icon" style="background:var(--brand-soft)">✏️</span>
        <span class="cell-label">编辑资料</span>
        <span class="cell-arrow">›</span>
      </div>
    </div>

    <div class="cell-list mt3">
      <div class="cell" @click="router.push('/settings')">
        <span class="cell-icon" style="background:var(--card-2)">⚙️</span>
        <span class="cell-label">设置</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/announcements')">
        <span class="cell-icon" style="background:var(--card-2)">📢</span>
        <span class="cell-label">公告</span>
        <span class="cell-arrow">›</span>
      </div>
      <div class="cell" @click="router.push('/about')">
        <span class="cell-icon" style="background:var(--card-2)">ℹ️</span>
        <span class="cell-label">关于云屿</span>
        <span class="cell-arrow">›</span>
      </div>
      <!-- 管理员专属入口 -->
      <div class="cell" v-if="userStore.isAdmin" @click="router.push('/admin')">
        <span class="cell-icon" style="background:var(--brand-grad); color:#fff">🏛️</span>
        <span class="cell-label" style="color:var(--brand); font-weight:600">云屿管理中心</span>
        <span class="cell-value" v-if="userStore.admin">{{ userStore.admin.roleName }}</span>
        <span class="cell-arrow">›</span>
      </div>
    </div>

    <button v-if="userStore.token" class="btn btn-outline btn-block" style="margin:20px 16px; width:calc(100% - 32px)" @click="logout">退出登录</button>
  </div>
</template>

<style scoped>
.profile-hero { background: var(--brand-grad); padding: 24px 16px 16px; color: #fff; position: relative; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.22), transparent 55%); }
.hero-content { position: relative; display: flex; gap: 14px; align-items: flex-start; }
.hero-info { min-width: 0; }
.hero-name { display: flex; align-items: center; gap: 8px; font-size: var(--fs-18); }
.lv-badge { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: var(--r-full); background: rgba(255,255,255,.22); border: 1px solid rgba(255,255,255,.35); font-size: var(--fs-11); font-weight: 600; }
.hero-bio { font-size: var(--fs-12); opacity: .9; margin-top: 6px; }
.exp-bar { position: relative; height: 8px; border-radius: 4px; background: rgba(255,255,255,.25); margin-top: 10px; overflow: visible; }
.exp-inner { height: 100%; border-radius: 4px; background: #fff; transition: width .5s ease; }
.exp-text { position: absolute; right: 4px; top: -16px; font-size: var(--fs-10); opacity: .85; }
.hero-stats { position: relative; margin-top: 18px; }
.stats-row { display: flex; justify-content: space-between; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat b { font-size: var(--fs-16); }
.stat span { font-size: var(--fs-11); opacity: .85; }

.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
.act { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.act em { font-style: normal; font-size: var(--fs-12); color: var(--text-2); }
.act-icon { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 15px; font-size: 21px; }
.chk { background: var(--success-soft); } .tsk { background: var(--info-soft); } .lv { background: var(--warning-soft); } .fav { background: var(--danger-soft); }
.check-dot { position: absolute; top: -2px; right: 12px; width: 9px; height: 9px; border-radius: 50%; background: var(--success); border: 2px solid var(--card); }
.cell-list { margin: 0 16px; border-radius: var(--r-md); overflow: hidden; }
.cell { background: var(--card); }
.cell-list .cell { margin: 0; border-radius: 0; }
.cell-list { box-shadow: var(--shadow-sm); }
</style>