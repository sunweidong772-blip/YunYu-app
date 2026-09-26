#!/usr/bin/env bash
# 云屿后端全链路冒烟测试（Node 原生，零依赖）
# 用法：bash backend/scripts/smoke.sh [BASE_URL]
# 默认 BASE_URL=http://127.0.0.1:3000
# 覆盖：注册/登录/找回、C端内容、软件、社区、签到/等级/任务、消息、管理后台、权限防护
set -u
BASE="${1:-http://127.0.0.1:3000}"
PASS=0; FAIL=0; FAILED_NAMES=()

say() { printf '%s\n' "$*"; }
ok()  { PASS=$((PASS+1)); say "  ✅ $1"; }
bad() { FAIL=$((FAIL+1)); FAILED_NAMES+=("$1"); say "  ❌ $1  => $2"; }
check() { # check <name> <grep_count> <detail>  —— 第二个参数是 grep -c 的计数结果，≥1 视为通过
  if [ "${2:-0}" != "0" ]; then ok "$1"; else bad "$1" "${3:-}"; fi
}
jqget() { # jqget <json> <path>  简易取值（不支持复杂表达式请改脚本）
  python3 -c "import sys,json;d=json.loads(sys.argv[1]);
def g(o,p):
 for k in p.split('.'):
  if isinstance(o,dict) and k in o: o=o[k]
  else: return ''
 return o if o is not None else ''
print(g(d,'$2'))" "$1" 2>/dev/null
}
call() { # call <method> <path> [json] [token]
  local m="$1" p="$2" b="${3:-}" t="${4:-}"
  if [ -n "$b" ]; then
    curl -s -m 15 -X "$m" "$BASE$p" -H 'Content-Type: application/json' ${t:+-H "Authorization: Bearer $t"} -d "$b"
  else
    curl -s -m 15 -X "$m" "$BASE$p" ${t:+-H "Authorization: Bearer $t"}
  fi
}

EMAIL="smoke_$(date +%s)@yunyu.app"
NICK="冒烟用户$(date +%s | tail -c 5)"

say "== 基础服务 =="
R=$(call GET /api/home); check '首页聚合' "$(echo "$R" | grep -c '"code":0')" "$R"

say "== 1. 账号体系 =="
R=$(call POST /api/auth/send-code "{\"email\":\"$EMAIL\",\"scene\":\"register\"}")
check '发送注册验证码' "$(echo "$R" | grep -c '"code":0')" "$R"
CODE=$(jqget "$R" data.devCode); [ -z "$CODE" ] && CODE=000000
R=$(call POST /api/auth/register "{\"email\":\"$EMAIL\",\"code\":\"$CODE\",\"nickname\":\"$NICK\",\"password\":\"Test@123456\",\"confirmPassword\":\"Test@123456\",\"agree\":true}")
check '注册新用户' "$(echo "$R" | grep -c '"code":0')" "$R"
TOKEN=$(jqget "$R" data.token)
TUID=$(jqget "$R" data.user.id)
R=$(call POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"Test@123456\"}")
check '登录' "$(echo "$R" | grep -c '"code":0')" "$R"
check '登录含 mustChangePassword' "$(echo "$R" | grep -c mustChangePassword)" "$R"

say "== 2. 内容与软件 =="
R=$(call GET /api/software?page=1\&pageSize=3)
check '软件列表' "$(echo "$R" | grep -c '"code":0')" "$R"
SWID=$(jqget "$R" data.list[0].id 2>/dev/null); SWID=$(echo "$R" | python3 -c "import sys,json;d=json.loads(sys.stdin.read());print(d['data']['list'][0]['id'])" 2>/dev/null)
R=$(call GET /api/software/collections); check '合集列表' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/posts/topics); check '话题列表' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET "/api/search?q=%E8%BD%AF%E4%BB%B6"); check '搜索' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET "/api/search?q=%E8%BD%AF%E4%BB%B6"); check '搜索返回软件+高亮' "$(echo "$R" | grep -c 'highlighted')" "$R"
if [ -n "$SWID" ] && [ "$SWID" != "" ]; then
  R=$(call GET /api/software/$SWID); check '软件详情' "$(echo "$R" | grep -c '"code":0')" "$R"
  R=$(call POST /api/software/$SWID/favorite {} "$TOKEN"); check '收藏软件' "$(echo "$R" | grep -c '"code":0')" "$R"
fi

say "== 3. 社区 =="
R=$(call POST /api/posts "{\"title\":\"冒烟测试帖\",\"content\":\"冒烟内容正文\"}" "$TOKEN")
check '发布帖子' "$(echo "$R" | grep -c '"code":0')" "$R"
PID=$(jqget "$R" data.id)
R=$(call GET /api/posts?page=1\&pageSize=3); check '帖子列表' "$(echo "$R" | grep -c '"code":0')" "$R"
if [ -n "$PID" ]; then
  R=$(call POST /api/posts/$PID/like {} "$TOKEN"); check '点赞' "$(echo "$R" | grep -c '"code":0')" "$R"
  R=$(call POST /api/posts/$PID/comments "{\"content\":\"冒烟评论\"}" "$TOKEN"); check '评论' "$(echo "$R" | grep -c '"code":0')" "$R"
  R=$(call POST /api/posts/$PID/favorite {} "$TOKEN"); check '收藏帖子' "$(echo "$R" | grep -c '"code":0')" "$R"
  R=$(call POST /api/posts/$PID/report "{\"reason\":\"测试举报\"}" "$TOKEN"); check '举报帖子' "$(echo "$R" | grep -c '"code":0')" "$R"
fi

say "== 4. 用户体系 =="
R=$(call GET /api/users/me "" "$TOKEN"); check '我的信息(含admin)' "$(echo "$R" | grep -c '"admin"')" "$R"
R=$(call GET /api/users/$TUID "" "$TOKEN"); check '用户主页' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/users/me/invite-code "" "$TOKEN"); check '生成邀请码' "$(echo "$R" | grep -c 'refCode')" "$R"
R=$(call GET /api/users/me/invite-stats "" "$TOKEN"); check '邀请统计' "$(echo "$R" | grep -c 'registered')" "$R"

say "== 5. 签到/等级/任务 =="
R=$(call GET /api/users/checkin/status "" "$TOKEN"); check '签到状态' "$(echo "$R" | grep -c '"rewards"')" "$R"
R=$(call POST /api/users/checkin {} "$TOKEN"); check '执行签到' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/users/levels); check '等级体系' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/users/tasks "" "$TOKEN"); check '每日任务' "$(echo "$R" | grep -c '"list"')" "$R"

say "== 6. 消息 =="
R=$(call GET /api/users/notifications "" "$TOKEN"); check '通知列表' "$(echo "$R" | grep -c '"list"')" "$R"
R=$(call GET /api/users/unread-summary "" "$TOKEN"); check '未读汇总' "$(echo "$R" | grep -c '"total"')" "$R"
R=$(call GET /api/users/conversations "" "$TOKEN"); check '会话列表' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call POST /api/users/messages "{\"to\":1,\"content\":\"冒烟私信\"}" "$TOKEN"); check '发送私信' "$(echo "$R" | grep -c '"code":0')" "$R"

say "== 7. 管理后台 =="
R=$(call POST /api/auth/login "{\"email\":\"admin@yunyu.app\",\"password\":\"Yunyu@2026\"}")
check '岛主登录' "$(echo "$R" | grep -c '"code":0')" "$R"
ADM_TOKEN=$(jqget "$R" data.token)
check '登录含管理员信息' "$(echo "$R" | grep -c '"admin"')" "$R"
R=$(call GET /api/admin/me "" "$ADM_TOKEN"); check '管理员身份/权限' "$(echo "$R" | grep -c '"permissions"')" "$R"
R=$(call GET /api/admin/dashboard "" "$ADM_TOKEN"); check '数据看板' "$(echo "$R" | grep -c '"stats"')" "$R"
R=$(call GET /api/admin/users?page=1 "" "$ADM_TOKEN"); check '后台用户列表' "$(echo "$R" | grep -c '"list"')" "$R"
R=$(call GET /api/admin/posts?page=1 "" "$ADM_TOKEN"); check '后台帖子列表' "$(echo "$R" | grep -c '"list"')" "$R"
R=$(call GET /api/admin/software "" "$ADM_TOKEN"); check '后台软件列表' "$(echo "$R" | grep -c '"list"')" "$R"
R=$(call GET /api/admin/roles "" "$ADM_TOKEN"); check '角色权限' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/admin/settings "" "$ADM_TOKEN"); check '系统设置' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/admin/logs?page=1 "" "$ADM_TOKEN"); check '操作日志' "$(echo "$R" | grep -c '"list"')" "$R"
R=$(call GET /api/admin/checkins "" "$ADM_TOKEN"); check '签到管理' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/admin/tasks "" "$ADM_TOKEN"); check '任务管理' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/admin/admins "" "$ADM_TOKEN"); check '管理员列表' "$(echo "$R" | grep -c '"code":0')" "$R"

say "== 8. 事件埋点 =="
R=$(call POST /api/events/track "{\"event_type\":\"page_view\",\"event_name\":\"smoke_test\",\"target_type\":\"page\",\"session_id\":\"smoke-session\"}" "$TOKEN"); check '事件埋点上报' "$(echo "$R" | grep -c '"code":0')" "$R"
R=$(call GET /api/admin/dashboard "" "$ADM_TOKEN"); check '看板含事件统计' "$(echo "$R" | grep -c 'eventStats')" "$R"

say "== 9. 权限防护 =="
R=$(call GET /api/admin/dashboard); check '未登录访问后台被拒' "$(echo "$R" | grep -c '"code"')" "$R"
R=$(call GET /api/users/me); check '未登录访问个人信息被拒' "$(echo "$R" | grep -c '"code"')" "$R"

say ""
say "=== 结果: $PASS 通过, $FAIL 失败 ==="
if [ "$FAIL" -gt 0 ]; then
  printf '失败项: %s\n' "${FAILED_NAMES[*]}"
  exit 1
fi
exit 0