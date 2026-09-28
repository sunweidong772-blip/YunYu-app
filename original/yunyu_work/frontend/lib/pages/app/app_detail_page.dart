import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/yunyu_v21_visual.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/dio_client.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/common_widgets.dart';
import '../user/user_profile_page.dart';

class AppDetailPage extends StatefulWidget {
  final int appId;
  const AppDetailPage({super.key, required this.appId});

  @override
  State<AppDetailPage> createState() => _AppDetailPageState();
}

class _AppDetailPageState extends State<AppDetailPage> {
  dynamic _app;
  bool _isLoading = true;
  bool _isFavorited = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/apps/${widget.appId}');
      _app = result['data'];
      // 从后端加载收藏状态
      _isFavorited = _app['is_favorited'] == true;
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _toggleFavorite() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    try {
      final result = await DioClient().post('/apps/${widget.appId}/favorite');
      // 使用后端返回的收藏状态
      final favorited = result['data']?['favorited'] ?? !_isFavorited;
      setState(() => _isFavorited = favorited);
      if (mounted) showSuccess(context, _isFavorited ? '已收藏' : '已取消收藏');
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _download() async {
    try {
      await DioClient().post('/apps/${widget.appId}/download');
      final versions = _app?['versions'] ?? [];
      if (versions.isNotEmpty) {
        final url = versions[0]['download_url'];
        if (url != null && url.isNotEmpty) {
          final uri = Uri.parse(url);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
            if (mounted) showSuccess(context, '已开始下载');
          } else {
            if (mounted) showError(context, '无法打开下载链接');
          }
        } else {
          if (mounted) showError(context, '暂无下载地址');
        }
      } else {
        if (mounted) showError(context, '暂无下载版本');
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _reportApp() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('举报软件'),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(labelText: '举报原因', hintText: '请描述举报原因'),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('提交举报')),
        ],
      ),
    );
    if (result == true && controller.text.trim().isNotEmpty) {
      try {
        await DioClient().post('/reports', data: {
          'target_type': 'app',
          'target_id': widget.appId,
          'reason': controller.text.trim(),
        });
        if (mounted) showSuccess(context, '举报成功，我们会尽快处理');
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('软件详情'),
        actions: [
          IconButton(
            icon: Icon(Icons.flag_outlined),
            tooltip: '举报',
            onPressed: _reportApp,
          ),
        ],
      ),
      body: _isLoading
          ? LoadingView()
          : _app == null
              ? EmptyView(icon: Icons.error_outline, message: '软件不存在')
              : ListView(
                  children: [
                    // 软件信息
                    Padding(
                      padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuV9.detailTopGap, YunyuSpacing.page, YunyuSpacing.md),
                      child: YunyuSectionCard(child: Row(children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [ThemeProvider.primaryColor, ThemeProvider.secondaryColor]),
                            borderRadius: BorderRadius.circular(YunyuV9.detailCardRadius),
                          ),
                          child: _app['icon_url'] != null && _app['icon_url'].isNotEmpty
                              ? ClipRRect(borderRadius: BorderRadius.circular(YunyuV9.detailCardRadius), child: Image.network(_app['icon_url'], fit: BoxFit.cover))
                              : Icon(Icons.apps, size: 40, color: Colors.white),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_app['name'] ?? '', style: YunyuTextStyle.h2),
                              SizedBox(height: 4),
                              Text(_app['category'] ?? '', style: TextStyle(color: Colors.grey)),
                              SizedBox(height: 8),
                              Row(children: [
                                Icon(Icons.download, size: 14, color: Colors.grey),
                                SizedBox(width: 4),
                                Text('${_app['download_count'] ?? 0} 次下载', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              ]),
                            ],
                          ),
                        ),
                      ])),
                    ),
                    // 操作按钮
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page),
                      child: Row(children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _download,
                            icon: Icon(Icons.download),
                            label: Text('下载'),
                            style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 14)),
                          ),
                        ),
                        SizedBox(width: 12),
                        OutlinedButton.icon(
                          onPressed: _toggleFavorite,
                          icon: Icon(_isFavorited ? Icons.favorite : Icons.favorite_border, color: _isFavorited ? Colors.red : null),
                          label: Text(_isFavorited ? '已收藏' : '收藏'),
                          style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 14)),
                        ),
                      ]),
                    ),
                    SizedBox(height: 24),
                    // 软件介绍
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const YunyuSectionHeader(eyebrow: 'ABOUT THIS APP', title: '软件介绍'),
                          SizedBox(height: 12),
                          Text(_app['intro'] ?? '暂无介绍', style: TextStyle(fontSize: 14, height: 1.6, color: Colors.grey[700])),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    // 版本历史
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const YunyuSectionHeader(eyebrow: 'VERSION HISTORY', title: '版本历史'),
                          SizedBox(height: 12),
                          if ((_app['versions'] ?? []).isEmpty)
                            Text('暂无版本记录', style: TextStyle(color: Colors.grey)),
                          if ((_app['versions'] ?? []).isNotEmpty)
                            ...(_app['versions'] as List).map((v) => YunyuSectionCard(
                                  margin: EdgeInsets.only(bottom: 8),
                                  child: ListTile(
                                    leading: Icon(Icons.history, color: ThemeProvider.primaryColor),
                                    title: Text('v${v['version_name'] ?? ''}'),
                                    subtitle: Text(v['change_log'] ?? '暂无更新日志', maxLines: 2, overflow: TextOverflow.ellipsis),
                                    trailing: v['is_current'] == true ? Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: ThemeProvider.primaryColor, borderRadius: BorderRadius.circular(8)), child: Text('当前', style: TextStyle(color: Colors.white, fontSize: 11))) : null,
                                  ),
                                )),
                        ],
                      ),
                    ),
                    SizedBox(height: 24),
                    // 发布者信息
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const YunyuSectionHeader(eyebrow: 'PUBLISHER', title: '发布者'),
                          SizedBox(height: 12),
                          Card(
                            child: ListTile(
                              leading: GestureDetector(
                                onTap: () {
                                  if (_app['user_id'] != null) {
                                    Navigator.push(context, MaterialPageRoute(builder: (_) => UserProfilePage(userId: _app['user_id'])));
                                  }
                                },
                                child: UserAvatar(avatarUrl: _app['avatar_url'], displayName: _app['display_name'] ?? _app['username']),
                              ),
                              title: Text(_app['display_name'] ?? _app['username'] ?? '匿名'),
                              subtitle: Text('云屿用户'),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
    );
  }
}
