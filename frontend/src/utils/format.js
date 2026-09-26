// 通用工具：时间格式化、等级信息、头像首字
export function timeAgo(iso) {
  if (!iso) return ''
  const t = new Date(iso.replace(' ', 'T'))
  if (isNaN(t.getTime())) return iso
  const diff = Date.now() - t.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} 天前`
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  return y === new Date().getFullYear() ? `${m}-${day}` : `${y}-${m}-${day}`
}

export function fmtDate(iso) {
  if (!iso) return ''
  const t = new Date(iso.replace(' ', 'T'))
  if (isNaN(t.getTime())) return iso
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fmtDateTime(iso) {
  if (!iso) return ''
  const t = new Date(iso.replace(' ', 'T'))
  if (isNaN(t.getTime())) return iso
  const p = (n) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`
}

export function fmtTime(iso) {
  if (!iso) return ''
  const t = new Date(iso.replace(' ', 'T'))
  if (isNaN(t.getTime())) return iso
  const p = (n) => String(n).padStart(2, '0')
  const now = new Date()
  if (t.toDateString() === now.toDateString()) return `${p(t.getHours())}:${p(t.getMinutes())}`
  return fmtDateTime(iso)
}

export function fmtNum(n) {
  n = Number(n || 0)
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export const LEVELS = [
  { lv: 1, name: '新人', exp: 0 },
  { lv: 2, name: '初来乍到', exp: 50 },
  { lv: 3, name: '云屿居民', exp: 150 },
  { lv: 4, name: '活跃居民', exp: 300 },
  { lv: 5, name: '热心用户', exp: 500 },
  { lv: 6, name: '云屿达人', exp: 800 },
  { lv: 7, name: '资深居民', exp: 1250 },
  { lv: 8, name: '云屿精英', exp: 1900 },
  { lv: 9, name: '云屿核心', exp: 2800 },
  { lv: 10, name: '云屿元老', exp: 4000 },
]

// 由后端计算的等级为准；本地仅用于兜底展示
export function levelName(lv) {
  const row = LEVELS.find((x) => x.lv === lv)
  return row ? row.name : '云屿居民'
}

export function expProgress(lv, exp) {
  const cur = LEVELS.find((x) => x.lv === lv) || LEVELS[LEVELS.length - 1]
  const next = LEVELS.find((x) => x.lv === lv + 1)
  if (!next) return { cur: 0, need: 1, pct: 100, nextName: 'MAX' }
  const base = cur.exp
  const need = next.exp - base
  const got = Math.max(0, Math.min(need, exp - base))
  return { cur: exp, need, pct: Math.round((got / need) * 100), nextName: next.name, nextLv: next.lv }
}

export function avatarText(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

export function avatarColor(name) {
  const colors = ['#2f8cff', '#34d0a3', '#f5a623', '#ef5350', '#9b6bff', '#3b82f6', '#06b6d4', '#ec4899']
  let h = 0
  const s = String(name || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

// 解析后端时间（localdatetime 字符串）→ Date
export function parseLocal(iso) {
  if (!iso) return null
  const t = new Date(iso.replace(' ', 'T'))
  return isNaN(t.getTime()) ? null : t
}