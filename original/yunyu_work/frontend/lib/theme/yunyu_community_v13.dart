import 'package:flutter/material.dart';
import 'yunyu_design.dart';

/// V13 社区内容流视觉规范：用于统一内容密度、身份信息与互动区。
class YunyuCommunityV13 {
  static const double pagePadding = 20;
  static const double feedGap = 12;
  static const double avatarSize = 44;
  static const double contentRadius = 22;

  static BoxDecoration feedSurface(BuildContext context) => BoxDecoration(
    color: Theme.of(context).cardColor,
    borderRadius: BorderRadius.circular(contentRadius),
    border: Border.all(color: YunyuColors.primary.withOpacity(.06)),
  );

  static Widget sectionLabel(String text, {String? trailing}) => Padding(
    padding: const EdgeInsets.fromLTRB(pagePadding, 8, pagePadding, 10),
    child: Row(children: [
      Text(text, style: YunyuTextStyle.h2.copyWith(fontSize: 18, letterSpacing: -.4)),
      const Spacer(),
      if (trailing != null) Text(trailing, style: YunyuTextStyle.caption.copyWith(color: YunyuColors.textTertiary)),
    ]),
  );
}
