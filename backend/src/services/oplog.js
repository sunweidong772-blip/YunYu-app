// 管理员操作日志写入
function log(db, req, action, targetType = '', targetId = 0, detail = '') {
  db.prepare('INSERT INTO operation_logs (admin_user_id, admin_name, action, target_type, target_id, detail, ip) VALUES (?,?,?,?,?,?,?)')
    .run(req.user.id, req.user.nickname, action, targetType, targetId, detail, req.ip || '');
}

module.exports = { log };