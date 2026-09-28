import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../post/post_detail_page.dart';

class PostAuditPage extends StatefulWidget {
  const PostAuditPage({super.key});

  @override
  State<PostAuditPage> createState() => _PostAuditPageState();
}

class _PostAuditPageState extends State<PostAuditPage> {
  List<dynamic> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/admin/posts/pending');
      setState(() {
        _posts = result['data'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _auditPost(int id, String status, {String? reason}) async {
    try {
      await DioClient().patch('/admin/posts/$id/status', data: {'status': status, 'reject_reason': reason});
      if (mounted) {
        showSuccess(context, status == 'published' ? '审核通过' : '已拒绝');
        _loadPosts();
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _showRejectDialog(int id) async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('拒绝帖子'),
        content: TextField(controller: controller, decoration: InputDecoration(labelText: '拒绝原因'), maxLines: 2),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('确认拒绝')),
        ],
      ),
    );
    if (result == true) _auditPost(id, 'rejected', reason: controller.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('帖子审核')),
      body: RefreshIndicator(
        onRefresh: _loadPosts,
        child: _isLoading
            ? LoadingView()
            : _posts.isEmpty
                ? EmptyView(icon: Icons.check_circle_outline, message: '暂无待审核帖子')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _posts.length,
                    itemBuilder: (context, index) {
                      final post = _posts[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                CircleAvatar(child: Text((post['display_name'] ?? post['username'] ?? '?')[0])),
                                SizedBox(width: 12),
                                Expanded(child: Text(post['display_name'] ?? post['username'] ?? '', style: TextStyle(fontWeight: FontWeight.bold))),
                                Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text('待审核', style: TextStyle(color: Colors.orange, fontSize: 11, fontWeight: FontWeight.bold))),
                              ]),
                              SizedBox(height: 12),
                              InkWell(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailPage(postId: post['id']))), child: Text(post['title'] ?? '', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, decoration: TextDecoration.underline))),
                              SizedBox(height: 8),
                              Text(post['content'] ?? '', style: TextStyle(color: Colors.grey[600], fontSize: 14), maxLines: 3, overflow: TextOverflow.ellipsis),
                              SizedBox(height: 16),
                              Row(children: [
                                Expanded(child: OutlinedButton.icon(onPressed: () => _showRejectDialog(post['id']), icon: Icon(Icons.close, color: Colors.red), label: Text('拒绝', style: TextStyle(color: Colors.red)), style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.red)))),
                                SizedBox(width: 12),
                                Expanded(child: ElevatedButton.icon(onPressed: () => _auditPost(post['id'], 'published'), icon: Icon(Icons.check), label: Text('通过'))),
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
}
