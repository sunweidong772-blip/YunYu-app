import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../core/dio_client.dart';
import '../../core/yunyu_v22_visual.dart';
import '../../core/yunyu_v27_admin.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/yunyu_design.dart';
import 'stats_page.dart';
import 'post_audit_page.dart';
import 'app_audit_page.dart';
import 'user_manage_page.dart';
import 'report_page.dart';
import 'admin_roles_page.dart';

class AdminHomePage extends StatefulWidget {
  const AdminHomePage({super.key});

  @override
  State<AdminHomePage> createState() => _AdminHomePageState();
}

class _AdminHomePageState extends State<AdminHomePage> {
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/admin/stats');
      setState(() {
        _stats = result['data'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final roleCode = user?.adminRoleCode;

    return Scaffold(
      appBar: AppBar(
        title: const Text('云屿 · 管理中心'),
        actions: [
          IconButton(icon: Icon(Icons.info_outline), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminRolesPage()))),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadStats,
        child: _isLoading
            ? LoadingView()
            : ListView(
                padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuSpacing.lg, YunyuSpacing.page, YunyuV11.pageBottomSafeGap),
                children: [
                  const YunyuPageIntro(eyebrow: 'YUNYU ADMIN', title: '管理中心', subtitle: '让社区的每一座岛屿保持有序'),
                  // 管理员信息
                  Container(
                    decoration: BoxDecoration(gradient: YunyuColors.heroGradient, borderRadius: BorderRadius.circular(YunyuV11.adminHeroRadius), boxShadow: YunyuShadow.card),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuSpacing.lg, YunyuSpacing.page, YunyuV11.pageBottomSafeGap),
                      child: Row(children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [ThemeProvider.primaryColor, ThemeProvider.secondaryColor]),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.admin_panel_settings, color: Colors.white, size: 28),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user?.displayName ?? user?.username ?? '', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ]),
                    ),
                  ),
                  SizedBox(height: 16),
                  // 数据统计
                  const Text('管理概览', style: YunyuTextStyle.h3),
                  const SizedBox(height: 4),
                  const Text('实时掌握云屿社区的运行状态', style: YunyuTextStyle.caption),
                  SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('总用户数', '${_stats?['total_users'] ?? 0}', Icons.people, Colors.blue),
                      _buildStatCard('今日注册', '${_stats?['today_users'] ?? 0}', Icons.person_add, Colors.green),
                      _buildStatCard('总软件数', '${_stats?['total_apps'] ?? 0}', Icons.apps, Colors.purple),
                      _buildStatCard('总下载量', '${_stats?['total_downloads'] ?? 0}', Icons.download, Colors.orange),
                      _buildStatCard('总帖子数', '${_stats?['total_posts'] ?? 0}', Icons.article, Colors.red),
                      _buildStatCard('待处理举报', '${_stats?['pending_reports'] ?? 0}', Icons.report, Colors.redAccent),
                    ],
                  ),
                  SizedBox(height: 16),
                  // 待审核提示
                  if ((int.tryParse(_stats?['pending_posts']?.toString() ?? '0') ?? 0) > 0 || (int.tryParse(_stats?['pending_apps']?.toString() ?? '0') ?? 0) > 0)
                    Card(
                      color: Colors.orange.withOpacity(0.1),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuSpacing.lg, YunyuSpacing.page, YunyuV11.pageBottomSafeGap),
                        child: Row(children: [
                          Icon(Icons.notifications_active, color: Colors.orange),
                          SizedBox(width: 12),
                          Expanded(child: Text('有待审核内容：帖子${_stats?['pending_posts'] ?? 0}篇，软件${_stats?['pending_apps'] ?? 0}个', style: TextStyle(color: Colors.orange[800]))),
                        ]),
                      ),
                    ),
                  SizedBox(height: 16),
                  // 功能入口
                  const Text('工作台', style: YunyuTextStyle.h3),
                  SizedBox(height: 12),
                  if (_canViewStats(roleCode)) _buildFunctionItem(Icons.bar_chart, '数据统计', '查看平台运营数据', () => Navigator.push(context, MaterialPageRoute(builder: (_) => StatsPage()))),
                  if (_canAuditPost(roleCode)) _buildFunctionItem(Icons.article_outlined, '帖子审核', '${_stats?['pending_posts'] ?? 0}篇待审核', () => Navigator.push(context, MaterialPageRoute(builder: (_) => PostAuditPage()))),
                  if (_canAuditApp(roleCode)) _buildFunctionItem(Icons.apps_outlined, '软件审核', '${_stats?['pending_apps'] ?? 0}个待审核', () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppAuditPage()))),
                  if (_canManageUser(roleCode)) _buildFunctionItem(Icons.people_outline, '用户管理', '查看和管理用户', () => Navigator.push(context, MaterialPageRoute(builder: (_) => UserManagePage()))),
                  if (_canHandleReport(roleCode)) _buildFunctionItem(Icons.report_outlined, '举报处理', '${_stats?['pending_reports'] ?? 0}条待处理', () => Navigator.push(context, MaterialPageRoute(builder: (_) => ReportPage()))),
                  _buildFunctionItem(Icons.shield_outlined, '管理员职责', '查看各等级管理员权限', () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminRolesPage()))),
                  SizedBox(height: 24),
                ],
              ),
      ),
    );
  }

  bool _canViewStats(String? role) => role == 'owner' || role == 'chief' || role == 'super';
  bool _canAuditPost(String? role) => role == 'owner' || role == 'chief' || role == 'super' || role == 'moderator';
  bool _canAuditApp(String? role) => role == 'owner' || role == 'chief' || role == 'super' || role == 'moderator';
  bool _canManageUser(String? role) => role == 'owner' || role == 'chief' || role == 'super';
  bool _canHandleReport(String? role) => role == 'owner' || role == 'chief' || role == 'super';

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.all(4),
      child: YunyuAdminMetricCard(title: title, value: value, icon: icon, color: color),
    );
  }

  Widget _buildFunctionItem(IconData icon, String title, String subtitle, VoidCallback onTap) {
    return YunyuAdminActionTile(icon: icon, title: title, subtitle: subtitle, onTap: onTap);
  }

}
