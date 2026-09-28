import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/dio_client.dart';
import '../../core/yunyu_v22_visual.dart';
import '../../widgets/common_widgets.dart';
import 'chat_page.dart';

class MessageListPage extends StatefulWidget {
  const MessageListPage({super.key});
  @override State<MessageListPage> createState() => _MessageListPageState();
}

class _MessageListPageState extends State<MessageListPage> {
  List<dynamic> _conversations = [];
  bool _isLoading = true;
  @override void initState() { super.initState(); _loadConversations(); }
  Future<void> _loadConversations() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/messages');
      if (!mounted) return;
      setState(() { _conversations = result['data'] ?? []; _isLoading = false; });
    } catch (e) {
      if (mounted) { setState(() => _isLoading = false); showError(context, e.toString().replaceAll('Exception: ', '')); }
    }
  }
  @override Widget build(BuildContext context) => Scaffold(
    body: RefreshIndicator(
      onRefresh: _loadConversations,
      child: _isLoading ? const LoadingView(message: '正在整理你的消息') : _conversations.isEmpty
        ? ListView(children: const [SizedBox(height: 110), EmptyView(icon: Icons.mark_chat_unread_outlined, message: '消息岛还是安静的', subMessage: '当有人与你互动时，会在这里留下新的回声')])
        : ListView.builder(
          padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuV12.pageTopGap, YunyuSpacing.page, YunyuSpacing.xxxl),
          itemCount: _conversations.length + 1,
          itemBuilder: (context, index) {
            if (index == 0) return const YunyuPageIntro(eyebrow: 'MESSAGE ISLAND', title: '消息', subtitle: '所有新的回声，都在这里靠岸');
            final msg = _conversations[index - 1];
            final unread = msg['is_read'] == false;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(YunyuRadius.lg),
                  onTap: () { final otherId = msg['sender_id'] != null ? msg['sender_id'] : msg['receiver_id']; Navigator.push(context, MaterialPageRoute(builder: (_) => ChatPage(otherUserId: otherId, otherUserName: msg['display_name'] ?? msg['username'] ?? ''))); },
                  child: Ink(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(YunyuRadius.lg), border: Border.all(color: unread ? YunyuColors.primary.withOpacity(.16) : YunyuColors.border.withOpacity(.65)), boxShadow: unread ? YunyuShadow.card : null),
                    child: Row(children: [
                      Stack(children: [
                        UserAvatar(avatarUrl: msg['avatar_url'], displayName: msg['display_name'] ?? msg['username'], size: YunyuV12.messageAvatar),
                        if (unread) Positioned(right: 0, top: 0, child: Container(width: 11, height: 11, decoration: BoxDecoration(color: YunyuColors.primary, shape: BoxShape.circle, border: Border.all(color: Theme.of(context).cardColor, width: 2)))),
                      ]),
                      const SizedBox(width: 13),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(msg['display_name'] ?? msg['username'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: YunyuTextStyle.title),
                        const SizedBox(height: 5), Text(msg['content'] ?? ' ', maxLines: 1, overflow: TextOverflow.ellipsis, style: YunyuTextStyle.caption),
                      ])),
                      const SizedBox(width: 8), Icon(Icons.chevron_right_rounded, size: 20, color: YunyuColors.textTertiary),
                    ]),
                  ),
                ),
              ),
            );
          },
        ),
    ),
  );
}
