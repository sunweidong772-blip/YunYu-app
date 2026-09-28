import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.0：统一页面背景与内容容器，不承载业务逻辑。
class YunyuV19 {
  static const double pagePadding = 20;
  static const double pageTop = 14;
  static const double sectionGap = 26;
  static const double cardRadius = 24;
  static const double heroRadius = 34;
  static const double bottomClearance = 118;
  static const Duration motion = Duration(milliseconds: 220);
}

class YunyuCloudBackdrop extends StatelessWidget {
  final Widget child;
  const YunyuCloudBackdrop({super.key, required this.child});
  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(gradient: dark ? YunyuColors.nightGradient : YunyuColors.softGradient),
      child: Stack(children: [
        Positioned(top: -110, right: -90, child: _mist(230, dark ? .06 : .22)),
        Positioned(top: 210, left: -120, child: _mist(260, dark ? .04 : .14)),
        child,
      ]),
    );
  }
  Widget _mist(double size, double opacity) => IgnorePointer(child: Container(
    width: size, height: size * .58,
    decoration: BoxDecoration(
      color: Colors.white.withOpacity(opacity),
      borderRadius: BorderRadius.circular(size),
    ),
  ));
}

class YunyuSectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  const YunyuSectionHeader({super.key, required this.title, this.subtitle, this.trailing});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: YunyuV19.pagePadding),
    child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: YunyuTextStyle.h2),
        if (subtitle != null) ...[const SizedBox(height: 4), Text(subtitle!, style: YunyuTextStyle.caption)],
      ])),
      if (trailing != null) trailing!,
    ]),
  );
}
