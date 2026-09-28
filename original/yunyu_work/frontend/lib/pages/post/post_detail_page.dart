import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/yunyu_v21_visual.dart';
import 'package:provider/provider.dart';
import '../../core/dio_client.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common_widgets.dart';
import '../message/chat_page.dart';
import '../home/community_tab.dart';
import '../user/user_profile_page.dart';

class PostDetailPage extends StatefulWidget {
  final int postId;
  const PostDetailPage({super.key, required this.postId});

  @override
  State<PostDetailPage> createState() => _PostDetailPageState();
}

class _PostDetailPageState extends State<PostDetailPage> {
  dynamic _post;
  List<dynamic> _comments = [];
  bool _isLoading = true;
  bool _isLiked = false;
  bool _isFollowing = false;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final postResult = await DioClient().get('/posts/${widget.postId}');
      _post = postResult['data'];
      final commentsResult = await DioClient().get('/posts/${widget.postId}/comments');
      _comments = commentsResult['data'] ?? [];
      // 检查是否已点赞和关注
      final auth = context.read<AuthProvider>();
      if (auth.isLoggedIn && _post['user_id'] != null) {
        try {
          final likedResult = await DioClient().get('/posts/${widget.postId}/liked');
          _isLiked = likedResult['data']['liked'] ?? false;
        } catch (_) {}
      }
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _toggleLike() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    try {
      await DioClient().post('/posts/${widget.postId}/like');
      setState(() {
        _isLiked = !_isLiked;
        if (_post != null) _post['like_count'] = (_post['like_count'] ?? 0) + (_isLiked ? 1 : -1);
      });
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _submitComment() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    final content = _commentController.text.trim();
    if (content.isEmpty) {
      showError(context, '评论内容不能为空');
      return;
    }
    try {
      await DioClient().post('/posts/${widget.postId}/comments', data: {'content': content});
      _commentController.clear();
      await _loadData();
      if (mounted) showSuccess(context, '评论成功');
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  bool _isPostAuthor() {
    final auth = context.read<AuthProvider>();
    return auth.isLoggedIn && auth.user?.id == _post['user_id'];
  }

  bool _isAdmin() {
    final auth = context.read<AuthProvider>();
    return auth.isLoggedIn && (auth.user?.adminRoleCode != null);
  }

  bool _canDelete() {
    return _isPostAuthor() || _isAdmin();
  }

  Future<void> _handleMenuAction(String action) async {
    if (action == 'delete') {
      _deletePost();
    } else if (action == 'top') {
      _toggleTop();
    } else if (action == 'report') {
      _reportPost();
    }
  }

  Future<void> _deletePost() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('确认删除'),
        content: Text('确定要删除这篇帖子吗？删除后无法恢复。'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: Text('取消')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: Text('删除')),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await DioClient().delete('/posts/${widget.postId}');
        if (mounted) {
          showSuccess(context, '删除成功');
          // 通知社区页面刷新
          CommunityTabState.refreshCallback?.call();
          Navigator.pop(context, true);
        }
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  Future<void> _toggleTop() async {
    try {
      final isTop = _post['is_top'] == true;
      await DioClient().patch('/admin/posts/${widget.postId}/top', data: {'is_top': !isTop});
      setState(() => _post['is_top'] = !isTop);
      if (mounted) showSuccess(context, isTop ? '已取消置顶' : '置顶成功');
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _reportPost() async {
    final controller = TextEditingController();
    final result = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text('举报帖子'),
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
          'target_type': 'post',
          'target_id': widget.postId,
          'reason': controller.text.trim(),
        });
        if (mounted) showSuccess(context, '举报成功，我们会尽快处理');
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  Future<void> _toggleFollow() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    try {
      await DioClient().post('/users/${_post['user_id']}/follow');
      setState(() => _isFollowing = !_isFollowing);
      if (mounted) showSuccess(context, _isFollowing ? '关注成功' : '已取消关注');
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _sendMessage() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    // 跳转到聊天页面
    try {
      Navigator.push(context, MaterialPageRoute(
        builder: (_) => ChatPage(otherUserId: _post['user_id'], otherUserName: _post['display_name'] ?? _post['username'] ?? ''),
      ));
    } catch (e) {
      if (mounted) showError(context, '打开聊天失败');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('帖子详情'),
        actions: [
          PopupMenuButton<String>(
            onSelected: _handleMenuAction,
            itemBuilder: (context) => [
              if (_canDelete()) PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline, size: 20), SizedBox(width: 8), Text('删除帖子')])),
              if (_isAdmin()) PopupMenuItem(value: 'top', child: Row(children: [Icon(Icons.vertical_align_top, size: 20), SizedBox(width: 8), Text(_post['is_top'] == true ? '取消置顶' : '置顶帖子')])),
              PopupMenuItem(value: 'report', child: Row(children: [Icon(Icons.flag_outlined, size: 20), SizedBox(width: 8), Text('举报')])),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? LoadingView()
          : _post == null
              ? EmptyView(icon: Icons.error_outline, message: '帖子不存在')
              : Column(
                  children: [
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 14, YunyuSpacing.page, 28),
                        children: [
                          YunyuSectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          // 作者信息
                          Row(children: [
                            UserAvatar(avatarUrl: _post['avatar_url'], displayName: _post['display_name'] ?? _post['username'], size: 48, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => UserProfilePage(userId: _post['user_id'])))),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_post['display_name'] ?? _post['username'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  SizedBox(height: 4),
                                  LevelBadge(level: _post['user_level'] ?? 1),
                                ],
                              ),
                            ),
                            if (_post['user_id'] != null && !_isPostAuthor())
                              Row(children: [
                                OutlinedButton.icon(
                                  onPressed: _toggleFollow,
                                  icon: Icon(_isFollowing ? Icons.check : Icons.person_add, size: 18),
                                  label: Text(_isFollowing ? '已关注' : '关注', style: TextStyle(fontSize: 12)),
                                  style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                                ),
                                SizedBox(width: 8),
                                IconButton(
                                  onPressed: _sendMessage,
                                  icon: Icon(Icons.message_outlined, size: 22),
                                  tooltip: '私信',
                                ),
                              ]),
                          ]),
                          ]),
                          ),
                          const SizedBox(height: 14),
                          YunyuSectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          // 标题
                          Text(_post['title'] ?? '', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          SizedBox(height: 16),
                          // 内容
                          Text(_post['content'] ?? '', style: TextStyle(fontSize: 15, height: 1.6)),
                          SizedBox(height: 20),
                          // 统计
                          Row(children: [
                            _buildStat(Icons.remove_red_eye_outlined, '${_post['view_count'] ?? 0} 浏览'),
                            SizedBox(width: 20),
                            _buildStat(Icons.favorite_border, '${_post['like_count'] ?? 0} 点赞'),
                            SizedBox(width: 20),
                            _buildStat(Icons.comment_outlined, '${_post['comment_count'] ?? 0} 评论'),
                          ]),
                          ])),
                          const SizedBox(height: 22),
                          Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: YunyuSectionHeader(eyebrow: 'ISLAND DISCUSSION', title: '评论 (${_comments.length})')),
                          const SizedBox(height: 12),
                          if (_comments.isEmpty)
                            Padding(padding: EdgeInsets.all(20), child: Center(child: Text('暂无评论，快来抢沙发', style: TextStyle(color: Colors.grey))))
                          else
                            ..._comments.map((comment) => _buildCommentItem(comment)),
                        ],
                      ),
                    ),
                    // 评论输入框
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, border: Border(top: BorderSide(color: YunyuColors.border.withOpacity(.7))), boxShadow: YunyuShadow.card),
                      child: SafeArea(
                        child: Row(children: [
                          Expanded(
                            child: TextField(
                              controller: _commentController,
                              decoration: InputDecoration(hintText: '写下你的评论...', contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                              onSubmitted: (_) => _submitComment(),
                            ),
                          ),
                          SizedBox(width: 12),
                          IconButton(
                            onPressed: _toggleLike,
                            icon: Icon(_isLiked ? Icons.favorite : Icons.favorite_border, color: _isLiked ? Colors.red : Colors.grey),
                            iconSize: 28,
                          ),
                          SizedBox(width: 8),
                          ElevatedButton(onPressed: _submitComment, child: Text('发送')),
                        ]),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildStat(IconData icon, String text) {
    return Row(children: [
      Icon(icon, size: 16, color: Colors.grey),
      SizedBox(width: 4),
      Text(text, style: TextStyle(color: Colors.grey, fontSize: 13)),
    ]);
  }

  Widget _buildCommentItem(dynamic comment) {
    return YunyuSectionCard(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          UserAvatar(avatarUrl: comment['avatar_url'], displayName: comment['display_name'] ?? comment['username'], size: 40, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => UserProfilePage(userId: comment['user_id'])))),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Text(comment['display_name'] ?? comment['username'] ?? '', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  LevelBadge(level: comment['user_level'] ?? 1),
                ]),
                SizedBox(height: 6),
                Text(comment['content'] ?? '', style: TextStyle(fontSize: 14, height: 1.5)),
                SizedBox(height: 4),
                Text(_formatTime(comment['created_at']), style: TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String? time) {
    if (time == null) return '';
    try {
      final dt = DateTime.parse(time);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return '刚刚';
      if (diff.inHours < 1) return '${diff.inMinutes}分钟前';
      if (diff.inDays < 1) return '${diff.inHours}小时前';
      return '${diff.inDays}天前';
    } catch (_) {
      return time;
    }
  }
}
