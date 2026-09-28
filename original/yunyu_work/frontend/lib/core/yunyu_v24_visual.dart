import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.5：表单、二级页面与操作反馈统一视觉。
class YunyuV24 {
  static const double pageRadius = 24;
  static const double fieldRadius = 16;
  static const double sectionGap = 16;
}

class YunyuFormHeader extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final IconData icon;
  const YunyuFormHeader({super.key, required this.eyebrow, required this.title, required this.subtitle, required this.icon});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      gradient: YunyuColors.heroGradient,
      borderRadius: BorderRadius.circular(YunyuV24.pageRadius),
      boxShadow: YunyuShadow.card,
    ),
    child: Row(children: [
      Container(width: 50, height: 50, decoration: BoxDecoration(color: Colors.white.withOpacity(.16), borderRadius: BorderRadius.circular(18)), child: Icon(icon, color: Colors.white, size: 27)),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(eyebrow, style: TextStyle(color: Colors.white.withOpacity(.68), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.1)),
        const SizedBox(height: 3),
        Text(title, style: YunyuTextStyle.h2.copyWith(color: Colors.white)),
        const SizedBox(height: 3),
        Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(.82), fontSize: 12, height: 1.35)),
      ])),
    ]),
  );
}

class YunyuFormStep extends StatelessWidget {
  final String number;
  final String title;
  final String subtitle;
  final Widget child;
  const YunyuFormStep({super.key, required this.number, required this.title, required this.subtitle, required this.child});
  @override
  Widget build(BuildContext context) => YunyuSectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Row(children: [
      Container(width: 28, height: 28, alignment: Alignment.center, decoration: BoxDecoration(color: YunyuColors.primaryLight, borderRadius: BorderRadius.circular(10)), child: Text(number, style: YunyuTextStyle.tag.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w800))),
      const SizedBox(width: 10),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: YunyuTextStyle.h3), Text(subtitle, style: YunyuTextStyle.caption)])),
    ]),
    const SizedBox(height: 16), child,
  ]));
}
