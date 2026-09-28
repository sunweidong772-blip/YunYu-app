import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../core/dio_client.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  bool _isInitializing = true;
  String? _error;

  UserModel? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isInitializing;
  String? get error => _error;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isOwner => _user?.isOwner ?? false;

  // 初始化：从本地存储读取登录状态
  Future<void> init() async {
    _isInitializing = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token != null) {
        try {
          await loadUserProfile();
        } catch (e) {
          // 网络失败时保留token，不清除登录状态，下次启动再试
          _error = '网络连接失败，请稍后重试';
          notifyListeners();
        }
      }
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  // 登录
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await DioClient().post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      final data = result['data'];
      final token = data['token'];

      // 保存token到本地
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);

      // 保存用户信息
      _user = UserModel.fromJson(data);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 注册
  Future<bool> register(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await DioClient().post('/auth/register', data: {
        'username': username,
        'password': password,
      });

      final data = result['data'];
      final token = data['token'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);

      _user = UserModel.fromJson(data);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 加载用户资料
  Future<void> loadUserProfile() async {
    try {
      final result = await DioClient().get('/me');
      _user = UserModel.fromJson(result['data']);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // 更新用户资料
  Future<bool> updateProfile({String? displayName, String? bio, String? avatarUrl}) async {
    try {
      final data = <String, dynamic>{};
      if (displayName != null) data['display_name'] = displayName;
      if (bio != null) data['bio'] = bio;
      if (avatarUrl != null) data['avatar_url'] = avatarUrl;

      final result = await DioClient().patch('/me', data: data);
      // 直接用接口返回的最新用户信息更新本地状态，确保头像立刻显示
      if (result['data'] != null && _user != null) {
        // 合并旧用户信息和接口返回的新数据
        final oldData = {
          'id': _user!.id,
          'username': _user!.username,
          'role': _user!.role,
          'admin_role_code': _user!.adminRoleCode,
          'display_name': _user!.displayName,
          'bio': _user!.bio,
          'avatar_url': _user!.avatarUrl,
          'level': _user!.level,
          'exp': _user!.exp,
          'points': _user!.points,
          'status': _user!.status,
          'posts': _user!.posts,
          'favorites': _user!.favorites,
          'following': _user!.following,
          'followers': _user!.followers,
        };
        _user = UserModel.fromJson({...oldData, ...result['data']});
        notifyListeners();
      }
      // 同时重新拉取完整用户信息
      try {
        await loadUserProfile();
      } catch (_) {}
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // 登出：清除所有数据，确保不串号
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.clear(); // 清除所有本地数据
    _user = null;
    _error = null;
    notifyListeners();
  }

  // 清除错误
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
