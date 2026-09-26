// 云屿权限体系：角色与权限定义（初始化种子）
const PERMISSIONS = [
  // Dashboard
  { code: 'dashboard:view', name: '查看仪表盘', group_name: '仪表盘' },
  // 用户管理
  { code: 'user:view', name: '查看用户', group_name: '用户管理' },
  { code: 'user:edit', name: '编辑用户', group_name: '用户管理' },
  { code: 'user:ban', name: '禁言/封禁/解封', group_name: '用户管理' },
  { code: 'user:exp', name: '调整等级/EXP', group_name: '用户管理' },
  // 内容管理
  { code: 'post:view', name: '查看帖子', group_name: '内容管理' },
  { code: 'post:edit', name: '编辑帖子', group_name: '内容管理' },
  { code: 'post:delete', name: '删除/置顶/加精', group_name: '内容管理' },
  { code: 'comment:manage', name: '评论管理', group_name: '内容管理' },
  { code: 'topic:manage', name: '话题管理', group_name: '内容管理' },
  // 软件管理
  { code: 'software:view', name: '查看软件', group_name: '软件管理' },
  { code: 'software:edit', name: '编辑软件', group_name: '软件管理' },
  { code: 'software:delete', name: '删除软件', group_name: '软件管理' },
  { code: 'collection:manage', name: '合集管理', group_name: '软件管理' },
  { code: 'category:manage', name: '分类管理', group_name: '软件管理' },
  // 运营管理
  { code: 'checkin:manage', name: '签到管理', group_name: '运营管理' },
  { code: 'task:manage', name: '任务管理', group_name: '运营管理' },
  { code: 'report:handle', name: '举报处理', group_name: '运营管理' },
  { code: 'announcement:manage', name: '公告管理', group_name: '运营管理' },
  // 系统管理
  { code: 'admin:manage', name: '管理员管理', group_name: '系统管理' },
  { code: 'role:manage', name: '角色管理', group_name: '系统管理' },
  { code: 'permission:manage', name: '权限管理', group_name: '系统管理' },
  { code: 'settings:manage', name: '系统设置', group_name: '系统管理' },
  { code: 'log:view', name: '操作日志', group_name: '系统管理' },
  { code: 'email:config', name: '邮箱系统配置', group_name: '系统管理' },
];

// 角色定义：code -> 权限组
const ROLES = [
  {
    name: '云屿岛主',
    code: 'owner',
    description: '最高管理员，拥有全部权限',
    is_system: 1,
    perms: PERMISSIONS.map((p) => p.code), // 全部权限
  },
  {
    name: '高级管理员',
    code: 'senior',
    description: '主要管理权限',
    is_system: 1,
    perms: [
      'dashboard:view', 'user:view', 'user:edit', 'user:ban', 'user:exp', 'user:edit',
      'post:view', 'post:edit', 'post:delete', 'comment:manage', 'topic:manage',
      'software:view', 'software:edit', 'software:delete', 'collection:manage', 'category:manage',
      'checkin:manage', 'task:manage', 'report:handle', 'announcement:manage', 'log:view',
    ],
  },
  {
    name: '内容管理员',
    code: 'content',
    description: '帖子、评论、举报管理',
    is_system: 1,
    perms: [
      'dashboard:view', 'post:view', 'post:edit', 'post:delete', 'comment:manage',
      'topic:manage', 'report:handle',
    ],
  },
  {
    name: '软件管理员',
    code: 'software',
    description: '软件库、软件合集管理',
    is_system: 1,
    perms: [
      'dashboard:view', 'software:view', 'software:edit', 'software:delete',
      'collection:manage', 'category:manage', 'post:view',
    ],
  },
  {
    name: '普通管理员',
    code: 'normal',
    description: '基础管理权限',
    is_system: 1,
    perms: ['dashboard:view', 'post:view', 'software:view', 'user:view', 'report:handle'],
  },
];

module.exports = { PERMISSIONS, ROLES };