import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../post/post_detail_page.dart';
import '../app/app_detail_page.dart';

class ReportPage extends StatefulWidget {
  const ReportPage({super.key});

  @override
  State<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends State<ReportPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _reports = [];
  bool _isLoading = true;
  String _tab = 'pending';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadReports();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadReports() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/admin/reports', queryParameters: {'status': _tab});
      setState(() {
        _reports = result['data'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _handleReport(int id, String status) async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(status == 'resolved' ? '处理举报' : '驳回举报'),
        content: TextField(controller: controller, decoration: InputDecoration(labelText: '处理说明'), maxLines: 2),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('确认')),
        ],
      ),
    );
    if (result == true) {
      try {
        await DioClient().patch('/admin/reports/$id', data: {'status': status, 'handle_note': controller.text});
        if (mounted) {
          showSuccess(context, '处理成功');
          _loadReports();
        }
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  // 删除被举报的帖子
  Future<void> _deleteReportedPost(int postId, int reportId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('确认删除'),
        content: Text('确定要删除这篇被举报的帖子吗？删除后无法恢复。'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('删除')),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await DioClient().delete('/posts/$postId');
        // 同时标记举报为已处理
        await DioClient().patch('/admin/reports/$reportId', data: {'status': 'resolved', 'handle_note': '帖子已删除'});
        if (mounted) {
          showSuccess(context, '帖子已删除');
          _loadReports();
        }
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  // 下架被举报的软件
  Future<void> _archiveReportedApp(int appId, int reportId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('确认下架'),
        content: Text('确定要下架这个被举报的软件吗？下架后用户将无法下载。'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('下架')),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await DioClient().patch('/admin/apps/$appId/status', data: {'status': 'archived'});
        // 同时标记举报为已处理
        await DioClient().patch('/admin/reports/$reportId', data: {'status': 'resolved', 'handle_note': '软件已下架'});
        if (mounted) {
          showSuccess(context, '软件已下架');
          _loadReports();
        }
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('举报处理'),
        bottom: TabBar(controller: _tabController,
          tabs: [Tab(text: '待处理'), Tab(text: '已处理')],
          onTap: (index) {
            setState(() => _tab = index == 0 ? 'pending' : 'resolved');
            _loadReports();
          },
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadReports,
        child: _isLoading
            ? LoadingView()
            : _reports.isEmpty
                ? EmptyView(icon: Icons.check_circle_outline, message: _tab == 'pending' ? '暂无待处理举报' : '暂无已处理举报')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _reports.length,
                    itemBuilder: (context, index) {
                      final report = _reports[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                Icon(Icons.report, color: Colors.red),
                                SizedBox(width: 8),
                                Text('举报${report['target_type']}', style: TextStyle(fontWeight: FontWeight.bold)),
                                Spacer(),
                                Text(report['created_at']?.toString().substring(0, 16) ?? '', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              ]),
                              SizedBox(height: 12),
                              Text('举报原因: ${report['reason'] ?? ''}', style: TextStyle(fontSize: 14)),
                              SizedBox(height: 8),
                              Text('举报人: ${report['reporter_name'] ?? report['reporter_display'] ?? '匿名'}', style: TextStyle(color: Colors.grey, fontSize: 12)),
                              if (report['handle_note'] != null) ...[
                                SizedBox(height: 8),
                                Text('处理说明: ${report['handle_note']}', style: TextStyle(color: Colors.green, fontSize: 12)),
                              ],
                              if (_tab == 'pending') ...[
                                SizedBox(height: 12),
                                // 查看被举报内容
                                if (report['target_type'] == 'post')
                                  OutlinedButton.icon(
                                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailPage(postId: report['target_id']))),
                                    icon: Icon(Icons.visibility_outlined, size: 18),
                                    label: Text('查看帖子', style: TextStyle(fontSize: 13)),
                                    style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                                  ),
                                if (report['target_type'] == 'app')
                                  OutlinedButton.icon(
                                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailPage(appId: report['target_id']))),
                                    icon: Icon(Icons.visibility_outlined, size: 18),
                                    label: Text('查看软件', style: TextStyle(fontSize: 13)),
                                    style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                                  ),
                                SizedBox(height: 12),
                                // 快速处理按钮
                                Row(children: [
                                  if (report['target_type'] == 'post')
                                    Expanded(child: OutlinedButton.icon(
                                      onPressed: () => _deleteReportedPost(report['target_id'], report['id']),
                                      icon: Icon(Icons.delete_outline, color: Colors.red, size: 18),
                                      label: Text('删除帖子', style: TextStyle(color: Colors.red, fontSize: 12)),
                                      style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.red), padding: EdgeInsets.symmetric(vertical: 8)),
                                    )),
                                  if (report['target_type'] == 'app')
                                    Expanded(child: OutlinedButton.icon(
                                      onPressed: () => _archiveReportedApp(report['target_id'], report['id']),
                                      icon: Icon(Icons.archive_outlined, color: Colors.orange, size: 18),
                                      label: Text('下架软件', style: TextStyle(color: Colors.orange, fontSize: 12)),
                                      style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.orange), padding: EdgeInsets.symmetric(vertical: 8)),
                                    )),
                                  if (report['target_type'] == 'post' || report['target_type'] == 'app')
                                    SizedBox(width: 6),
                                  Expanded(child: OutlinedButton.icon(onPressed: () => _handleReport(report['id'], 'rejected'), icon: Icon(Icons.close, color: Colors.grey, size: 18), label: Text('驳回', style: TextStyle(color: Colors.grey, fontSize: 12)))),
                                  SizedBox(width: 6),
                                  Expanded(child: ElevatedButton.icon(onPressed: () => _handleReport(report['id'], 'resolved'), icon: Icon(Icons.check, size: 18), label: Text('受理', style: TextStyle(fontSize: 12)))),
                                ]),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
