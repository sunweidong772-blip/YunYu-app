// 通用工具：统一响应格式 + 分页
function ok(res, data, message = '') {
  return res.json({ code: 0, message, data });
}

function fail(res, message, code = 1, status = 200) {
  return res.status(status).json({ code, message, data: null });
}

function pageParams(req, defaults = { page: 1, pageSize: 20 }) {
  let page = Math.max(1, parseInt(req.query.page || defaults.page, 10) || 1);
  let pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || defaults.pageSize, 10) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function pageResult(rows, total, page, pageSize) {
  return { list: rows, total, page, pageSize, hasMore: page * pageSize < total };
}

module.exports = { ok, fail, pageParams, pageResult };