import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import 'post_detail_page.dart';

class MyPostsPage extends StatefulWidget {
  const MyPostsPage({super.key});

  @override
  State<MyPostsPage> createState() => _MyPostsPageState();
}

class _MyPostsPageState extends State<MyPostsPage> {
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
      final result = await DioClient().get('/my/posts');
      setState(() {
        _posts = result['data'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'pending': return '待审核';
      case 'published': return '已发布';
      case 'rejected': return '已拒绝';
      default: return status ?? '未知';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'pending': return Colors.orange;
      case 'published': return Colors.green;
      case 'rejected': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('我的帖子')),
      body: RefreshIndicator(
        onRefresh: _loadPosts,
        child: _isLoading
            ? LoadingView()
            : _posts.isEmpty
                ? EmptyView(icon: Icons.article_outlined, message: '暂无帖子')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _posts.length,
                    itemBuilder: (context, index) {
                      final post = _posts[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailPage(postId: post['id']))),
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(children: [
                                  Expanded(child: Text(post['title'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: _getStatusColor(post['status']).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                    child: Text(_getStatusText(post['status']), style: TextStyle(color: _getStatusColor(post['status']), fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ]),
                                SizedBox(height: 8),
                                Text(post['content'] ?? '', style: TextStyle(color: Colors.grey[600], fontSize: 14), maxLines: 2, overflow: TextOverflow.ellipsis),
                                SizedBox(height: 12),
                                Row(children: [
                                  Icon(Icons.visibility, size: 14, color: Colors.grey),
                                  SizedBox(width: 4),
                                  Text('${post['view_count'] ?? 0}', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                  SizedBox(width: 16),
                                  Icon(Icons.favorite, size: 14, color: Colors.grey),
                                  SizedBox(width: 4),
                                  Text('${post['like_count'] ?? 0}', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                  SizedBox(width: 16),
                                  Icon(Icons.comment, size: 14, color: Colors.grey),
                                  SizedBox(width: 4),
                                  Text('${post['comment_count'] ?? 0}', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                ]),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
