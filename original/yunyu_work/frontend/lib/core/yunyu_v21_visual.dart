import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.2 核心内容页组件：只负责视觉层，便于社区、详情页与个人页统一复用。
class YunyuV21 {
  static const double sectionRadius = 22;
  static const double contentGap = 18;
}

class YunyuSectionHeader extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String? subtitle;
  const YunyuSectionHeader({super.key, required this.eyebrow, required this.title, this.subtitle});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(eyebrow.toUpperCase(), style: YunyuTextStyle.tiny.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
      const SizedBox(height: 5),
      Text(title, style: YunyuTextStyle.h2),
      if (subtitle != null) ...[const SizedBox(height: 4), Text(subtitle!, style: YunyuTextStyle.caption)],
    ]),
  );
}

class YunyuMetricPill extends StatelessWidget {
  final IconData icon;
  final String text;
  const YunyuMetricPill({super.key, required this.icon, required this.text});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
    decoration: BoxDecoration(color: Theme.of(context).cardColor.withOpacity(.72), borderRadius: BorderRadius.circular(99), border: Border.all(color: YunyuColors.border.withOpacity(.55))),
    child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 15, color: YunyuColors.primary), const SizedBox(width: 5), Text(text, style: YunyuTextStyle.caption)]),
  );
}
