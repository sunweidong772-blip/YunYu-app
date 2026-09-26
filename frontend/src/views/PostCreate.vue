<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import { toast } from '@/utils/ui'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.name === 'post-edit')

const form = reactive({ title: '', content: '', topic_id: null, images: [] })
const topics = ref([])
const submitting = ref(false)

async function loadTopics() {
  try { topics.value = await api.topics() } catch (e) { /* 静默 */ }
}

async function loadPost() {
  if (!isEdit.value) return
  try {
    const p = await api.postDetail(route.params.id)
    form.title = p.title
    form.content = p.content
    form.topic_id = p.topic_id
    form.images = p.images || []
  } catch (e) { toast(e.message) }
}

function pickImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png,image/gif,image/webp'
  input.onchange = () => {
    const file = input.files && input.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) return toast('图片不能超过 3MB')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const r = await api.upload(reader.result)
        form.images.push(r.url)
        toast('图片已上传')
      } catch (e) {
        toast(e.message || '图片上传失败')
      }
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

async function submit() {
  if (!form.title.trim()) return toast('请输入标题')
  if (!form.content.trim()) return toast('请输入正文')
  submitting.value = true
  try {
    const body = { title: form.title.trim(), content: form.content, topic_id: form.topic_id, images: form.images }
    if (isEdit.value) {
      await api.postUpdate(route.params.id, body)
      toast('帖子已更新')
      router.replace('/post/' + route.params.id)
    } else {
      const r = await api.postCreate(body)
      toast('发布成功！已获得积分奖励')
      router.replace('/post/' + r.id)
    }
  } catch (e) {
    toast(e.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadTopics(); loadPost() })
</script>

<template>
  <div class="page page-nofooter">
    <NavBar :title="isEdit ? '编辑帖子' : '发布帖子'" :back="isEdit" />

    <div class="container mt3">
      <div class="field">
        <input v-model="form.title" placeholder="标题（10-60 字）" maxlength="60" />
      </div>

      <div class="field field-area mt3">
        <textarea v-model="form.content" placeholder="分享你的想法、经验或问题…" maxlength="2000"></textarea>
      </div>

      <div class="topic-label mt3" v-if="topics.length">选择话题</div>
      <div class="topic-scroll mt2">
        <button
          v-for="t in topics"
          :key="t.id"
          class="topic-chip"
          :class="{ active: form.topic_id === t.id }"
          @click="form.topic_id = form.topic_id === t.id ? null : t.id"
        >
          {{ t.icon || '💬' }} {{ t.name }}
        </button>
      </div>

      <div class="img-label mt4">图片（{{ form.images.length }}/9）</div>
      <div class="img-grid mt2" v-if="form.images.length">
        <div v-for="(img, i) in form.images" :key="i" class="img-cell">
          <img :src="img" loading="lazy" />
          <button class="img-del" @click="form.images.splice(i, 1)">✕</button>
        </div>
      </div>
      <button class="btn btn-outline btn-sm mt2" @click="pickImage" v-if="form.images.length < 9">+ 添加图片</button>

      <button class="btn btn-primary btn-block mt5" :disabled="submitting" @click="submit">
        {{ submitting ? '发布中…' : (isEdit ? '保存修改' : '发布') }}
      </button>
      <p class="tip mt2">发布新帖可获得 +15 EXP 成长值</p>
    </div>
  </div>
</template>

<style scoped>
.field-area textarea { min-height: 140px; }
.topic-label, .img-label { font-size: var(--fs-14); font-weight: 600; color: var(--text-1); }
.topic-scroll { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.topic-scroll::-webkit-scrollbar { display: none; }
.topic-chip { flex-shrink: 0; height: 34px; padding: 0 14px; border-radius: var(--r-full); background: var(--card); border: 1px solid var(--divider); color: var(--text-2); font-size: var(--fs-13); }
.topic-chip.active { background: var(--brand); color: #fff; border-color: var(--brand); }
.img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.img-cell { position: relative; aspect-ratio: 1; }
.img-cell img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--r-sm); }
.img-del { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; line-height: 1; }
.tip { text-align: center; font-size: var(--fs-12); color: var(--text-3); }
</style>