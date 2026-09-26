// 轻量 Toast
let host = null
let seq = 0

function ensureHost() {
  if (host) return host
  host = document.createElement('div')
  host.className = 'toast-host'
  document.body.appendChild(host)
  return host
}

export function toast(msg, duration = 2200) {
  if (!msg) return
  const el = document.createElement('div')
  el.className = 'toast-item'
  el.textContent = msg
  ensureHost().appendChild(el)
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity .25s'
    setTimeout(() => el.remove(), 260)
  }, duration)
}

// 确认弹窗（Promise 化）
export function confirmDialog({ title = '提示', body = '', okText = '确定', cancelText = '取消', danger = false } = {}) {
  return new Promise((resolve) => {
    const mask = document.createElement('div')
    mask.className = 'dialog-mask'
    mask.innerHTML = `
      <div class="dialog">
        <div class="dialog-title">${title}</div>
        ${body ? `<div class="dialog-body">${body}</div>` : ''}
        <div class="dialog-actions">
          <button class="btn btn-outline cancel-btn">${cancelText}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} ok-btn">${okText}</button>
        </div>
      </div>`
    document.body.appendChild(mask)
    const close = (val) => { mask.remove(); resolve(val) }
    mask.querySelector('.cancel-btn').onclick = () => close(false)
    mask.querySelector('.ok-btn').onclick = () => close(true)
    mask.addEventListener('click', (e) => { if (e.target === mask) close(false) })
  })
}