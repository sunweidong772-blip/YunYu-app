import 'package:flutter/material.dart';
import '../theme/yunyu_design.dart';

/// 云屿 4.2.6：二级信息页与品牌信息统一视觉。
class YunyuV25 {
  static const double pagePadding = 20;
  static const double cardRadius = 22;
  static const double sectionGap = 18;
}

class YunyuInfoHero extends StatelessWidget {
  final String eyebrow, title, subtitle;
  final IconData icon;
  const YunyuInfoHero({super.key, required this.eyebrow, required this.title, required this.subtitle, required this.icon});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(gradient: YunyuColors.heroGradient, borderRadius: BorderRadius.circular(YunyuV25.cardRadius), boxShadow: YunyuShadow.card),
    child: Row(children: [
      Container(width: 54,height:54,decoration:BoxDecoration(color:Colors.white.withOpacity(.15),borderRadius:BorderRadius.circular(18)),child:Icon(icon,color:Colors.white,size:28)),
      const SizedBox(width:14), Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
        Text(eyebrow.toUpperCase(),style:TextStyle(color:Colors.white.withOpacity(.7),fontSize:11,fontWeight:FontWeight.w700,letterSpacing:1.1)),
        const SizedBox(height:4),Text(title,style:YunyuTextStyle.h2.copyWith(color:Colors.white)),const SizedBox(height:4),
        Text(subtitle,style:TextStyle(color:Colors.white.withOpacity(.82),fontSize:12,height:1.35)),
      ]))
    ]),
  );
}

class YunyuInfoSection extends StatelessWidget {
  final String title, content; final IconData? icon;
  const YunyuInfoSection({super.key,required this.title,required this.content,this.icon});
  @override
  Widget build(BuildContext context)=>YunyuSectionCard(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    Row(children:[if(icon!=null)...[Icon(icon,size:18,color:YunyuColors.primary),const SizedBox(width:8)],Expanded(child:Text(title,style:YunyuTextStyle.h3))]),
    const SizedBox(height:10),Text(content,style:TextStyle(fontSize:14,height:1.7,color:Theme.of(context).colorScheme.onSurface.withOpacity(.72))),
  ]));
}
