import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';
import 'yunyu_v19_visual.dart';

/// 云屿 4.2.1 核心页面视觉组件：仅负责表现层，不改变接口与业务逻辑。
class YunyuV20 {
  static const double pageInset = 20;
  static const double sectionGap = 22;
  static const double radius = 26;
  static const Duration motion = Duration(milliseconds: 240);
}

class YunyuPageShell extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  const YunyuPageShell({super.key, required this.child, this.padding});
  @override
  Widget build(BuildContext context) {
    return YunyuCloudBackdropV20(
      child: SafeArea(
        top: false,
        child: Padding(padding: padding ?? const EdgeInsets.symmetric(horizontal: YunyuV20.pageInset), child: child),
      ),
    );
  }
}

class YunyuCloudBackdropV20 extends StatelessWidget {
  final Widget child;
  const YunyuCloudBackdropV20({super.key, required this.child});
  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(gradient: dark ? YunyuColors.nightGradient : YunyuColors.softGradient),
      child: Stack(children: [
        Positioned(top: -100, left: -100, child: _orb(240, dark ? .05 : .14)),
        Positioned(bottom: 70, right: -120, child: _orb(280, dark ? .04 : .10)),
        child,
      ]),
    );
  }
  Widget _orb(double size, double opacity) => IgnorePointer(child: Container(width: size, height: size, decoration: BoxDecoration(color: Colors.white.withOpacity(opacity), shape: BoxShape.circle)));
}

class YunyuIdentityChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const YunyuIdentityChip({super.key, required this.icon, required this.label});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(color: YunyuColors.primaryLight, borderRadius: BorderRadius.circular(99)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 14, color: YunyuColors.primary), const SizedBox(width: 5), Text(label, style: YunyuTextStyle.caption.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w700))]),
  );
}

class YunyuSoftDivider extends StatelessWidget {
  const YunyuSoftDivider({super.key});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(.55)));
}
