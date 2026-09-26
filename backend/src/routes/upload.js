// 图片上传路由：帖子图片等（base64 data URL）
// 安全约束：仅登录用户；MIME/扩展名白名单；单图 ≤ 3MB；随机文件名防路径穿越；登记 upload_files
// 新增：自动压缩生成缩略图（400x400 JPG）和 WebP（max 1200px）
const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ok, fail } = require('../utils/response');
const { requireAuth } = require('../middleware/auth');

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// MIME 白名单 → 扩展名
const MIME_ALLOW = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

// POST /api/upload { data: "data:image/png;base64,xxx" }
router.post('/', requireAuth, (req, res) => {
  const data = String((req.body || {}).data || '').slice(0, MAX_SIZE * 2);
  const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i.exec(data);
  if (!m) return fail(res, '图片数据格式不正确', 1, 400);

  const mime = m[1].toLowerCase();
  const ext = MIME_ALLOW[mime];
  if (!ext) return fail(res, '仅支持 JPG/PNG/GIF/WebP 图片', 1, 400);

  let buf;
  try {
    buf = Buffer.from(m[2], 'base64');
  } catch (e) {
    return fail(res, '图片解码失败', 1, 400);
  }
  if (buf.length === 0) return fail(res, '图片内容为空', 1, 400);
  if (buf.length > MAX_SIZE) return fail(res, '图片不能超过 3MB', 1, 400);

  // 魔数二次校验，防止伪造扩展名
  const sigs = {
    '.jpg': [0xff, 0xd8, 0xff],
    '.png': [0x89, 0x50, 0x4e, 0x47],
    '.gif': [0x47, 0x49, 0x46, 0x38],
    '.webp': [0x52, 0x49, 0x46, 0x46],
  };
  const sig = sigs[ext];
  const head = [...buf.subarray(0, 4)];
  if (!sig.every((b, i) => head[i] === b)) return fail(res, '图片内容校验失败，请重新上传', 1, 400);

  const filename = crypto.randomBytes(8).toString('hex') + Date.now() + ext;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buf);
  const url = '/uploads/' + filename;

  // 压缩生成缩略图 + WebP
  let thumbUrl = '';
  let webpUrl = '';
  try {
    const compressScript = path.resolve(__dirname, '../../scripts/compress_image.py');
    const result = spawnSync('python3', [compressScript, filePath, UPLOAD_DIR], {
      encoding: 'utf-8',
      timeout: 15000,
    });
    if (result.status === 0 && result.stdout) {
      const compressed = JSON.parse(result.stdout.trim());
      thumbUrl = '/uploads/' + compressed.thumb;
      webpUrl = '/uploads/' + compressed.webp;
    }
  } catch (e) {
    // 压缩失败不影响原图上传，静默处理
  }

  db.prepare('INSERT INTO upload_files (user_id, filename, original_name, mime, size, url, thumb_url, webp_url) VALUES (?,?,?,?,?,?,?,?)')
    .run(req.user.id, filename, '', mime, buf.length, url, thumbUrl, webpUrl);

  return ok(res, { url, thumb_url: thumbUrl, webp_url: webpUrl, size: buf.length, mime }, '上传成功');
});

module.exports = router;