<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'
import Avatar from '@/components/Avatar.vue'
import Empty from '@/components/Empty.vue'
import { timeAgo, levelName, fmtNum } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref(null)
const comments = ref([])
const liked = ref(false)
const favorited = ref(false)
const commentText = ref('')
const replyTo = ref(null)
const subCommentText = ref('')
const loading = ref(true)
const commentLoading = ref(false)
const showReport = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await api.postDetail(route.params.id)
    post.value = data
    liked.value = !!data.liked
    favorited.value = !!data.favorited
    updateSEOTitle()
    await loadComments()
  } catch (e) {
    toast(e.message)
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const r = await api.postComments(route.params.id)
    comments.value = r.list || []
  } catch (e) { /* 静默 */ }
}

async function toggleLike() {
  if (!userStore.token) return router.push('/login')
  try {
    if (liked.value) {
      await api.postUnlike(route.params.id)
      liked.value = false
      post.value.like_count = Math.max(0, post.value.like_count - 1)
    } else {
      await api.postLike(route.params.id)
      liked.value = true
      post.value.like_count++
      toast('点赞成功')
    }
  } catch (e) { toast(e.message) }
}

async function toggleFav() {
  if (!userStore.token) return router.push('/login')
  try {
    if (favorited.value) {
      await api.postUnfavorite(route.params.id)
      favorited.value = false
      post.value.favorite_count = Math.max(0, post.value.favorite_count - 1)
    } else {
      await api.postFavorite(route.params.id)
      favorited.value = true
      post.value.favorite_count++
      toast('收藏成功')
    }
  } catch (e) { toast(e.message) }
}

async function submitComment() {
  if (!userStore.token) return router.push('/login')
  if (!commentText.value.trim()) return toast('评论内容不能为空')
  commentLoading.value = true
  try {
    await api.postComment(route.params.id, { content: commentText.value.trim() })
    commentText.value = ''
    toast('评论成功')
    await loadComments()
    post.value.comment_count++
  } catch (e) {
    toast(e.message)
  } finally {
    commentLoading.value = false
  }
}

async function submitSubComment(c) {
  if (!userStore.token) return router.push('/login')
  if (!subCommentText.value.trim()) return toast('回复内容不能为空')
  try {
    await api.postComment(route.params.id, { content: subCommentText.value.trim(), parent_id: c.id })
    subCommentText.value = ''
    toast('回复成功')
    await loadComments()
  } catch (e) {
    toast(e.message)
  }
}

async function likeComment(c) {
  if (!userStore.token) return router.push('/login')
  try {
    if (c.liked) {
      await api.commentUnlike(c.id)
      c.liked = false
      c.like_count = Math.max(0, c.like_count - 1)
    } else {
      await api.commentLike(c.id)
      c.liked = true
      c.like_count++
    }
  } catch (e) { /* 静默 */ }
}

async function deletePost() {
  if (!userStore.token) return router.push('/login')
  try {
    await api.postDelete(route.params.id)
    toast('帖子已删除')
    router.back()
  } catch (e) { toast(e.message) }
}

async function reportPost(reason) {
  if (!userStore.token) return router.push('/login')
  try {
    await api.postReport(route.params.id, { reason })
    toast('举报已提交，感谢反馈')
    showReport.value = false
  } catch (e) { toast(e.message) }
}

function confirmDelete() {
  if (confirm('确认删除这篇帖子吗？')) deletePost()
}

function updateSEOTitle() {
  if (post.value) {
    document.title = `${post.value.title} | 云屿社区`
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = `${post.value.title} | 云屿社区`
  }
}

onMounted(load)
</script>

<template>
  <div class="page page-nofooter">
    <NavBar title="帖子详情" :right="post && ('#' + post.id)" />

    <div v-if="loading" class="container mt4">
      <div class="skeleton" style="height:80px;border-radius:14px"></div>
      <div class="skeleton" style="height:150px;margin-top:12px;border-radius:14px"></div>
      <div class="skeleton" style="height:50px;margin-top:12px;border-radius:14px"></div>
    </div>

    <template v-else-if="post">
      <!-- 作者 -->
      <div class="author-bar container">
        <Avatar :name="post.nickname" :src="post.avatar" size="m" />
        <div class="grow" style="min-width:0">
          <div class="flex">
            <span class="semi">{{ post.nickname }}</span>
            <span class="lv-badge" v-if="post.lv">LV{{ post.lv }}</span>
            <span class="badge badge-success" v-if="post.is_official">官方</span>
          </div>
          <span class="time-text">{{ timeAgo(post.created_at) }}</span>
        </div>
        <button class="btn btn-outline btn-sm" @click="router.push('/user/' + post.user_id)">主页</button>
      </div>

      <!-- 内容 -->
      <div class="post-body container">
        <h1>{{ post.title }}</h1>
        <div class="tags" v-if="post.topic_name">
          <span class="badge" @click="router.push('/topic/' + post.topic_id)">{{ post.topic_name }}</span>
        </div>
        <div class="rich-content mt3">{{ post.content }}</div>
        <div class="imgs" v-if="post.images && post.images.length">
          <img v-for="(img, i) in post.images" :key="i" :src="img" class="pimg" loading="lazy" />
        </div>
      </div>

      <!-- 互动 -->
      <div class="stats-row container">
        <span>👍 {{ fmtNum(post.like_count) }}</span>
        <span>💬 {{ fmtNum(post.comment_count) }}</span>
        <span>⭐ {{ fmtNum(post.favorite_count) }}</span>
      </div>

      <div class="post-actions container">
        <button class="pa" :class="{ on: liked }" @click="toggleLike">
          <svg viewBox="0 0 24 24" :fill="liked ? '#ef5350' : 'none'" stroke="#ef5350" stroke-width="1.8"><path d="M7 10v11H4V10h3zm13-1v12h-10V9l1.5-6h3l-1 6h6.5z" stroke-linejoin="round"/></svg>
          <span>{{ liked ? '已赞' : '点赞' }}</span>
        </button>
        <button class="pa" :class="{ on: favorited }" @click="toggleFav">
          <svg viewBox="0 0 24 24" :fill="favorited ? '#f5a623' : 'none'" stroke="#f5a623" stroke-width="1.8"><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6L12 17l-5.4 2.6 1-6L3.3 9.4l6-.9L12 3z" stroke-linejoin="round"/></svg>
          <span>{{ favorited ? '已收藏' : '收藏' }}</span>
        </button>
        <button class="pa" @click="showReport = true"><span>🚩</span>举报</button>
      </div>

      <!-- 评论 -->
      <div class="section-title container" style="margin-top:20px">
        <h3>评论 ({{ post.comment_count }})</h3>
      </div>

      <div class="comment-input container">
        <div class="field field-area">
          <textarea v-model="commentText" placeholder="说点什么…" maxlength="500"></textarea>
        </div>
        <button class="btn btn-primary btn-sm" style="align-self:flex-end" :disabled="commentLoading" @click="submitComment">发布评论</button>
      </div>

      <div class="comments container">
        <div class="cmt card" v-for="(c, idx) in comments" :key="c.id">
          <div class="cmt-head">
            <Avatar :name="c.nickname" :src="c.avatar" size="s" />
            <div class="grow" style="min-width:0">
              <div class="flex">
                <span class="semi" style="font-size:13px">{{ c.nickname }}</span>
                <span class="lv-badge mini" v-if="c.lv">LV{{ c.lv }}</span>
                <span class="floor-badge">{{ idx + 1 }}楼</span>
              </div>
              <span class="time-text">{{ timeAgo(c.created_at) }}</span>
            </div>
            <button class="cmt-like" @click="likeComment(c)">{{ c.like_count > 0 ? c.like_count : '' }} 👍</button>
          </div>
          <div class="cmt-reply-to" v-if="c.parent_id">回复 @{{ c.reply_to_nickname || '某人' }}</div>
          <div class="cmt-body">{{ c.content }}</div>
          <button class="cmt-reply" @click="replyTo = c">回复</button>

          <div class="cmt-subs" v-if="c.replies && c.replies.length">
            <div class="cmt-sub" v-for="r in c.replies" :key="r.id">
              <span class="semi">{{ r.nickname }}</span>
              <span class="t3">回复</span>
              <span class="semi">{{ r.reply_to_nickname || r.parent_nickname || '' }}</span>：{{ r.content }}
              <button class="cmt-sub-like" @click="likeComment(r)">{{ r.like_count > 0 ? r.like_count : '' }} 👍</button>
            </div>
          </div>
          <div class="sub-reply" v-if="replyTo && replyTo.id === c.id">
            <input v-model="subCommentText" class="sub-input" :placeholder="'回复 ' + c.nickname + '…'" maxlength="300" @keyup.enter="submitSubComment(c)" />
          </div>
        </div>
        <Empty v-if="!comments.length" icon="💬" title="还没有评论" desc="来抢沙发吧" />
      </div>

      <button v-if="userStore.token && userStore.profile && post.user_id === userStore.profile.id" class="btn btn-outline btn-sm del-post" @click="confirmDelete">删除我的帖子</button>
    </template>

    <!-- 举报 sheet -->
    <template v-if="showReport">
      <div class="sheet-mask" @click="showReport = false"></div>
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">举报理由</div>
        <button class="sheet-item" @click="reportPost('广告或垃圾信息')">🚫 广告或垃圾信息</button>
        <button class="sheet-item" @click="reportPost('人身攻击')">😡 人身攻击</button>
        <button class="sheet-item" @click="reportPost('色情低俗')">🔞 色情低俗</button>
        <button class="sheet-item" @click="reportPost('违法违规')">⚖️ 违法违规</button>
        <button class="sheet-item" @click="reportPost('其他原因')">📌 其他原因</button>
        <button class="sheet-item" @click="showReport = false">取消</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.author-bar { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.lv-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 7px; border-radius: var(--r-full); background: var(--brand-soft); color: var(--brand); font-size: var(--fs-10); font-weight: 600; margin-left: 6px; }
.lv-badge.mini { height: 16px; font-size: var(--fs-10); }
.post-body { margin-top: 14px; }
.post-body h1 { font-size: var(--fs-20); font-weight: 800; line-height: 1.45; }
.tags { margin-top: 10px; }
.imgs { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.pimg { width: 100%; border-radius: var(--r-md); }
.stats-row { display: flex; gap: 18px; margin-top: 16px; font-size: var(--fs-13); color: var(--text-2); }
.post-actions { display: flex; justify-content: space-around; margin-top: 14px; padding: 10px 0; background: var(--card); border-radius: var(--r-md); }
.pa { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: var(--fs-12); color: var(--text-2); }
.pa.on { color: #ef5350; }
.pa svg { width: 22px; height: 22px; }
.comment-input { display: flex; align-items: flex-end; gap: 10px; margin-top: 6px; }
.comment-input .field { flex: 1; }
.cmt { padding: 13px 15px; margin-bottom: 10px; }
.cmt-head { display: flex; align-items: center; gap: 10px; }
.cmt-body { margin-top: 8px; font-size: var(--fs-14); line-height: 1.6; color: var(--text-1); }
.cmt-like { font-size: var(--fs-12); color: var(--text-3); }
.cmt-reply { margin-top: 6px; font-size: var(--fs-12); color: var(--brand); }
.cmt-subs { margin-top: 8px; padding: 8px 10px; background: var(--card-2); border-radius: var(--r-sm); }
.cmt-sub { position: relative; font-size: var(--fs-13); color: var(--text-2); padding: 4px 40px 4px 0; line-height: 1.5; }
.cmt-sub-like { position: absolute; right: 0; top: 4px; font-size: var(--fs-11); color: var(--text-3); }
.sub-reply { margin-top: 8px; display: flex; }
.sub-input { flex: 1; height: 36px; padding: 0 12px; background: var(--card-2); border-radius: var(--r-full); font-size: var(--fs-13); }
.del-post { margin: 20px 16px; width: calc(100% - 32px); }
.floor-badge { display: inline-flex; align-items: center; height: 16px; padding: 0 6px; border-radius: var(--r-sm); background: var(--card-2); color: var(--text-3); font-size: var(--fs-10); font-weight: 600; margin-left: 6px; }
.cmt-reply-to { margin-top: 6px; font-size: var(--fs-12); color: var(--brand); font-weight: 500; }
</style>