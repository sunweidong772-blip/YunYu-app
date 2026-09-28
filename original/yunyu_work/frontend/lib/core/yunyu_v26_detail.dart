import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// Yunyu V26 secondary-page visual components.
class YunyuDetailHero extends StatelessWidget {
  final String eyebrow, title, subtitle;
  final IconData icon;
  const YunyuDetailHero({super.key, required this.eyebrow, required this.title, required this.subtitle, required this.icon});
  @override Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(gradient: YunyuColors.softGradient, borderRadius: BorderRadius.circular(24), border: Border.all(color: YunyuColors.border.withOpacity(.65))),
    child: Row(children:[Container(width:52,height:52,decoration:BoxDecoration(gradient:YunyuColors.brandGradient,borderRadius:BorderRadius.circular(18)),child:Icon(icon,color:Colors.white)),const SizedBox(width:14),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(eyebrow,style:YunyuTextStyle.caption.copyWith(letterSpacing:1.1,color:YunyuColors.primary)),const SizedBox(height:4),Text(title,style:YunyuTextStyle.headline),const SizedBox(height:4),Text(subtitle,style:YunyuTextStyle.caption)]))]),
  );
}
class YunyuSettingTile extends StatelessWidget {
  final IconData icon; final String title, subtitle; final Widget? trailing; final VoidCallback? onTap;
  const YunyuSettingTile({super.key,required this.icon,required this.title,required this.subtitle,this.trailing,this.onTap});
  @override Widget build(BuildContext context)=>ListTile(contentPadding:const EdgeInsets.symmetric(horizontal:16,vertical:6),leading:Container(width:42,height:42,decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(14)),child:Icon(icon,color:YunyuColors.primary,size:21)),title:Text(title,style:YunyuTextStyle.title),subtitle:Text(subtitle,style:YunyuTextStyle.caption),trailing:trailing??const Icon(Icons.chevron_right_rounded,color:YunyuColors.textTertiary),onTap:onTap);
}
