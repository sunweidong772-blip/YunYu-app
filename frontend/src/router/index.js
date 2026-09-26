import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ===== 启动 =====
  { path: '/', redirect: '/home' },
  { path: '/splash', name: 'splash', component: () => import('@/views/Splash.vue') },

  // ===== 账号 =====
  { path: '/login', name: 'login', component: () => import('@/views/auth/Login.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/auth/Register.vue') },
  { path: '/forgot', name: 'forgot', component: () => import('@/views/auth/Forgot.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/auth/ResetPassword.vue'), meta: { requiresAuth: true } },
  { path: '/change-email', name: 'change-email', component: () => import('@/views/auth/ChangeEmail.vue'), meta: { requiresAuth: true } },

  // ===== 底部五个 Tab =====
  { path: '/home', name: 'home', component: () => import('@/views/Home.vue'), meta: { tab: true } },
  { path: '/community', name: 'community', component: () => import('@/views/Community.vue'), meta: { tab: true } },
  { path: '/software', name: 'software', component: () => import('@/views/Software.vue'), meta: { tab: true } },
  { path: '/messages', name: 'messages', component: () => import('@/views/Messages.vue'), meta: { tab: true, requiresAuth: true } },
  { path: '/mine', name: 'mine', component: () => import('@/views/Mine.vue'), meta: { tab: true, requiresAuth: true } },

  // ===== 软件 =====
  { path: '/search', name: 'search', component: () => import('@/views/Search.vue') },
  { path: '/software-list', name: 'software-list', component: () => import('@/views/SoftwareList.vue') },
  { path: '/software/:id', name: 'software-detail', component: () => import('@/views/SoftwareDetail.vue'), meta: { title: '软件详情', description: '在云屿发现优质软件，查看软件详情、版本历史与用户评分' } },
  { path: '/collections', name: 'collections', component: () => import('@/views/Collections.vue') },
  { path: '/s-collection/:id', name: 'software-collection-detail', component: () => import('@/views/SoftwareCollectionDetail.vue') },
  { path: '/collection/:id', name: 'collection-detail', component: () => import('@/views/CollectionDetail.vue') },
  { path: '/collection/create', name: 'collection-create', component: () => import('@/views/CollectionCreate.vue'), meta: { requiresAuth: true } },
  { path: '/collection/:id/edit', name: 'collection-edit', component: () => import('@/views/CollectionCreate.vue'), meta: { requiresAuth: true } },

  // ===== 社区 =====
  { path: '/post/:id', name: 'post-detail', component: () => import('@/views/PostDetail.vue'), meta: { title: '帖子详情', description: '云屿社区帖子详情，参与讨论与互动' } },
  { path: '/post-create', name: 'post-create', component: () => import('@/views/PostCreate.vue'), meta: { requiresAuth: true } },
  { path: '/post/:id/edit', name: 'post-edit', component: () => import('@/views/PostCreate.vue'), meta: { requiresAuth: true } },
  { path: '/topic/:id', name: 'topic-detail', component: () => import('@/views/TopicDetail.vue'), meta: { title: '专题详情', description: '云屿专题详情，探索精选内容' } },
  { path: '/topics', name: 'topics', component: () => import('@/views/Topics.vue') },

  // ===== 用户 =====
  { path: '/user/:id', name: 'user', component: () => import('@/views/User.vue'), meta: { title: '用户主页', description: '云屿用户主页，查看动态与收藏' } },
  { path: '/user/:id/following', name: 'user-following', component: () => import('@/views/FollowList.vue') },
  { path: '/user/:id/followers', name: 'user-followers', component: () => import('@/views/FollowList.vue') },
  { path: '/level', name: 'level', component: () => import('@/views/Level.vue') },
  { path: '/checkin', name: 'checkin', component: () => import('@/views/Checkin.vue'), meta: { requiresAuth: true } },
  { path: '/tasks', name: 'tasks', component: () => import('@/views/Tasks.vue'), meta: { requiresAuth: true } },

  // ===== 我的 =====
  { path: '/my/posts', name: 'my-posts', component: () => import('@/views/MyPosts.vue'), meta: { requiresAuth: true } },
  { path: '/my/comments', name: 'my-comments', component: () => import('@/views/MyComments.vue'), meta: { requiresAuth: true } },
  { path: '/my/favorites', name: 'my-favorites', component: () => import('@/views/MyFavorites.vue'), meta: { requiresAuth: true } },
  { path: '/my/collections', name: 'my-collections', component: () => import('@/views/MyCollections.vue'), meta: { requiresAuth: true } },
  { path: '/profile-edit', name: 'profile-edit', component: () => import('@/views/ProfileEdit.vue'), meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: () => import('@/views/Settings.vue'), meta: { requiresAuth: true } },
  { path: '/about', name: 'about', component: () => import('@/views/About.vue') },
  { path: '/announcements', name: 'announcements', component: () => import('@/views/Announcements.vue') },
  { path: '/announcement/:id', name: 'announcement-detail', component: () => import('@/views/AnnouncementDetail.vue') },

  // ===== 消息 =====
  { path: '/notifications', name: 'notifications', component: () => import('@/views/Notifications.vue'), meta: { requiresAuth: true } },
  { path: '/chat/:id', name: 'chat', component: () => import('@/views/Chat.vue'), meta: { requiresAuth: true } },

  // ===== 管理后台 =====
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, admin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/Users.vue') },
      { path: 'posts', name: 'admin-posts', component: () => import('@/views/admin/Posts.vue') },
      { path: 'comments', name: 'admin-comments', component: () => import('@/views/admin/Comments.vue') },
      { path: 'topics', name: 'admin-topics', component: () => import('@/views/admin/Topics.vue') },
      { path: 'software', name: 'admin-software', component: () => import('@/views/admin/Software.vue') },
      { path: 'software/:id', name: 'admin-software-edit', component: () => import('@/views/admin/SoftwareEdit.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'collections', name: 'admin-collections', component: () => import('@/views/admin/Collections.vue') },
      { path: 'u-collections', name: 'admin-u-collections', component: () => import('@/views/admin/UserCollections.vue') },
      { path: 'reports', name: 'admin-reports', component: () => import('@/views/admin/Reports.vue') },
      { path: 'announcements', name: 'admin-announcements', component: () => import('@/views/admin/Announcements.vue') },
      { path: 'checkins', name: 'admin-checkins', component: () => import('@/views/admin/Checkins.vue') },
      { path: 'tasks', name: 'admin-tasks', component: () => import('@/views/admin/Tasks.vue') },
      { path: 'admins', name: 'admin-admins', component: () => import('@/views/admin/Admins.vue') },
      { path: 'roles', name: 'admin-roles', component: () => import('@/views/admin/Roles.vue') },
      { path: 'email', name: 'admin-email', component: () => import('@/views/admin/Email.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/Settings.vue') },
      { path: 'logs', name: 'admin-logs', component: () => import('@/views/admin/Logs.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 登录守卫：需要登录的页面未登录跳登录；管理员页面非管理员跳首页
export function installGuard(userStore) {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !userStore.token) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (to.meta.admin && !userStore.isAdmin) {
      // 未初始化时先拉取一次资料
      if (userStore.token && !userStore.profile) {
        // 交给页面自身处理（fetchMe 是异步），这里放行，AdminLayout 内做校验提示
        return true
      }
      return { path: '/home' }
    }
    return true
  })

  router.afterEach((to) => {
    const title = to.meta.title
    if (title) {
      document.title = title + ' | 云屿 YunYu'
    } else {
      document.title = '云屿 YunYu · 软件聚合社区'
    }
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = to.meta.description || '云屿 YunYu - 发现优质软件，分享实用工具，软件聚合社区'
  })

  return router
}

export default router