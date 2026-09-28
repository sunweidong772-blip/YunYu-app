import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/yunyu_v23_visual.dart';

class ChatPage extends StatefulWidget {
  final int otherUserId;
  final String otherUserName;
  const ChatPage({super.key, required this.otherUserId, required this.otherUserName});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  List<dynamic> _messages = [];
  bool _isLoading = true;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() => _isLoading = true);
    try {
      final result = await DioClient().get('/messages/${widget.otherUserId}');
      setState(() {
        _messages = result['data'] ?? [];
        _isLoading = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;
    try {
      await DioClient().post('/messages/${widget.otherUserId}', data: {'content': content});
      _messageController.clear();
      await _loadMessages();
    } catch (e) {
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final myId = auth.user?.id;

    return Scaffold(
      appBar: AppBar(title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(widget.otherUserName), Text('云间私信', style: YunyuTextStyle.tiny)])),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? LoadingView()
                : _messages.isEmpty
                    ? EmptyView(icon: Icons.chat_bubble_outline, message: '暂无消息，开始聊天吧')
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuSpacing.md, YunyuSpacing.page, YunyuSpacing.lg),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[index];
                          final isMe = msg['sender_id'] == myId;
                          return Align(
                            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              constraints: const BoxConstraints(maxWidth: 300),
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 11),
                              decoration: BoxDecoration(
                                gradient: isMe ? YunyuColors.brandGradient : null,
                                color: isMe ? null : Theme.of(context).cardColor,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(18), topRight: const Radius.circular(18),
                                  bottomLeft: Radius.circular(isMe ? 18 : 6), bottomRight: Radius.circular(isMe ? 6 : 18),
                                ),
                                border: isMe ? null : Border.all(color: YunyuColors.border),
                                boxShadow: isMe ? YunyuShadow.card : null,
                              ),
                              child: Text(msg['content'] ?? '', style: TextStyle(color: isMe ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color, height: 1.45)),
                            ),
                          );
                        },
                      ),
          ),
          YunyuSoftSurface(
            padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuSpacing.md, YunyuSpacing.page, YunyuSpacing.md),
            child: SafeArea(
              child: Row(children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(hintText: '输入消息...', contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                SizedBox(width: 12),
                ElevatedButton(onPressed: _sendMessage, child: Text('发送')),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
