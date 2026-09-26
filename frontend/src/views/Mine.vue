<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import Avatar from '@/components/Avatar.vue'
import { expProgress, levelName, fmtNum } from '@/utils/format'

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
    <!-- ===== 用户信息卡片 ===== -->
    <div class="profile-card">
      <div class="profile-bg"></div>
      <div class="profile-content">
        <div class="profile-top">
          <Avatar :name="me ? me.nickname : '云'" :src="me ? me.avatar : ''" size="xl" />
          <div class="profile-info">
            <div class="profile-name-row">
              <span class="profile-name">{{ me ? me.nickname : '未登录' }}</span>
              <span class="profile-lv" v-if="me" @click="router.push('/level')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                LV{{ me.lv }}
              </span>
            </div>
            <p class="profile-bio">{{ me ? (me.bio || '这个人很懒，还没有写签名~') : '登录后开启云屿之旅' }}</p>
            <div class="exp-track" v-if="me">
              <div class="exp-fill" :style="{ width: pd.pct + '%' }"></div>
              <span class="exp-label">{{ me.exp }} / {{ pd.need }} EXP · {{ pd.nextName }}</span>
            </div>
          </div>
        </div>

        <!-- 统计区 -->
        <div class="profile-stats" v-if="userStore.token">
          <div class="stat-item" @click="router.push('/user/' + me.id)">
            <div class="stat-num">{{ fmtNum(me.like_count) }}</div>
            <div class="stat-label">获赞</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push('/user/' + me.id + '/following')">
            <div class="stat-num">{{ fmtNum(me.followCount) }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push('/user/' + me.id + '/followers')">
            <div class="stat-num">{{ fmtNum(me.followerCount) }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push('/my/posts')">
            <div class="stat-num">{{ fmtNum(me.post_count) }}</div>
            <div class="stat-label">帖子</div>
          </div>
        </div>

        <!-- 未登录按钮 -->
        <div class="profile-auth" v-if="!userStore.token">
          <button class="btn btn-primary" @click="router.push('/login')">登录账号</button>
          <button class="btn btn-ghost" @click="router.push('/register')">注册新账号</button>
        </div>
      </div>
    </div>

    <!-- ===== 快捷功能区 ===== -->
    <div class="quick-actions" v-if="userStore.token">
      <div class="qa-item" @click="doCheckin">
        <div class="qa-icon" :class="{ done: userStore.checkedToday }" style="background:var(--success-soft);color:var(--success)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <span>{{ userStore.checkedToday ? '已签到' : '签到' }}</span>
      </div>
      <div class="qa-item" @click="router.push('/tasks')">
        <div class="qa-icon" style="background:var(--info-soft);color:var(--info)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span>任务</span>
      </div>
      <div class="qa-item" @click="router.push('/level')">
        <div class="qa-icon" style="background:var(--warning-soft);color:var(--warning)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span>等级</span>
      </div>
      <div class="qa-item" @click="router.push('/my/favorites')">
        <div class="qa-icon" style="background:var(--danger-soft);color:var(--danger)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        <span>收藏</span>
      </div>
    </div>

    <!-- ===== 功能列表 ===== -->
    <div class="menu-group" v-if="userStore.token">
      <div class="menu-header">内容管理</div>
      <div class="menu-list">
        <div class="menu-item" @click="router.push('/my/posts')">
          <div class="menu-icon" style="background:var(--info-soft);color:var(--info)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <span class="menu-label">我的帖子</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div class="menu-item" @click="router.push('/my/comments')">
          <div class="menu-icon" style="background:var(--success-soft);color:var(--success)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <span class="menu-label">我的评论</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div class="menu-item" @click="router.push('/my/favorites')">
          <div class="menu-icon" style="background:var(--danger-soft);color:var(--danger)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <span class="menu-label">我的收藏</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>

    <div class="menu-group">
      <div class="menu-header">设置与帮助</div>
      <div class="menu-list">
        <div class="menu-item" @click="router.push('/settings')">
          <div class="menu-icon" style="background:var(--bg-elev);color:var(--text-2)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.17 15 1.65 1.65 0 003 13.83V13a2 2 0 012-2h.09A1.65 1.65 0 006.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 0010.6 4.8 1.65 1.65 0 0011 3V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2v.09a1.65 1.65 0 00-.33 1.82z"/></svg>
          </div>
          <span class="menu-label">设置</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div class="menu-item" @click="router.push('/announcements')">
          <div class="menu-icon" style="background:var(--bg-elev);color:var(--text-2)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
          <span class="menu-label">公告</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <div class="menu-item" @click="router.push('/about')">
          <div class="menu-icon" style="background:var(--bg-elev);color:var(--text-2)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </div>
          <span class="menu-label">关于云屿</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>

    <!-- ===== 管理员入口 ===== -->
    <div class="menu-group" v-if="userStore.isAdmin">
      <div class="menu-header">管理员</div>
      <div class="menu-list">
        <div class="menu-item admin-item" @click="router.push('/admin')">
          <div class="menu-icon" style="background:var(--brand-grad);color:#fff">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span class="menu-label" style="color:var(--brand);font-weight:600">云屿管理中心</span>
          <span class="menu-badge" v-if="userStore.admin">{{ userStore.admin.roleName }}</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>

    <!-- ===== 退出登录 ===== -->
    <button v-if="userStore.token" class="logout-btn" @click="logout">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      退出登录
    </button>

    <div style="height:32px"></div>
  </div>
</template>

<style scoped>
/* ===== 用户信息卡片 ===== */
.profile-card {
  position: relative;
  margin: 12px 16px 0;
  border-radius: var(--r-lg);
  background: var(--brand-grad);
  color: #fff;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}
.profile-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 10%, rgba(255,255,255,0.15) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 35%);
}
.profile-content {
  position: relative;
  padding: 20px;
}
.profile-top {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.profile-info {
  flex: 1;
  min-width: 0;
}
.profile-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.profile-name {
  font-size: 18px;
  font-weight: 700;
}
.profile-lv {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--r-full);
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.profile-bio {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
  margin-bottom: 10px;
}
.exp-track {
  position: relative;
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.2);
  margin-top: 8px;
}
.exp-fill {
  height: 100%;
  border-radius: 3px;
  background: #fff;
  transition: width 0.5s ease;
}
.exp-label {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 10px;
  opacity: 0.8;
}

/* ===== 统计 ===== */
.profile-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}
.stat-num {
  font-size: 18px;
  font-weight: 700;
}
.stat-label {
  font-size: 11px;
  opacity: 0.75;
}
.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.15);
}

/* ===== 未登录 ===== */
.profile-auth {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.profile-auth .btn {
  flex: 1;
  height: 40px;
  font-size: 14px;
}
.profile-auth .btn-primary {
  background: #fff;
  color: var(--brand);
  box-shadow: none;
}
.profile-auth .btn-ghost {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.25);
}

/* ===== 快捷功能 ===== */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px 12px 6px;
}
.qa-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 8px;
}
.qa-item:active { transform: scale(0.95); }
.qa-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}
.qa-icon.done {
  opacity: 0.5;
}
.qa-item span {
  font-size: 12px;
  color: var(--text-2);
  font-weight: 500;
}

/* ===== 菜单组 ===== */
.menu-group {
  margin: 12px 16px 0;
}
.menu-header {
  font-size: 13px;
  color: var(--text-3);
  font-weight: 500;
  padding: 8px 4px 6px;
}
.menu-list {
  background: var(--card);
  border: 1px solid var(--divider);
  border-radius: var(--r-md);
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.menu-item:active { background: var(--bg-elev); }
.menu-item + .menu-item {
  border-top: 1px solid var(--divider);
}
.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  font-size: 15px;
  color: var(--text-1);
  font-weight: 500;
}
.menu-arrow {
  color: var(--text-3);
  flex-shrink: 0;
}
.menu-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--r-full);
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 500;
}
.admin-item .menu-icon {
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}

/* ===== 退出登录 ===== */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 32px);
  margin: 16px 16px 0;
  padding: 13px 0;
  border-radius: var(--r-md);
  background: var(--card);
  border: 1px solid var(--divider);
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.logout-btn:active {
  background: var(--bg-elev);
  transform: scale(0.98);
}
</style>
