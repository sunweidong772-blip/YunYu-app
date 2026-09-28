import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';

class StatsPage extends StatefulWidget {
  const StatsPage({super.key});

  @override
  State<StatsPage> createState() => _StatsPageState();
}

class _StatsPageState extends State<StatsPage> {
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
    return Scaffold(
      appBar: AppBar(title: Text('数据统计')),
      body: RefreshIndicator(
        onRefresh: _loadStats,
        child: _isLoading
            ? LoadingView()
            : ListView(
                padding: EdgeInsets.all(16),
                children: [
                  Text('用户数据', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('总用户数', '${_stats?['total_users'] ?? 0}', Icons.people, Colors.blue),
                      _buildStatCard('今日注册', '${_stats?['today_users'] ?? 0}', Icons.person_add, Colors.green),
                    ],
                  ),
                  SizedBox(height: 24),
                  Text('软件数据', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('总软件数', '${_stats?['total_apps'] ?? 0}', Icons.apps, Colors.purple),
                      _buildStatCard('已发布', '${_stats?['published_apps'] ?? 0}', Icons.check_circle, Colors.green),
                      _buildStatCard('待审核', '${_stats?['pending_apps'] ?? 0}', Icons.hourglass_empty, Colors.orange),
                      _buildStatCard('总下载量', '${_stats?['total_downloads'] ?? 0}', Icons.download, Colors.teal),
                    ],
                  ),
                  SizedBox(height: 24),
                  Text('社区数据', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('总帖子数', '${_stats?['total_posts'] ?? 0}', Icons.article, Colors.red),
                      _buildStatCard('已发布', '${_stats?['published_posts'] ?? 0}', Icons.check_circle, Colors.green),
                      _buildStatCard('待审核', '${_stats?['pending_posts'] ?? 0}', Icons.hourglass_empty, Colors.orange),
                      _buildStatCard('待处理举报', '${_stats?['pending_reports'] ?? 0}', Icons.report, Colors.redAccent),
                    ],
                  ),
                  SizedBox(height: 24),
                  Text('热门帖子排行', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),
                  if ((_stats?['hot_posts'] ?? []).isEmpty)
                    Padding(padding: EdgeInsets.all(20), child: Center(child: Text('暂无数据', style: TextStyle(color: Colors.grey))))
                  else
                    ...(_stats!['hot_posts'] as List).asMap().entries.map((entry) {
                      final index = entry.key;
                      final post = entry.value;
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: index < 3 ? [Colors.red, Colors.orange, Colors.yellow][index] : Colors.grey,
                            child: Text('${index + 1}', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                          title: Text(post['title'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                          subtitle: Text('浏览 ${post['view_count'] ?? 0} · 点赞 ${post['like_count'] ?? 0} · 评论 ${post['comment_count'] ?? 0}'),
                        ),
                      );
                    }),
                  SizedBox(height: 24),
                ],
              ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      margin: EdgeInsets.all(4),
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(children: [
              Icon(icon, color: color, size: 20),
              Spacer(),
              Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ]),
            SizedBox(height: 8),
            Text(title, style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
