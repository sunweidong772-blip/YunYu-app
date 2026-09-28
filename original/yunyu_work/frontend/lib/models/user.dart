class UserModel {
  final int id;
  final String username;
  final String role;
  final String? adminRoleCode;
  final String? displayName;
  final String? bio;
  final String? avatarUrl;
  final int level;
  final int exp;
  final int points;
  final Map<String, dynamic>? levelProgress;
  final String? status;
  final int? posts;
  final int? favorites;
  final int? following;
  final int? followers;

  UserModel({
    required this.id,
    required this.username,
    required this.role,
    this.adminRoleCode,
    this.displayName,
    this.bio,
    this.avatarUrl,
    this.level = 1,
    this.exp = 0,
    this.points = 0,
    this.levelProgress,
    this.status,
    this.posts,
    this.favorites,
    this.following,
    this.followers,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      role: json['role'] ?? 'user',
      adminRoleCode: json['admin_role_code'],
      displayName: json['display_name'],
      bio: json['bio'],
      avatarUrl: json['avatar_url'],
      level: json['level'] ?? 1,
      exp: json['exp'] ?? 0,
      points: json['points'] ?? 0,
      levelProgress: json['level_progress'] != null ? Map<String, dynamic>.from(json['level_progress']) : null,
      status: json['status'],
      posts: json['posts'],
      favorites: json['favorites'],
      following: json['following'],
      followers: json['followers'],
    );
  }

  bool get isAdmin => role == 'admin';
  bool get isOwner => adminRoleCode == 'owner';

  String get levelTitle {
    if (level >= 100) return '云屿传说 👑';
    if (level >= 81) return '云屿守望者 🏝️';
    if (level >= 61) return '星海航行者 🌌';
    if (level >= 41) return '逐云探索者 ☁️';
    if (level >= 21) return '拾光行者 ✨';
    if (level >= 11) return '听风旅人 🍃';
    return '初见云屿 🌱';
  }

  String get adminTitle {
    switch (adminRoleCode) {
      case 'owner': return '👑 云屿岛主';
      case 'chief': return '🏛️ 云屿议长';
      case 'super': return '🛡️ 云屿守护者';
      case 'moderator': return '⚖️ 审核管理员';
      case 'inspector': return '🔍 巡检管理员';
      case 'community': return '🧭 普通管理员';
      default: return '';
    }
  }
}
