import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

// 用户头像组件
class UserAvatar extends StatelessWidget {
  final String? avatarUrl;
  final double size;
  final String? displayName;
  final bool showBorder;
  const UserAvatar({super.key, this.avatarUrl, this.size = 48, this.displayName, this.showBorder = false});

  @override
  Widget build(BuildContext context) {
    final avatar = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: YunyuColors.brandGradient,
        border: showBorder ? Border.all(color: YunyuColors.surface, width: 2) : null,
      ),
      child: avatarUrl != null && avatarUrl!.isNotEmpty
          ? ClipOval(child: Image.network(avatarUrl!, fit: BoxFit.cover, width: size, height: size,
              errorBuilder: (_, __, ___) => _buildInitials()))
          : _buildInitials(),
    );
  }

  Widget _buildInitials() {
    return Center(
      child: Text(
        displayName?.isNotEmpty == true ? displayName![0].toUpperCase() : '?',
        style: TextStyle(color: Colors.white, fontSize: size * 0.38, fontWeight: FontWeight.w600),
      ),
    );
  }
}

// 等级头衔徽章：统一展示等级或管理员身份，仅改变视觉表达。
class LevelBadge extends StatelessWidget {
  final int level; final String? adminRoleCode;
  const LevelBadge({super.key, required this.level, this.adminRoleCode});
  @override Widget build(BuildContext context) {
    final admin = _adminMeta();
    final normal = _levelMeta();
    final isAdmin = admin != null;
    final meta = isAdmin ? admin : normal;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: isAdmin ? meta.gradient : null,
        color: isAdmin ? null : meta.bg,
        borderRadius: BorderRadius.circular(YunyuRadius.pill),
        border: Border.all(color: isAdmin ? Colors.white.withOpacity(.18) : meta.color.withOpacity(.16)),
        boxShadow: isAdmin ? [BoxShadow(color: meta.color.withOpacity(.18), blurRadius: 10, offset: const Offset(0,3))] : null,
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(meta.icon, size: 12, color: isAdmin ? Colors.white : meta.color),
        const SizedBox(width: 4),
        Text(meta.title, style: TextStyle(fontSize: 10, height: 1, color: isAdmin ? Colors.white : meta.color, fontWeight: FontWeight.w700)),
      ]),
    );
  }
  _BadgeMeta? _adminMeta() {
    switch (adminRoleCode) {
      case 'owner': return _BadgeMeta('云屿岛主', Icons.workspace_premium_rounded, Colors.amber, const LinearGradient(colors:[Color(0xFFB9892E),Color(0xFFE9C96D)]));
      case 'chief': return _BadgeMeta('云屿议长', Icons.account_balance_rounded, const Color(0xFF8367D8), const LinearGradient(colors:[Color(0xFF7056BE),Color(0xFF9A86E8)]));
      case 'super': return _BadgeMeta('云屿守护者', Icons.shield_rounded, const Color(0xFFDC6572), const LinearGradient(colors:[Color(0xFFC64E64),Color(0xFFE88A93)]));
      case 'moderator': return _BadgeMeta('审核管理员', Icons.fact_check_rounded, const Color(0xFF4F8FF7), YunyuColors.brandGradient);
      case 'inspector': return _BadgeMeta('巡检管理员', Icons.travel_explore_rounded, const Color(0xFF2BA89B), const LinearGradient(colors:[Color(0xFF248F85),Color(0xFF57C6B8)]));
      case 'community': return _BadgeMeta('社区管理员', Icons.support_agent_rounded, const Color(0xFF51A978), const LinearGradient(colors:[Color(0xFF429867),Color(0xFF76C795)]));
    } return null;
  }
  _BadgeMeta _levelMeta() {
    if(level>=100) return _BadgeMeta('云屿传说',Icons.auto_awesome_rounded,const Color(0xFFC18A2A),null,bg:const Color(0xFFFFF6E1));
    if(level>=81) return _BadgeMeta('云屿守望者',Icons.public_rounded,const Color(0xFF6C72D6),null,bg:const Color(0xFFF0F1FF));
    if(level>=61) return _BadgeMeta('星海航行者',Icons.nightlight_round,const Color(0xFF6A8BC6),null,bg:const Color(0xFFEFF5FF));
    if(level>=41) return _BadgeMeta('逐云探索者',Icons.cloud_rounded,YunyuColors.primary,null,bg:YunyuColors.primaryLight);
    if(level>=21) return _BadgeMeta('拾光行者',Icons.wb_sunny_rounded,const Color(0xFFE49A3C),null,bg:const Color(0xFFFFF6E9));
    if(level>=11) return _BadgeMeta('听风旅人',Icons.air_rounded,const Color(0xFF4AA596),null,bg:const Color(0xFFEAF8F6));
    return _BadgeMeta('初见云屿',Icons.waving_hand_rounded,const Color(0xFF6F9E79),null,bg:const Color(0xFFF0F8F1));
  }
}
class _BadgeMeta { final String title; final IconData icon; final Color color; final Gradient? gradient; final Color bg; _BadgeMeta(this.title,this.icon,this.color,this.gradient,{Color? bg}):bg=bg??Colors.transparent; }

// 云屿卡片
class YunyuCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;
  const YunyuCard({super.key, required this.child, this.padding, this.onTap, this.margin});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(vertical: YunyuSpacing.sm),
      decoration: BoxDecoration(
        color: YunyuColors.surface,
        borderRadius: BorderRadius.circular(YunyuRadius.lg),
        boxShadow: YunyuShadow.card,
        border: Border.all(color: YunyuColors.border.withOpacity(.58)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(YunyuRadius.lg),
          child: Padding(padding: padding ?? EdgeInsets.all(YunyuSpacing.lg), child: child),
        ),
      ),
    );
  }
}

// 云朵加载动画
class LoadingView extends StatelessWidget {
  final String? message;
  const LoadingView({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: YunyuColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: EdgeInsets.all(14),
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(YunyuColors.primary),
              ),
            ),
          ),
          if (message != null) ...[
            SizedBox(height: YunyuSpacing.md),
            Text(message!, style: YunyuTextStyle.caption),
          ],
        ],
      ),
    );
  }
}

// 云屿空状态
class EmptyView extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? subMessage;
  final VoidCallback? onAction;
  final String? actionText;
  const EmptyView({
    super.key,
    required this.icon,
    required this.message,
    this.subMessage,
    this.onAction,
    this.actionText,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(YunyuSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: YunyuColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: YunyuColors.primary),
            ),
            SizedBox(height: YunyuSpacing.lg),
            Text(message, style: YunyuTextStyle.title, textAlign: TextAlign.center),
            if (subMessage != null) ...[
              SizedBox(height: YunyuSpacing.sm),
              Text(subMessage!, style: YunyuTextStyle.caption, textAlign: TextAlign.center),
            ],
            if (onAction != null && actionText != null) ...[
              SizedBox(height: YunyuSpacing.lg),
              ElevatedButton(onPressed: onAction, child: Text(actionText!)),
            ],
          ],
        ),
      ),
    );
  }
}

// 状态标签
class StatusTag extends StatelessWidget {
  final String text;
  final Color color;
  final Color bgColor;
  const StatusTag({super.key, required this.text, required this.color, required this.bgColor});

  factory StatusTag.pending() => StatusTag(text: '待处理', color: YunyuColors.warning, bgColor: YunyuColors.warningLight);
  factory StatusTag.processing() => StatusTag(text: '处理中', color: YunyuColors.info, bgColor: YunyuColors.infoLight);
  factory StatusTag.success() => StatusTag(text: '已完成', color: YunyuColors.success, bgColor: YunyuColors.successLight);
  factory StatusTag.rejected() => StatusTag(text: '已驳回', color: YunyuColors.error, bgColor: YunyuColors.errorLight);
  factory StatusTag.banned() => StatusTag(text: '已封禁', color: YunyuColors.error, bgColor: YunyuColors.errorLight);
  factory StatusTag.active() => StatusTag(text: '正常', color: YunyuColors.success, bgColor: YunyuColors.successLight);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.sm, vertical: YunyuSpacing.xs),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(YunyuRadius.pill),
      ),
      child: Text(text, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}

// 云屿按钮
class YunyuButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final IconData? icon;
  final bool expanded;
  const YunyuButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.icon,
    this.expanded = true,
  });

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(isOutlined ? YunyuColors.primary : Colors.white)))
        : Row(mainAxisSize: MainAxisSize.min, children: [
            if (icon != null) ...[Icon(icon, size: 18), SizedBox(width: YunyuSpacing.xs)],
            Text(text),
          ]);

    return SizedBox(
      width: expanded ? double.infinity : null,
      child: isOutlined
          ? OutlinedButton(onPressed: isLoading ? null : onPressed, child: child)
          : ElevatedButton(onPressed: isLoading ? null : onPressed, child: child),
    );
  }
}

// 通用显示成功
void showSuccess(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(children: [
        Icon(Icons.check_circle, color: YunyuColors.success, size: 20),
        SizedBox(width: YunyuSpacing.sm),
        Expanded(child: Text(message)),
      ]),
      backgroundColor: YunyuColors.textPrimary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
      margin: EdgeInsets.all(YunyuSpacing.md),
      duration: Duration(seconds: 2),
    ),
  );
}

// 通用显示错误
void showError(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(children: [
        Icon(Icons.error_outline, color: YunyuColors.error, size: 20),
        SizedBox(width: YunyuSpacing.sm),
        Expanded(child: Text(message)),
      ]),
      backgroundColor: YunyuColors.textPrimary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
      margin: EdgeInsets.all(YunyuSpacing.md),
      duration: Duration(seconds: 3),
    ),
  );
}

// 通用显示提示
void showInfo(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(children: [
        Icon(Icons.info_outline, color: YunyuColors.primary, size: 20),
        SizedBox(width: YunyuSpacing.sm),
        Expanded(child: Text(message)),
      ]),
      backgroundColor: YunyuColors.textPrimary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
      margin: EdgeInsets.all(YunyuSpacing.md),
      duration: Duration(seconds: 2),
    ),
  );
}

/// 云屿页面分组容器：只统一视觉，不承载业务逻辑。
class YunyuSectionCard extends StatelessWidget {
  final Widget child; final EdgeInsetsGeometry padding; final EdgeInsetsGeometry? margin;
  const YunyuSectionCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.margin});
  @override Widget build(BuildContext context) => Container(
    margin: margin,
    padding: padding,
    decoration: BoxDecoration(
      color: Theme.of(context).cardColor,
      borderRadius: BorderRadius.circular(YunyuRadius.lg),
      border: Border.all(color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF26354A) : YunyuColors.border),
      boxShadow: Theme.of(context).brightness == Brightness.dark ? null : YunyuShadow.card,
    ),
    child: child,
  );
}

/// 云屿小节标题：用于详情页、设置页等统一信息层级。
class YunyuSectionTitle extends StatelessWidget {
  final String title; final String? subtitle; final Widget? trailing;
  const YunyuSectionTitle({super.key, required this.title, this.subtitle, this.trailing});
  @override Widget build(BuildContext context) => Row(children:[
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text(title, style: YunyuTextStyle.h3),
      if(subtitle != null) ...[const SizedBox(height:4), Text(subtitle!, style:YunyuTextStyle.caption)],
    ])),
    if(trailing != null) trailing!,
  ]);
}

/// 云屿页面分区标题：用于已有页面的视觉统一，不包含业务状态。

class YunyuInfoPanel extends StatelessWidget {
  final Widget child; final EdgeInsetsGeometry padding;
  const YunyuInfoPanel({super.key, required this.child, this.padding=const EdgeInsets.all(YunyuSpacing.lg)});
  @override Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(
      color: Theme.of(context).cardColor,
      borderRadius: BorderRadius.circular(YunyuRadius.lg),
      border: Border.all(color: Theme.of(context).brightness==Brightness.dark ? const Color(0xFF26354A) : YunyuColors.border),
      boxShadow: Theme.of(context).brightness==Brightness.dark ? null : YunyuShadow.card,
    ), child: child,
  );
}


/// V6 页面标题：统一品牌标题、返回层级与轻量说明。
class YunyuPageHeader extends StatelessWidget {
  final String title; final String? subtitle; final Widget? trailing; final bool showBack;
  const YunyuPageHeader({super.key, required this.title, this.subtitle, this.trailing, this.showBack=false});
  @override Widget build(BuildContext context) => SafeArea(bottom:false, child: Padding(
    padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, 10, YunyuSpacing.page, 12),
    child: Row(crossAxisAlignment: CrossAxisAlignment.center, children:[
      if(showBack) ...[IconButton(onPressed:()=>Navigator.maybePop(context), icon:const Icon(Icons.arrow_back_rounded), iconSize:22), const SizedBox(width:6)],
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
        Text(title, style:YunyuTextStyle.h2),
        if(subtitle!=null) ...[const SizedBox(height:2), Text(subtitle!, style:YunyuTextStyle.caption)],
      ])),
      if(trailing!=null) trailing!,
    ]),
  ));
}

/// V8 品牌页首：用于高频页面，统一品牌信息与主要操作。
class YunyuBrandHero extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final Widget? action;
  const YunyuBrandHero({super.key, required this.eyebrow, required this.title, required this.subtitle, this.action});
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.fromLTRB(YunyuSpacing.page, 10, YunyuSpacing.page, 18),
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      gradient: YunyuColors.heroGradient,
      borderRadius: BorderRadius.circular(YunyuV8.heroRadius),
      boxShadow: YunyuShadow.elevated,
    ),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(eyebrow.toUpperCase(), style: const TextStyle(color: Colors.white70, fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w700)),
        const SizedBox(height: 7),
        Text(title, style: YunyuTextStyle.h2.copyWith(color: Colors.white, fontSize: 25)),
        const SizedBox(height: 6),
        Text(subtitle, style: YunyuTextStyle.caption.copyWith(color: Colors.white.withOpacity(.78))),
      ])),
      if (action != null) action!,
    ]),
  );
}

/// V10 通用身份卡：用于个人资料、用户主页与发布者信息，不承载业务逻辑。
class YunyuIdentityCard extends StatelessWidget {
  final Widget avatar;
  final String title;
  final String? subtitle;
  final Widget? badge;
  final Widget? trailing;
  const YunyuIdentityCard({super.key, required this.avatar, required this.title, this.subtitle, this.badge, this.trailing});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(YunyuSpacing.lg),
    decoration: BoxDecoration(
      gradient: YunyuColors.softGradient,
      borderRadius: BorderRadius.circular(YunyuV10.identityHeroRadius),
      border: Border.all(color: YunyuColors.border.withOpacity(.65)),
      boxShadow: YunyuShadow.card,
    ),
    child: Row(children: [
      avatar,
      const SizedBox(width: YunyuSpacing.md),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children:[Flexible(child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: YunyuTextStyle.h3)), if(badge!=null)...[const SizedBox(width:6), badge!]]),
        if(subtitle != null && subtitle!.isNotEmpty)...[const SizedBox(height:4), Text(subtitle!, style: YunyuTextStyle.caption)],
      ])),
      if(trailing != null) trailing!,
    ]),
  );
}

/// V10 表单分组标题，避免发布/编辑页面沦为连续输入框。
class YunyuFormSection extends StatelessWidget {
  final String title; final String? hint; final Widget child;
  const YunyuFormSection({super.key, required this.title, required this.child, this.hint});
  @override Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: YunyuV10.formSectionGap),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text(title, style: YunyuTextStyle.h3),
      if(hint!=null)...[const SizedBox(height:4), Text(hint!, style: YunyuTextStyle.caption)],
      const SizedBox(height:YunyuSpacing.md), child,
    ]),
  );
}
