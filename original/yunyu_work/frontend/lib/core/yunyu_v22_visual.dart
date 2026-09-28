import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.3：消息、发布、设置与管理页面统一的操作层视觉组件。
class YunyuV22 {
  static const double pageTop = 18;
  static const double blockGap = 16;
  static const double actionRadius = 18;
}

class YunyuPageIntro extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final Widget? trailing;
  const YunyuPageIntro({super.key, required this.eyebrow, required this.title, required this.subtitle, this.trailing});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(2, 6, 2, 20),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(eyebrow.toUpperCase(), style: YunyuTextStyle.tiny.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
        const SizedBox(height: 5), Text(title, style: YunyuTextStyle.h1),
        const SizedBox(height: 6), Text(subtitle, style: YunyuTextStyle.caption),
      ])),
      if (trailing != null) trailing!,
    ]),
  );
}

class YunyuActionSurface extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  const YunyuActionSurface({super.key, required this.child, this.onTap, this.padding = const EdgeInsets.all(14)});
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.transparent,
    child: InkWell(
      borderRadius: BorderRadius.circular(YunyuV22.actionRadius), onTap: onTap,
      child: Ink(decoration: BoxDecoration(color: Theme.of(context).cardColor.withOpacity(.92), borderRadius: BorderRadius.circular(YunyuV22.actionRadius), border: Border.all(color: YunyuColors.border.withOpacity(.72))), padding: padding, child: child),
    ),
  );
}
