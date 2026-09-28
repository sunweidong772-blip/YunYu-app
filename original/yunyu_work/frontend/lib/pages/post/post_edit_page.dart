import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../home/community_tab.dart';
import '../../providers/theme_provider.dart';

class PostEditPage extends StatefulWidget {
  const PostEditPage({super.key});

  @override
  State<PostEditPage> createState() => _PostEditPageState();
}

class _PostEditPageState extends State<PostEditPage> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.isEmpty) {
      showError(context, '请输入标题');
      return;
    }
    if (content.isEmpty) {
      showError(context, '请输入内容');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await DioClient().post('/posts', data: {'title': title, 'content': content});
      if (mounted) {
        showSuccess(context, '发布成功，等待审核');
        // 通知社区页面刷新
        CommunityTabState.refreshCallback?.call();
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('发布帖子'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: _isSubmitting ? null : _submit,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  gradient: YunyuColors.brandGradient,
                  borderRadius: BorderRadius.circular(YunyuRadius.pill),
                  boxShadow: [BoxShadow(color: YunyuColors.primary.withOpacity(.35), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: _isSubmitting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.send_rounded, size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text('发布', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                      ]),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 14, YunyuSpacing.page, 28),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          YunyuSectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const Text('写一篇新的分享', style: YunyuTextStyle.h3),
            const SizedBox(height: 6),
            const Text('把此刻的想法留在云屿。', style: YunyuTextStyle.caption),
            const SizedBox(height: 18),
            TextField(controller: _titleController, decoration: const InputDecoration(labelText: '标题', hintText: '请输入帖子标题（不超过200字）'), textInputAction: TextInputAction.next, maxLength: 200),
            const SizedBox(height: 16),
            TextField(controller: _contentController, decoration: const InputDecoration(labelText: '内容', hintText: '请输入帖子内容', alignLabelWithHint: true), maxLines: 15),
          ])),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: YunyuColors.primaryLight, borderRadius: BorderRadius.circular(YunyuRadius.lg), border: Border.all(color: YunyuColors.border)),
            child: Row(children: [
              const Icon(Icons.info_outline, color: ThemeProvider.primaryColor),
              const SizedBox(width: 12),
              Expanded(child: Text('帖子发布后需要管理员审核通过才会公开显示', style: TextStyle(fontSize: 13, color: Colors.grey[700]))),
            ]),
          ),
        ]),
      ),
    );
  }
}
