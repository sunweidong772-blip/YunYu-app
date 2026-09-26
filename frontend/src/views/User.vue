<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtNum, timeAgo } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import PostCard from '@/components/PostCard.vue'
import Empty from '@/components/Empty.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const posts = ref([])
const tab = ref('posts')
const following = ref(false)
const loading = ref(true)
const isMe = computed(() => userStore.isLogin && user.value && userStore.userInfo.uid === user.value.uid)

async function load() {
  loading.value = true
  try {
    user.value = await api.userProfile(route.params.id)
    following.value = !!user.value.is_followed
  } catch (e) { toast(e.message) }
  loading.value = false
}

async function loadPosts() {
  try {
    const r = await api.posts(`?user_id=${route.params.id}&page=1&pageSize=20`)
    posts.value = r.list || []
  } catch (e) { /* 静默 */ }
}

function toggleFollow() {
  if (!userStore.isLogin) { router.push('/login'); return }
  const act = following.value ? api.unfollow : api.follow
  act(user.value.uid).then(() => {
    following.value = !following.value
    user.value.follow_count += following.value ? 1 : -1
  }).catch((e) => toast(e.message))
}

onMounted(() => { load(); loadPosts() })
</script>

<template>
  <div class="page page-nofooter">
    <div class="profile-hero">
      <NavBar transparent title="" />
      <div class="ph-inner">
        <Avatar :user="user" size="64" :uid="user && user.uid" />
        <div class="ph-name">{{ user ? user.nickname : '...' }}
          <span class="lv-badge">Lv.{{ user ? user.lv : '-' }}</span>
        </div>
        <div class="ph-bio">{{ (user && user.bio) || '这个人很懒，什么都没写~' }}</div>
        <div class="ph-stats">
          <div class="st"><b>{{ fmtNum(user ? user.like_count : 0) }}</b><span>获赞</span></div>
          <div class="st" @click="router.push('/user/' + route.params.id + '/following')"><b>{{ fmtNum(user ? user.follow_count : 0) }}</b><span>关注</span></div>
          <div class="st" @click="router.push('/user/' + route.params.id + '/followers')"><b>{{ fmtNum(user ? user.follower_count : 0) }}</b><span>粉丝</span></div>
        </div>
        <div class="ph-actions">
          <template v-if="isMe">
            <button class="btn btn-outline btn-sm" @click="router.push('/profile-edit')">编辑资料</button>
          </template>
          <template v-else>
            <button class="btn btn-primary btn-sm" @click="toggleFollow">{{ following ? '已关注' : '关注' }}</button>
            <button class="btn btn-outline btn-sm" @click="router.push('/chat/' + route.params.id)">私信</button>
          </template>
        </div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab" :class="{ on: tab === 'posts' }" @click="tab = 'posts'">帖子</div>
      <div class="tab" :class="{ on: tab === 'info' }" @click="tab = 'info'">资料</div>
    </div>

    <template v-if="tab === 'posts'">
      <PostCard v-for="p in posts" :key="p.id" :post="p" />
      <Empty v-if="!loading && !posts.length" icon="📝" title="还没有发过帖子" desc="快去社区分享吧" />
    </template>

    <div class="container mt3" v-else-if="user">
      <div class="cell"><label>昵称</label><span>{{ user.nickname }}</span></div>
      <div class="cell"><label>UID</label><span>{{ user.uid }}</span></div>
      <div class="cell"><label>等级</label><span>Lv.{{ user.lv }}（EXP {{ user.exp }}）</span></div>
      <div class="cell"><label>签名</label><span>{{ user.bio || '暂无' }}</span></div>
      <div class="cell"><label>加入时间</label><span>{{ timeAgo(user.created_at) }}</span></div>
    </div>

    <div v-if="loading" class="skeleton-line"></div>
  </div>
</template>

<style scoped>
.profile-hero { background: var(--brand-grad); color: #fff; padding-bottom: 20px; }
.ph-inner { display: flex; flex-direction: column; align-items: center; padding: 0 20px; }
.ph-name { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: var(--fs-20); font-weight: 800; }
.lv-badge { font-size: var(--fs-10); background: rgba(255,255,255,.25); padding: 2px 8px; border-radius: var(--r-full); font-weight: 600; }
.ph-bio { margin-top: 6px; font-size: var(--fs-12); opacity: .9; }
.ph-stats { display: flex; gap: 26px; margin-top: 16px; }
.st { text-align: center; }
.st b { display: block; font-size: var(--fs-18); font-weight: 800; }
.st span { font-size: var(--fs-11); opacity: .85; }
.ph-actions { display: flex; gap: 10px; margin-top: 16px; }
.ph-actions .btn.btn-outline { background: rgba(255,255,255,.2); color: #fff; border: none; }
.tabs { display: flex; border-bottom: 1px solid var(--line); background: var(--card); position: sticky; top: 0; z-index: 5; }
.tab { flex: 1; text-align: center; padding: 12px 0; font-size: var(--fs-14); color: var(--text-3); }
.tab.on { color: var(--brand); font-weight: 700; box-shadow: inset 0 -2px 0 var(--brand); }
.cell { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: var(--fs-14); }
.cell label { color: var(--text-3); }
</style>