import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// Yunyu V27 admin console visual kit.
class YunyuAdminMetricCard extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final Color color;
  const YunyuAdminMetricCard({super.key, required this.title, required this.value, required this.icon, required this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Theme.of(context).cardColor,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: YunyuColors.border.withOpacity(.72)),
      boxShadow: YunyuShadow.card,
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
      Row(children:[Container(width:36,height:36,decoration:BoxDecoration(color:color.withOpacity(.10),borderRadius:BorderRadius.circular(12)),child:Icon(icon,color:color,size:19)),const Spacer(),Text(value,style:YunyuTextStyle.h3)]),
      const SizedBox(height:10), Text(title,style:YunyuTextStyle.caption),
    ]),
  );
}

class YunyuAdminActionTile extends StatelessWidget {
  final IconData icon; final String title, subtitle; final VoidCallback onTap; final String? badge;
  const YunyuAdminActionTile({super.key,required this.icon,required this.title,required this.subtitle,required this.onTap,this.badge});
  @override Widget build(BuildContext context)=>Container(
    margin: const EdgeInsets.only(bottom:10),
    decoration: BoxDecoration(color:Theme.of(context).cardColor,borderRadius:BorderRadius.circular(18),border:Border.all(color:YunyuColors.border.withOpacity(.7))),
    child: ListTile(onTap:onTap, contentPadding:const EdgeInsets.symmetric(horizontal:14,vertical:5),
      leading:Container(width:44,height:44,decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(14)),child:Icon(icon,color:YunyuColors.primary)),
      title:Text(title,style:YunyuTextStyle.title), subtitle:Text(subtitle,style:YunyuTextStyle.caption),
      trailing:Row(mainAxisSize:MainAxisSize.min,children:[if(badge!=null) Container(padding:const EdgeInsets.symmetric(horizontal:8,vertical:4),decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(10)),child:Text(badge!,style:YunyuTextStyle.caption.copyWith(color:YunyuColors.primary))),const SizedBox(width:4),const Icon(Icons.chevron_right_rounded,color:YunyuColors.textTertiary)]),
    ),
  );
}

class YunyuAdminNotice extends StatelessWidget {
  final String text;
  const YunyuAdminNotice({super.key,required this.text});
  @override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(18)),child:Row(children:[const Icon(Icons.auto_awesome_rounded,color:YunyuColors.primary),const SizedBox(width:10),Expanded(child:Text(text,style:YunyuTextStyle.caption.copyWith(color:YunyuColors.textPrimary)))]));
}
