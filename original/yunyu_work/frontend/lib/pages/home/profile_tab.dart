import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/yunyu_design.dart';
import '../../core/yunyu_v21_visual.dart';
import '../../widgets/common_widgets.dart';
import '../../core/dio_client.dart';
import '../auth/login_page.dart';
import '../settings/settings_page.dart';
import '../settings/edit_profile_page.dart';
import '../post/my_posts_page.dart';
import '../user/favorites_page.dart';
import '../admin/admin_home_page.dart';
import '../message/message_list_page.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  bool _isCheckingIn = false;
  bool _checkedInToday = false;
  int _continuousDays = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.isLoggedIn) {
        auth.loadUserProfile();
        _loadCheckinStatus();
      }
    });
  }

  Future<void> _loadCheckinStatus() async {
    try {
      final result = await DioClient().get('/checkin/status');
      if (mounted) setState(() {
        _checkedInToday = result['data']['checked_in_today'] ?? false;
        _continuousDays = result['data']['continuous_days'] ?? 0;
      });
    } catch (_) {}
  }

  Future<void> _doCheckin() async {
    if (_isCheckingIn) return;
    setState(() => _isCheckingIn = true);
    try {
      final result = await DioClient().post('/checkin');
      if (mounted) {
        setState(() {
          _checkedInToday = true;
          _continuousDays = result['data']['continuous_days'] ?? _continuousDays + 1;
        });
        showSuccess(context, '签到成功 +${result['data']['exp_earned']} 经验');
        context.read<AuthProvider>().loadUserProfile();
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isCheckingIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: YunyuColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text('我的岛屿', style: YunyuTextStyle.h2),
        actions: [
          if (auth.isLoggedIn)
            IconButton(
              icon: Icon(Icons.settings_outlined, color: YunyuColors.textSecondary),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SettingsPage())),
            ),
        ],
      ),
      body: auth.isLoading
          ? LoadingView()
          : !auth.isLoggedIn
              ? _buildNotLoggedIn()
              : _buildLoggedIn(user),
    );
  }

  Widget _buildNotLoggedIn() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: YunyuColors.primaryLight,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.person_outline, size: 48, color: YunyuColors.primary),
        ),
        SizedBox(height: YunyuSpacing.lg),
        Text('登录后体验更多功能', style: YunyuTextStyle.title),
        SizedBox(height: YunyuSpacing.sm),
        Text('在云屿找到属于你的小岛 ☁️', style: YunyuTextStyle.caption),
        SizedBox(height: YunyuSpacing.xl),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.xxl),
          child: YunyuButton(text: '立即登录', onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LoginPage()))),
        ),
      ]),
    );
  }

  Widget _buildLoggedIn(dynamic user) {
    return ListView(
      children: [
        // 用户信息卡片 - 云朵渐变
        Container(
          margin: EdgeInsets.all(YunyuSpacing.lg),
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: YunyuColors.heroGradient,
            borderRadius: BorderRadius.circular(YunyuV8.heroRadius),
            border: Border.all(color: Colors.white.withOpacity(.35)),
            boxShadow: YunyuShadow.elevated,
          ),
          child: Column(
            children: [
              Align(alignment: Alignment.centerLeft, child: Text('MY ISLAND', style: YunyuTextStyle.tiny.copyWith(color: Colors.white70, fontWeight: FontWeight.w800, letterSpacing: 1.1))),
              const SizedBox(height: 10),
              Row(children: [
                UserAvatar(avatarUrl: user?.avatarUrl, displayName: user?.displayName ?? user?.username, size: 64, showBorder: true),
                SizedBox(width: YunyuSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.displayName ?? user?.username ?? '',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 2),
                      Text('@${user?.username ?? ''}', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      SizedBox(height: YunyuSpacing.sm),
                      LevelBadge(level: user?.level ?? 1, adminRoleCode: user?.adminRoleCode),
                      // 管理员头衔已整合到 LevelBadge 中，不再单独显示
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () async {
                    final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => EditProfilePage()));
                    if (result == true) context.read<AuthProvider>().loadUserProfile();
                  },
                  child: Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
                    child: Icon(Icons.edit, color: Colors.white, size: 18),
                  ),
                ),
              ]),
              SizedBox(height: YunyuSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem('${user?.posts ?? 0}', '帖子'),
                  _buildStatItem('${user?.following ?? 0}', '关注'),
                  _buildStatItem('${user?.followers ?? 0}', '粉丝'),
                  _buildStatItem('LV.${user?.level ?? 1}', '等级'),
                ],
              ),
              SizedBox(height: YunyuSpacing.lg),
              // 等级进度条
              Container(
                padding: EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white.withOpacity(.12), borderRadius: BorderRadius.circular(14)),
                child: Column(children: [
                  Row(children: [
                    Icon(Icons.trending_up, size: 16, color: Colors.white70),
                    SizedBox(width: 6),
                    Text('Lv.${user?.level ?? 1}', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                    Spacer(),
                    Text('${user?.levelProgress?['exp_in_level'] ?? 0}/${user?.levelProgress?['exp_needed'] ?? 0} 经验', style: TextStyle(color: Colors.white70, fontSize: 11)),
                  ]),
                  SizedBox(height: 8),
                  ClipRRect(borderRadius: BorderRadius.circular(99), child: LinearProgressIndicator(
                    value: (user?.levelProgress?['progress'] ?? 0).toDouble(),
                    minHeight: 6,
                    backgroundColor: Colors.white.withOpacity(.2),
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  )),
                ]),
              ),
              SizedBox(height: YunyuSpacing.md),
              // 签到按钮
              GestureDetector(
                onTap: _checkedInToday ? null : _doCheckin,
                child: Container(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: _checkedInToday ? Colors.white.withOpacity(.15) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(_checkedInToday ? Icons.check_circle : Icons.calendar_today, size: 18, color: _checkedInToday ? Colors.white70 : YunyuColors.primary),
                    SizedBox(width: 8),
                    Text(_checkedInToday ? '今日已签到 · 连续$_continuousDays天' : (_isCheckingIn ? '签到中...' : '每日签到 +5经验'),
                    style: TextStyle(color: _checkedInToday ? Colors.white70 : YunyuColors.primary, fontWeight: FontWeight.w700, fontSize: 14)),
                  ]),
                ),
              ),
            ],
          ),
        ),

        // 功能列表
        _buildSectionTitle('我的内容'),
        _buildMenuGroup([
          _buildMenuItem(Icons.article_outlined, '我的帖子', () => Navigator.push(context, MaterialPageRoute(builder: (_) => MyPostsPage()))),
          _buildMenuItem(Icons.favorite_border, '我的收藏', () => Navigator.push(context, MaterialPageRoute(builder: (_) => FavoritesPage()))),
          _buildMenuItem(Icons.message_outlined, '我的消息', () => Navigator.push(context, MaterialPageRoute(builder: (_) => MessageListPage()))),
        ]),

        // 管理员入口
        if (user?.isAdmin == true) ...[
          _buildSectionTitle('管理中心'),
          _buildMenuGroup([
            _buildMenuItem(
              Icons.admin_panel_settings_outlined,
              '管理员控制台',
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminHomePage())),
            ),
          ]),
        ],

        SizedBox(height: YunyuSpacing.xl),
        // 退出登录
        Padding(
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.lg),
          child: OutlinedButton.icon(
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (d) => AlertDialog(title: Text('确认退出'), content: Text('确定要退出登录吗？'), actions: [
                  TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
                  FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('退出')),
                ]),
              );
              if (confirm == true) {
                await context.read<AuthProvider>().logout();
                if (mounted) Navigator.of(context).pushReplacementNamed('/login');
              }
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: YunyuColors.error,
              side: BorderSide(color: YunyuColors.error.withOpacity(0.5)),
              padding: EdgeInsets.symmetric(vertical: YunyuSpacing.md),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
            ),
            icon: Icon(Icons.logout, size: 18),
            label: Text('退出登录', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ),
        SizedBox(height: YunyuSpacing.xxl),
      ],
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(children: [
      Text(value, style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
      SizedBox(height: 2),
      Text(label, style: TextStyle(color: Colors.white70, fontSize: 11)),
    ]);
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.fromLTRB(YunyuSpacing.lg, YunyuSpacing.md, YunyuSpacing.lg, YunyuSpacing.sm),
      child: Text(title, style: YunyuTextStyle.title.copyWith(fontSize: 15, color: YunyuColors.textSecondary)),
    );
  }

  Widget _buildMenuGroup(List<Widget> items) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: YunyuSpacing.lg),
      decoration: BoxDecoration(
        color: YunyuColors.surface,
        borderRadius: BorderRadius.circular(YunyuRadius.lg),
        boxShadow: YunyuShadow.card,
      ),
      child: Column(children: items),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap, {Widget? trailing}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(YunyuRadius.lg),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.lg, vertical: YunyuSpacing.md),
          child: Row(children: [
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(color: YunyuColors.primaryLight, borderRadius: BorderRadius.circular(YunyuRadius.sm)),
              child: Icon(icon, size: 18, color: YunyuColors.primary),
            ),
            SizedBox(width: YunyuSpacing.md),
            Expanded(child: Text(title, style: YunyuTextStyle.body)),
            trailing ?? Icon(Icons.chevron_right, size: 18, color: YunyuColors.textTertiary),
          ]),
        ),
      ),
    );
  }
}
