import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';

class UserManagePage extends StatefulWidget {
  const UserManagePage({super.key});

  @override
  State<UserManagePage> createState() => _UserManagePageState();
}

class _UserManagePageState extends State<UserManagePage> {
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/admin/users', queryParameters: {'limit': 100});
      setState(() {
        _users = result['data']['list'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _toggleBan(int id, String currentStatus) async {
    final newStatus = currentStatus == 'banned' ? 'active' : 'banned';
    try {
      await DioClient().patch('/admin/users/$id/status', data: {'status': newStatus});
      if (mounted) {
        showSuccess(context, newStatus == 'banned' ? '已封禁' : '已解封');
        _loadUsers();
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _setAdmin(int id, String? currentRole) async {
    final result = await showDialog<String>(
      context: context,
      builder: (d) => SimpleDialog(
        title: Text('设置管理员角色'),
        children: [
          SimpleDialogOption(child: Text('普通用户'), onPressed: () => Navigator.pop(d, 'user')),
          SimpleDialogOption(child: Text('普通管理员'), onPressed: () => Navigator.pop(d, 'community')),
          SimpleDialogOption(child: Text('巡检管理员'), onPressed: () => Navigator.pop(d, 'inspector')),
          SimpleDialogOption(child: Text('审核管理员'), onPressed: () => Navigator.pop(d, 'moderator')),
          SimpleDialogOption(child: Text('超级管理员'), onPressed: () => Navigator.pop(d, 'super')),
          SimpleDialogOption(child: Text('云屿议长'), onPressed: () => Navigator.pop(d, 'chief')),
        ],
      ),
    );
    if (result != null) {
      try {
        await DioClient().patch('/admin/users/$id/role', data: {
          'role': result == 'user' ? 'user' : 'admin',
          'admin_role_code': result == 'user' ? null : result,
        });
        if (mounted) {
          showSuccess(context, '设置成功');
          _loadUsers();
        }
      } catch (e) {
        if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('用户管理')),
      body: RefreshIndicator(
        onRefresh: _loadUsers,
        child: _isLoading
            ? LoadingView()
            : _users.isEmpty
                ? EmptyView(icon: Icons.people_outline, message: '暂无用户')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _users.length,
                    itemBuilder: (context, index) {
                      final user = _users[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: UserAvatar(displayName: user['display_name'] ?? user['username'], avatarUrl: user['avatar_url'], size: 46),
                          title: Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(user['display_name'] ?? user['username'] ?? '', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              LevelBadge(level: user['level'] ?? 1, adminRoleCode: user['role'] == 'admin' ? user['admin_role_code'] : null),
                              if (user['status'] == 'banned')
                                Container(padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(4)), child: Text('已封禁', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold))),
                            ],
                          ),
                          subtitle: Text('@${user['username']} · ${user['created_at']?.toString().substring(0, 10) ?? ''}', style: TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                          trailing: PopupMenuButton<String>(
                            onSelected: (value) {
                              if (value == 'ban') _toggleBan(user['id'], user['status']);
                              if (value == 'admin') _setAdmin(user['id'], user['role']);
                            },
                            itemBuilder: (context) => [
                              PopupMenuItem(value: 'admin', child: Text('设置管理员')),
                              PopupMenuItem(value: 'ban', child: Text(user['status'] == 'banned' ? '解封' : '封禁')),
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
