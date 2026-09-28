import 'package:flutter/material.dart';

/// 云屿视觉系统 V6：云海留白、深海秩序与轻量品牌识别。只定义视觉，不改变业务逻辑。
class YunyuColors {
  static const Color primary = Color(0xFF356CFF);
  static const Color primaryDark = Color(0xFF173B88);
  static const Color primaryLight = Color(0xFFEAF1FF);
  static const Color sky = Color(0xFF60A5FA);
  static const Color skyLight = Color(0xFFF3F8FF);
  static const Color mist = Color(0xFFF7F9FC);
  static const Color island = Color(0xFFEFF5FF);
  static const Color secondary = Color(0xFF38BDF8);
  static const Color secondaryLight = Color(0xFFEAF9FF);
  static const Color background = Color(0xFFF7F9FD);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF2F5FA);
  static const Color textPrimary = Color(0xFF172033);
  static const Color textSecondary = Color(0xFF65748B);
  static const Color textTertiary = Color(0xFF98A2B3);
  static const Color textInverse = Color(0xFFFFFFFF);
  static const Color divider = Color(0xFFEAECF0);
  static const Color border = Color(0xFFE4E7EC);
  static const Color success = Color(0xFF12B76A);
  static const Color successLight = Color(0xFFECFDF3);
  static const Color warning = Color(0xFFF79009);
  static const Color warningLight = Color(0xFFFFFAEB);
  static const Color error = Color(0xFFF04438);
  static const Color errorLight = Color(0xFFFFF1F0);
  static const Color info = primary;
  static const Color infoLight = primaryLight;
  static const LinearGradient brandGradient = LinearGradient(colors:[Color(0xFF1D4ED8),Color(0xFF2563EB),Color(0xFF38BDF8)],stops:[0,.55,1],begin:Alignment.topLeft,end:Alignment.bottomRight);
  static const LinearGradient heroGradient = LinearGradient(colors:[Color(0xFF0F2F78),Color(0xFF2563EB),Color(0xFF67C4FF)],begin:Alignment.topLeft,end:Alignment.bottomRight);
  static const LinearGradient softGradient = LinearGradient(colors:[Color(0xFFFFFFFF),Color(0xFFF1F6FF)],begin:Alignment.topCenter,end:Alignment.bottomCenter);
  static const LinearGradient nightGradient = LinearGradient(colors:[Color(0xFF0B1020),Color(0xFF14213D)],begin:Alignment.topCenter,end:Alignment.bottomCenter);
}
class YunyuSpacing { static const double xs=4, sm=8, md=12, lg=16, xl=24, xxl=32, xxxl=48, page=20; }
class YunyuRadius { static const double xs=8, sm=12, md=16, lg=20, xl=28, xxl=34, pill=999; }
class YunyuTextStyle {
  static const TextStyle h1=TextStyle(fontSize:31,fontWeight:FontWeight.w800,color:YunyuColors.textPrimary,height:1.18,letterSpacing:-.8);
  static const TextStyle h2=TextStyle(fontSize:23,fontWeight:FontWeight.w800,color:YunyuColors.textPrimary,height:1.28,letterSpacing:-.45);
  static const TextStyle h3=TextStyle(fontSize:18,fontWeight:FontWeight.w700,color:YunyuColors.textPrimary,height:1.35);
  static const TextStyle title=TextStyle(fontSize:16,fontWeight:FontWeight.w700,color:YunyuColors.textPrimary,height:1.42);
  static const TextStyle body=TextStyle(fontSize:14,color:YunyuColors.textPrimary,height:1.6);
  static const TextStyle caption=TextStyle(fontSize:12,color:YunyuColors.textSecondary,height:1.5);
  static const TextStyle tiny=TextStyle(fontSize:10,color:YunyuColors.textTertiary,height:1.35);
  static const TextStyle button=TextStyle(fontSize:15,fontWeight:FontWeight.w700,color:YunyuColors.textInverse,height:1.3);
  static const TextStyle tag=TextStyle(fontSize:11,fontWeight:FontWeight.w700,height:1.3);
}
class YunyuShadow {
  static const List<BoxShadow> card=[BoxShadow(color:Color(0x0A152238),blurRadius:28,offset:Offset(0,10)),BoxShadow(color:Color(0x05152238),blurRadius:5,offset:Offset(0,2))];
  static const List<BoxShadow> elevated=[BoxShadow(color:Color(0x2A2563EB),blurRadius:28,offset:Offset(0,12))];
  static const List<BoxShadow> fab=[BoxShadow(color:Color(0x352563EB),blurRadius:24,offset:Offset(0,10))];
}

/// V7 页面精修：更克制的品牌层次与内容优先布局。
class YunyuV7 {
  static const double headerHeight = 84;
  static const double sectionGap = 28;
  static const double cardGap = 12;
}

/// V8 深度页面重排：高频页面使用更明确的「品牌层 / 内容层 / 操作层」。
class YunyuV8 {
  static const double heroRadius = 30;
  static const double contentMaxWidth = 760;
  static const double sectionGap = 26;
  static const double appIcon = 56;
}

/// V9 详情页深度重构：阅读层 / 信息层 / 操作层的统一规范。
class YunyuV9 {
  static const double detailTopGap = 12;
  static const double detailSectionGap = 30;
  static const double detailCardRadius = 24;
  static const double readingLineHeight = 1.72;
  static const double actionHeight = 50;
  static const double avatar = 44;
}

/// V10 发布与身份系统精修：身份信息与表单流程统一使用岛屿式分层。
class YunyuV10 {
  static const double identityHeroRadius = 28;
  static const double identityAvatar = 88;
  static const double formSectionGap = 24;
  static const double formFieldGap = 14;
  static const double primaryActionHeight = 52;
}

/// V11：发布、认证与管理后台统一采用「克制品牌层 + 高信息密度工作区」。
class YunyuV11 {
  static const double authTopSpace = 42;
  static const double authLogo = 76;
  static const double authCardRadius = 26;
  static const double adminHeroRadius = 28;
  static const double adminMetricRadius = 20;
  static const double adminListRadius = 18;
  static const double pageBottomSafeGap = 32;
}

/// V12：消息、设置与状态体验采用「轻导航 + 分组工作区 + 温和反馈」。
class YunyuV12 {
  static const double pageTopGap = 14;
  static const double groupGap = 24;
  static const double rowHeight = 64;
  static const double messageAvatar = 52;
  static const double emptyIcon = 96;
  static const double actionBarHeight = 58;
}


/// V14（云屿 4.1.0）视觉规范：更轻的云感层次、更稳定的信息密度与统一的沉浸导航。
class YunyuV14 {
  static const double pageHorizontal = 20;
  static const double floatingNavRadius = 26;
  static const double compactCardRadius = 18;
  static const double heroRadius = 30;
  static const double controlHeight = 48;
  static const Duration motion = Duration(milliseconds: 220);
}


/// V15（云屿 4.1.1）页面精修规范：统一首页、社区、软件与个人页的视觉节奏。
class YunyuV15 {
  static const double appBarHeight = 64;
  static const double pageTop = 12;
  static const double sectionGap = 20;
  static const double heroRadius = 32;
  static const double cardRadius = 22;
  static const double navHeight = 72;
  static const double compactPadding = 14;
  static const double contentPadding = 20;
}

/// V16（云屿 4.1.3）沉浸式逐页精修：统一云感背景、品牌胶囊与阅读卡片。
class YunyuV16 {
  static const double pageRadius = 30;
  static const double cardRadius = 24;
  static const double floatingInset = 16;
  static const double topBarHeight = 62;
  static const double chipHeight = 38;
  static const double feedBottom = 124;
}

/// V17（云屿 4.1.3）核心页面体验规范：强调阅读节奏、身份层级与轻量操作反馈。
class YunyuV17 {
  static const double pagePadding = 20;
  static const double contentMaxWidth = 760;
  static const double heroRadius = 34;
  static const double cardRadius = 24;
  static const double detailRadius = 28;
  static const double sectionGap = 28;
  static const double rowGap = 12;
  static const double actionHeight = 52;
  static const double bottomSafeSpace = 112;
  static const Duration transition = Duration(milliseconds: 240);
}

/// V18（云屿 4.1.4）全局收口规范：减少装饰噪声，强化「云、屿、内容」三层信息结构。
class YunyuV18 {
  static const double pagePadding = 20;
  static const double compactPagePadding = 16;
  static const double navInset = 14;
  static const double navHeight = 74;
  static const double navRadius = 28;
  static const double selectedPillHeight = 30;
  static const double actionSize = 62;
  static const double sectionGap = 24;
  static const double cardRadius = 24;
  static const Duration microMotion = Duration(milliseconds: 180);
}
