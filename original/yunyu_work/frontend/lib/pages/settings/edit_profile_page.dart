import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/auth_provider.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../../core/yunyu_v26_detail.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  late TextEditingController _displayNameController;
  late TextEditingController _bioController;
  bool _isSaving = false;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _displayNameController = TextEditingController(text: user?.displayName ?? '');
    _bioController = TextEditingController(text: user?.bio ?? '');
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512, maxHeight: 512);
      if (pickedFile != null) {
        setState(() => _isUploading = true);
        try {
          final url = await DioClient().uploadFile('/upload/avatar', pickedFile.path, 'avatar');
          await context.read<AuthProvider>().updateProfile(avatarUrl: url);
          if (mounted) showSuccess(context, '头像更新成功');
        } catch (e) {
          if (mounted) showError(context, '上传失败: ${e.toString().replaceAll('Exception: ', '')}');
        } finally {
          if (mounted) setState(() => _isUploading = false);
        }
      }
    } catch (e) {
      if (mounted) showError(context, '选择图片失败');
    }
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      final success = await context.read<AuthProvider>().updateProfile(
            displayName: _displayNameController.text.trim(),
            bio: _bioController.text.trim(),
          );
      if (success && mounted) {
        showSuccess(context, '保存成功');
        Navigator.pop(context, true);
      } else if (mounted) {
        showError(context, '保存失败');
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: Text('编辑资料'),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text('保存', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 24, YunyuSpacing.page, 32),
        child: Column(
          children: [
            const YunyuDetailHero(eyebrow: 'MY ISLAND', title: '编辑资料', subtitle: '让你的云屿身份更有辨识度', icon: Icons.edit_rounded),
            const SizedBox(height: 24),
            // 头像
            GestureDetector(
              onTap: _isUploading ? null : _pickAvatar,
              child: Stack(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: YunyuColors.brandGradient,
                    ),
                    child: _isUploading
                        ? Center(child: CircularProgressIndicator(color: Colors.white))
                        : user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty
                            ? ClipOval(child: Image.network(user.avatarUrl!, fit: BoxFit.cover, width: 100, height: 100))
                            : Center(child: Text(user?.displayName?.isNotEmpty == true ? user!.displayName![0].toUpperCase() : '?', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold))),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: EdgeInsets.all(6),
                      decoration: BoxDecoration(gradient: YunyuColors.brandGradient, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2), boxShadow: YunyuShadow.elevated),
                      child: Icon(Icons.camera_alt, size: 18, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 8),
            Text('点击更换头像', style: TextStyle(color: Colors.grey, fontSize: 12)),
            SizedBox(height: 32),
            // 昵称
            TextField(
              controller: _displayNameController,
              decoration: InputDecoration(labelText: '昵称', hintText: '请输入昵称'),
              maxLength: 50,
            ),
            SizedBox(height: 16),
            // 用户名（不可修改）
            TextField(
              controller: TextEditingController(text: user?.username ?? ''),
              decoration: InputDecoration(labelText: '用户名', enabled: false),
            ),
            SizedBox(height: 16),
            // 简介
            TextField(
              controller: _bioController,
              decoration: InputDecoration(labelText: '个人简介', hintText: '介绍一下自己吧', alignLabelWithHint: true),
              maxLines: 3,
              maxLength: 500,
            ),
            SizedBox(height: 24),
            // 等级信息
            Align(alignment: Alignment.centerLeft, child: Text('我的成长', style: YunyuTextStyle.title)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(YunyuSpacing.lg),
              decoration: BoxDecoration(gradient: YunyuColors.softGradient, borderRadius: BorderRadius.circular(YunyuRadius.lg), border: Border.all(color: YunyuColors.border.withOpacity(.7))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildInfoItem('等级', 'LV.${user?.level ?? 1}'),
                  _buildInfoItem('经验', '${user?.exp ?? 0}'),
                  _buildInfoItem('积分', '${user?.points ?? 0}'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(children: [
      Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: YunyuColors.primary)),
      SizedBox(height: 4),
      Text(label, style: TextStyle(color: Colors.grey, fontSize: 12)),
    ]);
  }
}
