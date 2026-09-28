import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../../providers/theme_provider.dart';
import '../app/app_detail_page.dart';

class AppAuditPage extends StatefulWidget {
  const AppAuditPage({super.key});

  @override
  State<AppAuditPage> createState() => _AppAuditPageState();
}

class _AppAuditPageState extends State<AppAuditPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _apps = [];
  bool _isLoading = true;
  String _tab = 'pending'; // pending / all

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadApps();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadApps() async {
    setState(() => _isLoading = true);
    try {
      if (_tab == 'pending') {
        final result = await DioClient().get('/admin/apps/pending');
        setState(() {
          _apps = result['data'] ?? [];
          _isLoading = false;
        });
      } else {
        final result = await DioClient().get('/admin/apps');
        setState(() {
          _apps = result['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _updateStatus(int id, String status) async {
    try {
      await DioClient().patch('/admin/apps/$id/status', data: {'status': status});
      if (mounted) {
        showSuccess(context, status == 'published' ? '审核通过' : status == 'archived' ? '已下架' : '已拒绝');
        _loadApps();
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('软件审核'),
        bottom: TabBar(controller: _tabController,
          tabs: [Tab(text: '待审核'), Tab(text: '全部软件')],
          onTap: (index) {
            setState(() => _tab = index == 0 ? 'pending' : 'all');
            _loadApps();
          },
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadApps,
        child: _isLoading
            ? LoadingView()
            : _apps.isEmpty
                ? EmptyView(icon: Icons.check_circle_outline, message: _tab == 'pending' ? '暂无待审核软件' : '暂无软件')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _apps.length,
                    itemBuilder: (context, index) {
                      final app = _apps[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                Container(width: 48, height: 48, decoration: BoxDecoration(gradient: LinearGradient(colors: [ThemeProvider.primaryColor, ThemeProvider.secondaryColor]), borderRadius: BorderRadius.circular(12)), child: Icon(Icons.apps, color: Colors.white)),
                                SizedBox(width: 12),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(app['name'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)), Text('${app['category'] ?? ''} · v${app['version'] ?? '1.0'}', style: TextStyle(color: Colors.grey, fontSize: 12))])),
                                _buildStatusBadge(app['status']),
                              ]),
                              SizedBox(height: 12),
                              InkWell(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailPage(appId: app['id']))), child: Text(app['intro'] ?? '暂无介绍', style: TextStyle(color: Colors.grey[600], fontSize: 14), maxLines: 2, overflow: TextOverflow.ellipsis)),
                              SizedBox(height: 8),
                              Text('发布者: ${app['display_name'] ?? app['username'] ?? '匿名'}', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              SizedBox(height: 16),
                              if (app['status'] == 'pending')
                                Row(children: [
                                  Expanded(child: OutlinedButton.icon(onPressed: () => _updateStatus(app['id'], 'rejected'), icon: Icon(Icons.close, color: Colors.red), label: Text('拒绝', style: TextStyle(color: Colors.red)), style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.red)))),
                                  SizedBox(width: 12),
                                  Expanded(child: ElevatedButton.icon(onPressed: () => _updateStatus(app['id'], 'published'), icon: Icon(Icons.check), label: Text('通过'))),
                                ])
                              else if (app['status'] == 'published')
                                Row(children: [
                                  Expanded(child: OutlinedButton.icon(onPressed: () => _updateStatus(app['id'], 'archived'), icon: Icon(Icons.archive_outlined, color: Colors.orange), label: Text('下架', style: TextStyle(color: Colors.orange)), style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.orange)))),
                                  SizedBox(width: 12),
                                  Expanded(child: OutlinedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailPage(appId: app['id']))), child: Text('查看详情'))),
                                ])
                              else if (app['status'] == 'archived')
                                Row(children: [
                                  Expanded(child: ElevatedButton.icon(onPressed: () => _updateStatus(app['id'], 'published'), icon: Icon(Icons.unarchive_outlined), label: Text('恢复'))),
                                ]),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Widget _buildStatusBadge(String? status) {
    Color color;
    String text;
    switch (status) {
      case 'published':
        color = Colors.green;
        text = '已发布';
        break;
      case 'archived':
        color = Colors.grey;
        text = '已下架';
        break;
      case 'rejected':
        color = Colors.red;
        text = '已拒绝';
        break;
      default:
        color = Colors.orange;
        text = '待审核';
    }
    return Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)));
  }
}
