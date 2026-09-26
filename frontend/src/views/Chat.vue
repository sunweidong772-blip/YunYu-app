<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import { fmtTime } from '@/utils/format'
import Avatar from '@/components/Avatar.vue'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const userStore = useUserStore()

const me = ref(userStore.userInfo)
const other = ref(null)
const list = ref([])
const text = ref('')
const sending = ref(false)
const scrollEl = ref(null)

async function load() {
  try {
    const otherId = route.params.id
    const [msgs, profile] = await Promise.all([
      api.messages(otherId),
      api.userProfile(otherId).catch(() => null),
    ])
    list.value = msgs || []
    other.value = profile
  } catch (e) { toast(e.message) }
  scrollBottom()
}

function scrollBottom() {
  nextTick(() => { if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight })
}

async function send() {
  const content = text.value.trim()
  if (!content || sending.value) return
  sending.value = true
  try {
    await api.sendMessage({ to: route.params.id, content })
    list.value.push({ id: Date.now(), sender_id: 0, content, created_at: new Date().toISOString() })
    text.value = ''
    scrollBottom()
  } catch (e) { toast(e.message) } finally { sending.value = false }
}

onMounted(load)
</script>

<template>
  <div class="page chat-page">
    <NavBar :title="(other && other.nickname) || '私信'" showBack />

    <div class="chat-scroll" ref="scrollEl">
      <div class="chat-empty" v-if="!list.length">和对方打个招呼吧～</div>
      <div class="msg-row" v-for="m in list" :key="m.id" :class="{ mine: m.sender_id !== Number(route.params.id) }">
        <div class="bubble">
          <div class="b-text">{{ m.content }}</div>
          <div class="b-time">{{ fmtTime(m.created_at) }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input v-model="text" class="input" placeholder="说点什么…" @keyup.enter="send" maxlength="1000" />
      <button class="btn btn-primary" :disabled="sending || !text.trim()" @click="send">发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat-page { display: flex; flex-direction: column; }
.chat-scroll { flex: 1; overflow-y: auto; padding: 14px 16px; }
.chat-empty { text-align: center; color: var(--text-3); font-size: var(--fs-13); margin-top: 60px; }
.msg-row { display: flex; margin-bottom: 12px; justify-content: flex-start; }
.msg-row.mine { justify-content: flex-end; }
.bubble { max-width: 76%; padding: 10px 13px; border-radius: 16px; background: var(--card-2); box-shadow: var(--shadow-sm); }
.msg-row.mine .bubble { background: var(--brand); color: #fff; border-bottom-right-radius: 4px; }
.msg-row:not(.mine) .bubble { border-bottom-left-radius: 4px; }
.b-text { font-size: var(--fs-14); line-height: 1.6; word-break: break-word; }
.b-time { font-size: var(--fs-10); opacity: .6; margin-top: 4px; }
.chat-input { display: flex; gap: 10px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom)); background: var(--card); border-top: 1px solid var(--line); }
.chat-input .input { flex: 1; border-radius: var(--r-full); padding: 10px 16px; }
</style>