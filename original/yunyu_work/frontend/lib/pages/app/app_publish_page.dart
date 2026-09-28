import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../../providers/theme_provider.dart';
import '../../core/yunyu_v24_visual.dart';

class AppPublishPage extends StatefulWidget {
  const AppPublishPage({super.key});

  @override
  State<AppPublishPage> createState() => _AppPublishPageState();
}

class _AppPublishPageState extends State<AppPublishPage> {
  final _nameController = TextEditingController();
  final _categoryController = TextEditingController(text: '实用工具');
  final _introController = TextEditingController();
  final _versionController = TextEditingController(text: '1.0.0');
  final _officialUrlController = TextEditingController();
  String? _apkFilePath;
  String? _apkFileName;
  String? _apkDownloadUrl;
  bool _isUploading = false;
  String? _iconUrl;
  bool _isUploadingIcon = false;
  bool _isSubmitting = false;

  final List<String> _categories = ['实用工具', '社交通讯', '影音娱乐', '学习教育', '游戏', 'Ai工具', '其他'];

  @override
  void dispose() {
    _nameController.dispose();
    _categoryController.dispose();
    _introController.dispose();
    _versionController.dispose();
    _officialUrlController.dispose();
    super.dispose();
  }

  Future<void> _pickApk() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['apk'],
      );
      if (result != null && result.files.single.path != null) {
        setState(() {
          _apkFilePath = result.files.single.path;
          _apkFileName = result.files.single.name;
        });
        await _uploadApk();
      }
    } catch (e) {
      if (mounted) showError(context, '选择文件失败: $e');
    }
  }

  Future<void> _uploadApk() async {
    if (_apkFilePath == null) return;
    setState(() => _isUploading = true);
    try {
      final url = await DioClient().uploadFile('/upload/apk', _apkFilePath!, 'apk');
      setState(() => _apkDownloadUrl = url);
      if (mounted) showSuccess(context, 'APK上传成功');
    } catch (e) {
      if (mounted) showError(context, '上传失败: ${e.toString().replaceAll('Exception: ', '')}');
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final intro = _introController.text.trim();
    final version = _versionController.text.trim();

    if (name.isEmpty) {
      showError(context, '请输入软件名称');
      return;
    }
    if (_apkDownloadUrl == null) {
      showError(context, '请先上传APK文件');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await DioClient().post('/apps', data: {
        'name': name,
        'category': _categoryController.text,
        'intro': intro,
        'version': version,
        'official_url': _officialUrlController.text.trim(),
        'download_url': _apkDownloadUrl,
        'icon_url': _iconUrl,
      });
      if (mounted) {
        showSuccess(context, '发布成功，等待审核');
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _pickIcon() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 512, maxHeight: 512);
      if (pickedFile != null) {
        setState(() => _isUploadingIcon = true);
        try {
          final url = await DioClient().uploadFile('/upload/avatar', pickedFile.path, 'avatar');
          setState(() => _iconUrl = url);
          if (mounted) showSuccess(context, '图标上传成功');
        } catch (e) {
          if (mounted) showError(context, '图标上传失败: ${e.toString().replaceAll('Exception: ', '')}');
        } finally {
          if (mounted) setState(() => _isUploadingIcon = false);
        }
      }
    } catch (e) {
      if (mounted) showError(context, '选择图片失败');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('发布软件'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: (_isSubmitting || _isUploading) ? null : _submit,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  gradient: YunyuColors.brandGradient,
                  borderRadius: BorderRadius.circular(YunyuRadius.pill),
                  boxShadow: [BoxShadow(color: YunyuColors.primary.withOpacity(.35), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: (_isSubmitting || _isUploading)
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.upload_rounded, size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text('发布', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                      ]),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 14, YunyuSpacing.page, 28),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const YunyuFormHeader(eyebrow: 'PUBLISH TO YOUR ISLAND', title: '发布软件', subtitle: '按步骤完善资料，审核通过后即可在云屿展示。', icon: Icons.rocket_launch_outlined),
          const SizedBox(height: 14),
          YunyuSectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const Row(children: [Icon(Icons.tips_and_updates_outlined, color: YunyuColors.primary, size: 20), SizedBox(width: 8), Text('发布资料', style: YunyuTextStyle.h3)]),
            const SizedBox(height: 6),
            const Text('完善资料后提交审核，审核通过才会公开展示。', style: YunyuTextStyle.caption),
            const SizedBox(height: 18),
            const Text('APK文件 *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            GestureDetector(onTap: _isUploading ? null : _pickApk, child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(border: Border.all(color: _apkDownloadUrl != null ? ThemeProvider.primaryColor : YunyuColors.border, width: 1.5), borderRadius: BorderRadius.circular(YunyuRadius.lg), color: _apkDownloadUrl != null ? YunyuColors.primaryLight : YunyuColors.surfaceVariant),
              child: _isUploading ? const Column(children: [CircularProgressIndicator(), SizedBox(height: 8), Text('上传中...')])
                : _apkDownloadUrl != null ? Column(children: [const Icon(Icons.check_circle_rounded, color: YunyuColors.success, size: 40), const SizedBox(height: 8), Text(_apkFileName ?? 'APK已上传', style: const TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 4), const Text('点击重新选择', style: YunyuTextStyle.caption)])
                : const Column(children: [Icon(Icons.cloud_upload_outlined, size: 40, color: YunyuColors.primary), SizedBox(height: 8), Text('点击选择APK文件', style: TextStyle(fontWeight: FontWeight.bold)), SizedBox(height: 4), Text('支持 .apk 格式', style: YunyuTextStyle.caption)]),
            )),
            const SizedBox(height: 20),
            Row(children: [const Text('软件图标', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)), const SizedBox(width: 8), Text('（可选，等比显示不裁切）', style: TextStyle(color: Colors.grey[600], fontSize: 12))]),
            const SizedBox(height: 8),
            GestureDetector(onTap: _isUploadingIcon ? null : _pickIcon, child: Container(width: 64, height: 64, decoration: BoxDecoration(color: YunyuColors.surfaceVariant, borderRadius: BorderRadius.circular(16), border: Border.all(color: YunyuColors.border)), child: _isUploadingIcon ? const Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))) : _iconUrl != null ? ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.network(_iconUrl!, fit: BoxFit.contain)) : const Icon(Icons.add_photo_alternate_outlined, size: 28, color: YunyuColors.primary))),
            const SizedBox(height: 16),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: '软件名称 *', hintText: '请输入软件名称')),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(value: _categoryController.text, decoration: const InputDecoration(labelText: '分类'), items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(), onChanged: (v) => setState(() => _categoryController.text = v ?? '实用工具')),
            const SizedBox(height: 16),
            TextField(controller: _versionController, decoration: const InputDecoration(labelText: '版本号', hintText: '如 1.0.0')),
            const SizedBox(height: 16),
            TextField(controller: _officialUrlController, decoration: const InputDecoration(labelText: '官方地址（可选）', hintText: 'https://')),
            const SizedBox(height: 16),
            TextField(controller: _introController, decoration: const InputDecoration(labelText: '软件介绍', hintText: '请输入软件介绍', alignLabelWithHint: true), maxLines: 5),
          ])),
          const SizedBox(height: 14),
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: YunyuColors.primaryLight, borderRadius: BorderRadius.circular(YunyuRadius.lg), border: Border.all(color: YunyuColors.border)), child: Row(children: [const Icon(Icons.info_outline, color: YunyuColors.primary), const SizedBox(width: 12), Expanded(child: Text('软件发布后需要管理员审核通过才会公开显示', style: TextStyle(fontSize: 13, color: Colors.grey[700]))) ])),
        ]),
      ),
    );
  }
}
