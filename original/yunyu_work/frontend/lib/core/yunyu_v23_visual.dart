import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.4：软件浏览、发布、私聊与后台功能卡片的统一视觉收口。
class YunyuV23 {
  static const double radius = 20;
  static const double gap = 14;
}

class YunyuSoftSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  const YunyuSoftSurface({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.onTap});
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.transparent,
    child: InkWell(
      borderRadius: BorderRadius.circular(YunyuV23.radius),
      onTap: onTap,
      child: Ink(
        padding: padding,
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor.withOpacity(.96),
          borderRadius: BorderRadius.circular(YunyuV23.radius),
          border: Border.all(color: YunyuColors.border.withOpacity(.72)),
          boxShadow: YunyuShadow.card,
        ),
        child: child,
      ),
    ),
  );
}

class YunyuCompactAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  const YunyuCompactAction({super.key, required this.icon, required this.label, this.onTap});
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.transparent,
    child: InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 18, color: YunyuColors.primary),
          const SizedBox(width: 7),
          Text(label, style: YunyuTextStyle.tag.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w700)),
        ]),
      ),
    ),
  );
}
