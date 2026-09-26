// API 请求封装：统一鉴权、错误处理、开发模式提示
const TOKEN_KEY = 'yunyu_token'
const REFRESH_KEY = 'yunyu_refresh_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || ''
}

export function setRefreshToken(t) {
  if (t) localStorage.setItem(REFRESH_KEY, t)
  else localStorage.removeItem(REFRESH_KEY)
}

let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

let isRefreshing = false
let refreshSubscribers = []

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

async function doRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('没有刷新令牌')
  const resp = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  const data = await resp.json()
  if (data && data.code === 0 && data.data && data.data.token) {
    setToken(data.data.token)
    if (data.data.refreshToken) setRefreshToken(data.data.refreshToken)
    return data.data.token
  }
  throw new Error(data.message || '刷新令牌失败')
}

export async function request(method, path, body, { auth = true, silent = false } = {}) {
  const headers = {}
  let payload = null
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const token = getToken()
  if (auth && token) headers['Authorization'] = 'Bearer ' + token

  let resp
  try {
    resp = await fetch(path, { method, headers, body: payload })
  } catch (e) {
    throw new Error('网络连接失败，请检查网络后重试')
  }

  // 401 自动刷新一次
  if (resp.status === 401 && auth && getRefreshToken() && !path.includes('/api/auth/refresh')) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(newToken => {
          headers['Authorization'] = 'Bearer ' + newToken
          fetch(path, { method, headers, body: payload })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
      }).then(async r => {
        return handleResponse(r)
      })
    }
    isRefreshing = true
    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      headers['Authorization'] = 'Bearer ' + newToken
      resp = await fetch(path, { method, headers, body: payload })
    } catch (e) {
      refreshSubscribers = []
      if (getToken()) setToken('')
      if (getRefreshToken()) setRefreshToken('')
      if (onUnauthorized && !silent) onUnauthorized()
      throw new Error('登录已过期，请重新登录')
    } finally {
      isRefreshing = false
    }
  }

  return handleResponse(resp)
}

async function handleResponse(resp) {
  let data = null
  try { data = await resp.json() } catch (e) { /* 非 JSON */ }

  if (resp.status === 401) {
    if (getToken()) setToken('')
    if (getRefreshToken()) setRefreshToken('')
    if (onUnauthorized) onUnauthorized()
    const msg = (data && data.message) || '登录已过期，请重新登录'
    throw new Error(msg)
  }
  if (data && typeof data.code === 'number' && data.code !== 0) {
    throw new Error(data.message || '请求失败')
  }
  if (!data) throw new Error('服务异常，请稍后再试')
  return data && data.data !== undefined ? data.data : data
}

export function get(path, opts) { return request('GET', path, undefined, opts) }
export function post(path, body, opts) { return request('POST', path, body, opts) }
export function put(path, body, opts) { return request('PUT', path, body, opts) }
export function del(path, opts) { return request('DELETE', path, undefined, opts) }

// 开发模式验证码辅助：注册/找回时在登录页输入 devCode（仅当 SMTP 未配置时出现）
export const isDevHint = '开发模式：验证码由后端返回，可直接填入'