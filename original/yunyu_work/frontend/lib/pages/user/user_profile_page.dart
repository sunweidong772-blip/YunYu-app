import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/dio_client.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common_widgets.dart';
import '../message/chat_page.dart';

class UserProfilePage extends StatefulWidget {
  final int userId;
  const UserProfilePage({super.key, required this.userId});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  dynamic _user;
  bool _isLoading = true;
  bool _isFollowing = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final result = await DioClient().get('/users/${widget.userId}');
      setState(() {
        _user = result['data'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _toggleFollow() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    try {
      await DioClient().post('/users/${widget.userId}/follow');
      setState(() => _isFollowing = !_isFollowing);
      if (mounted) showSuccess(context, _isFollowing ? '关注成功' : '已取消关注');
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  void _sendMessage() {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      showError(context, '请先登录');
      return;
    }
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => ChatPage(otherUserId: widget.userId, otherUserName: _user?['display_name'] ?? _user?['username'] ?? ''),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isMe = auth.isLoggedIn && auth.user?.id == widget.userId;

    return Scaffold(
      appBar: AppBar(title: Text('用户主页')),
      body: _isLoading
          ? LoadingView()
          : _user == null
              ? EmptyView(icon: Icons.error_outline, message: '用户不存在')
              : ListView(
                  children: [
                    Container(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        children: [
                          UserAvatar(avatarUrl: _user['avatar_url'], displayName: _user['display_name'] ?? _user['username'], size: 80),
                          SizedBox(height: 16),
                          Text(_user['display_name'] ?? _user['username'] ?? '', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          SizedBox(height: 8),
                          LevelBadge(level: _user['level'] ?? 1),
                          SizedBox(height: 8),
                          if (_user['bio'] != null && _user['bio'].toString().isNotEmpty)
                            Text(_user['bio'], style: TextStyle(color: Colors.grey, fontSize: 14), textAlign: TextAlign.center),
                          SizedBox(height: 16),
                          Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
                            _buildStat('帖子', _user['posts'] ?? 0),
                            _buildStat('关注', _user['following'] ?? 0),
                            _buildStat('粉丝', _user['followers'] ?? 0),
                          ]),
                          SizedBox(height: 24),
                          if (!isMe)
                            Row(children: [
                              Expanded(child: OutlinedButton.icon(
                                onPressed: _toggleFollow,
                                icon: Icon(_isFollowing ? Icons.check : Icons.person_add),
                                label: Text(_isFollowing ? '已关注' : '关注'),
                              )),
                              SizedBox(width: 12),
                              Expanded(child: ElevatedButton.icon(
                                onPressed: _sendMessage,
                                icon: Icon(Icons.message),
                                label: Text('私信'),
                              )),
                            ]),
                        ],
                      ),
                    ),
                    Divider(),
                    ListTile(
                      leading: Icon(Icons.article_outlined),
                      title: Text('TA的帖子'),
                      trailing: Icon(Icons.chevron_right),
                      onTap: () {
                        showSuccess(context, '功能开发中');
                      },
                    ),
                  ],
                ),
    );
  }

  Widget _buildStat(String label, dynamic count) {
    return Column(children: [
      Text('$count', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      SizedBox(height: 4),
      Text(label, style: TextStyle(color: Colors.grey, fontSize: 12)),
    ]);
  }
}
