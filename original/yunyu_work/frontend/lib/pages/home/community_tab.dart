import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/yunyu_design.dart';
import '../../core/yunyu_v21_visual.dart';
import '../../theme/yunyu_community_v13.dart';
import '../../providers/theme_provider.dart';
import '../post/post_detail_page.dart';
import '../post/post_edit_page.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class CommunityTab extends StatefulWidget {
  const CommunityTab({super.key});

  @override
  State<CommunityTab> createState() => CommunityTabState();
}

class CommunityTabState extends State<CommunityTab> {
  // 静态刷新回调，发布/删除帖子后调用
  static VoidCallback? refreshCallback;
  List<dynamic> _posts = [];
  bool _isLoading = true;
  String _sort = 'hot';

  @override
  void initState() {
    super.initState();
    refreshCallback = _loadPosts;
    _loadPosts();
  }

  @override
  void dispose() {
    refreshCallback = null;
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 每次页面显示时重新加载帖子列表，确保审核通过的帖子能立刻看到
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/posts', queryParameters: {'sort': _sort, 'limit': 50});
      setState(() {
        _posts = result['data']['list'] ?? [];
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

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: false,
        toolbarHeight: 58,
        title: Text('云屿', style: YunyuTextStyle.h2.copyWith(letterSpacing: -0.8)),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() => _sort = value);
              _loadPosts();
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: 'hot', child: Text('按热门')),
              PopupMenuItem(value: 'new', child: Text('按最新')),
            ],
            icon: Icon(Icons.sort),
          ),
        ],
      ),
      floatingActionButton: auth.isLoggedIn
          ? FloatingActionButton.extended(
              onPressed: () async {
                final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => PostEditPage()));
                if (result == true) _loadPosts();
              },
              icon: Icon(Icons.edit),
              label: Text('发帖'),
              backgroundColor: ThemeProvider.primaryColor,
            )
          : null,
      body: RefreshIndicator(
        onRefresh: _loadPosts,
        child: _isLoading
            ? LoadingView(message: '加载中...')
            : _posts.isEmpty
                ? EmptyView(icon: Icons.article_outlined, message: '暂无帖子，快来发布第一篇吧')
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 112),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: _posts.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) return Column(children: [YunyuBrandHero(eyebrow: 'YUNYU COMMUNITY', title: '云间相遇', subtitle: '分享你的发现，也听见别人的故事', action: IconButton(onPressed: _loadPosts, icon: const Icon(Icons.refresh_rounded, color: Colors.white))), Padding(padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 4, YunyuSpacing.page, 10), child: YunyuSectionHeader(eyebrow: 'COMMUNITY FEED', title: _sort == 'hot' ? '正在热门' : '最新发布', subtitle: '共 ${_posts.length} 篇内容，看看岛上正在发生什么'))]);
                      final post = _posts[index - 1];
                      return Padding(padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page), child: _buildPostCard(post));
                    },
                  ),
      ),
    );
  }

  Widget _buildPostCard(dynamic post) {
    return YunyuCard(
      margin: const EdgeInsets.only(bottom: YunyuCommunityV13.feedGap),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailPage(postId: post['id']))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            UserAvatar(avatarUrl: post['avatar_url'], displayName: post['display_name'] ?? post['username'], size: YunyuCommunityV13.avatarSize, showBorder: true),
            SizedBox(width: YunyuSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(post['display_name'] ?? post['username'] ?? '匿名', style: YunyuTextStyle.title.copyWith(fontSize: 14)),
                  SizedBox(height: 2),
                  LevelBadge(level: post['user_level'] ?? 1, adminRoleCode: post['admin_role_code']),
                ],
              ),
            ),
            Text(
              _formatTime(post['created_at']),
              style: YunyuTextStyle.tiny,
            ),
          ]),
          SizedBox(height: YunyuSpacing.md),
          Container(width: 34, height: 4, decoration: BoxDecoration(gradient: YunyuColors.brandGradient, borderRadius: BorderRadius.circular(99))),
          SizedBox(height: YunyuSpacing.sm),
          Text(post['title'] ?? '', style: YunyuTextStyle.title, maxLines: 2, overflow: TextOverflow.ellipsis),
          if (post['content'] != null && post['content'].toString().isNotEmpty) ...[
            SizedBox(height: YunyuSpacing.sm),
            Text(post['content'], style: YunyuTextStyle.body.copyWith(color: YunyuColors.textSecondary), maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
          SizedBox(height: YunyuSpacing.md),
          Wrap(spacing: 8, runSpacing: 8, children: [
            YunyuMetricPill(icon: Icons.remove_red_eye_outlined, text: '${post['view_count'] ?? 0}'),
            YunyuMetricPill(icon: Icons.favorite_border, text: '${post['like_count'] ?? 0}'),
            YunyuMetricPill(icon: Icons.comment_outlined, text: '${post['comment_count'] ?? 0}'),
          ]),
          /* legacy stats
          Row(children: [
            _buildStat(Icons.remove_red_eye_outlined, '${post['view_count'] ?? 0}'),
            SizedBox(width: YunyuSpacing.lg),
            _buildStat(Icons.favorite_border, '${post['like_count'] ?? 0}'),
            SizedBox(width: YunyuSpacing.lg),
            _buildStat(Icons.comment_outlined, '${post['comment_count'] ?? 0}'),
          ]), */
        ],
      ),
    );
  }

  String _formatTime(dynamic time) {
    if (time == null) return '';
    try {
      final dt = DateTime.parse(time.toString()).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1) return '刚刚';
      if (diff.inMinutes < 60) return '${diff.inMinutes}分钟前';
      if (diff.inHours < 24) return '${diff.inHours}小时前';
      if (diff.inDays == 1) return '昨天 ${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
      if (diff.inDays < 7) return '${diff.inDays}天前';
      return '${dt.month.toString().padLeft(2,'0')}-${dt.day.toString().padLeft(2,'0')} ${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
    } catch (e) {
      final str = time.toString();
      if (str.length >= 16) return str.substring(5, 10) + ' ' + str.substring(11, 16);
      return str;
    }
  }

  Widget _buildStat(IconData icon, String text) {
    return Row(children: [
      Icon(icon, size: 16, color: YunyuColors.textTertiary),
      SizedBox(width: 4),
      Text(text, style: YunyuTextStyle.caption.copyWith(color: YunyuColors.textTertiary)),
    ]);
  }
}
