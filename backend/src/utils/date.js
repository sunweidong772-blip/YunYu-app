// 本地时间工具：统一使用机器本地时区（与 SQLite datetime('now','localtime') 一致）
function pad(n) { return String(n).padStart(2, '0'); }

// YYYY-MM-DD
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// YYYY-MM-DD HH:MM:SS
function localDateTimeStr(d = new Date()) {
  return `${localDateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 相对天数
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

module.exports = { localDateStr, localDateTimeStr, daysAgo };