import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';
import '../../core/yunyu_v22_visual.dart';
import '../../core/yunyu_v26_detail.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/common_widgets.dart';
import 'edit_profile_page.dart'; import 'agreement_page.dart'; import 'privacy_page.dart'; import 'about_page.dart'; import 'changelog_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatefulWidget { const SettingsPage({super.key}); @override State<SettingsPage> createState()=>_SettingsPageState(); }
class _SettingsPageState extends State<SettingsPage> {
  bool _notificationsEnabled=true,_isClearingCache=false;
  @override void initState(){super.initState();_loadNotificationSetting();}
  Future<void> _loadNotificationSetting() async { final p=await SharedPreferences.getInstance(); if(mounted)setState(()=>_notificationsEnabled=p.getBool('notifications_enabled')??true); }
  Future<void> _toggleNotifications(bool v) async { final p=await SharedPreferences.getInstance(); await p.setBool('notifications_enabled',v); if(mounted){setState(()=>_notificationsEnabled=v);showSuccess(context,v?'通知已开启':'通知已关闭');} }
  Future<void> _clearCache() async { setState(()=>_isClearingCache=true); try{PaintingBinding.instance.imageCache.clear();PaintingBinding.instance.imageCache.clearLiveImages();await Future.delayed(const Duration(milliseconds:500));if(mounted)showSuccess(context,'缓存已清除');}catch(_){if(mounted)showError(context,'清除缓存失败');}finally{if(mounted)setState(()=>_isClearingCache=false);} }
  @override Widget build(BuildContext context){ final theme=context.watch<ThemeProvider>(); return Scaffold(body:ListView(padding:const EdgeInsets.fromLTRB(YunyuSpacing.page,YunyuV12.pageTopGap,YunyuSpacing.page,YunyuSpacing.xxxl),children:[
    const YunyuDetailHero(eyebrow:'YOUR CLOUD SPACE',title:'设置',subtitle:'把云屿调整成更适合你的样子',icon:Icons.tune_rounded),
    _section('账号',[ _row(Icons.person_outline,'编辑资料','完善你的云屿身份',()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>EditProfilePage()))), _switchRow(Icons.notifications_none_rounded,'通知提醒','及时接收与你有关的消息',_notificationsEnabled,_toggleNotifications)]),
    _section('外观',[ _themeRow(theme)]),
    _section('通用',[ _row(Icons.cleaning_services_outlined,'清除缓存',_isClearingCache?'正在清理…':'释放临时图片缓存',_isClearingCache?null:_clearCache, trailing:_isClearingCache?const SizedBox(width:18,height:18,child:CircularProgressIndicator(strokeWidth:2)):null)]),
    _section('关于云屿',[ _row(Icons.auto_stories_outlined,'更新日志','查看云屿版本变化',()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>ChangelogPage()))), _row(Icons.description_outlined,'用户协议','了解使用规则',()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>AgreementPage()))), _row(Icons.privacy_tip_outlined,'隐私政策','了解信息处理方式',()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>PrivacyPage()))), _row(Icons.info_outline_rounded,'关于云屿','版本与品牌信息',()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>AboutPage()))) ]),
    const SizedBox(height:12),OutlinedButton(onPressed:() async{final ok=await showDialog<bool>(context:context,builder:(d)=>AlertDialog(title:const Text('确认退出'),content:const Text('确定要退出登录吗？'),actions:[TextButton(onPressed:()=>Navigator.pop(d,false),child:const Text('取消')),FilledButton(onPressed:()=>Navigator.pop(d,true),child:const Text('退出'))]));if(ok==true){await context.read<AuthProvider>().logout();if(context.mounted)Navigator.of(context).pushReplacementNamed('/login');}},style:OutlinedButton.styleFrom(minimumSize:const Size.fromHeight(50),foregroundColor:YunyuColors.error,side:const BorderSide(color:YunyuColors.error)),child:const Text('退出登录')),
    const SizedBox(height:18),const Center(child:Text('云屿 v4.2.7 · 让每一次设置都更清晰',style:YunyuTextStyle.caption)),
  ]));}
  Widget _section(String title,List<Widget> children)=>Padding(padding:const EdgeInsets.only(bottom:YunyuV12.groupGap),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Padding(padding:const EdgeInsets.fromLTRB(4,0,4,9),child:Text(title,style:YunyuTextStyle.tag.copyWith(color:YunyuColors.textSecondary))),YunyuSectionCard(padding:EdgeInsets.zero,child:Column(children:children))]));
  Widget _row(IconData icon,String title,String subtitle,VoidCallback? tap,{Widget? trailing})=>YunyuSettingTile(icon:icon,title:title,subtitle:subtitle,trailing:trailing,onTap:tap);
  Widget _switchRow(IconData i,String t,String s,bool v,ValueChanged<bool> f)=>ListTile(contentPadding:const EdgeInsets.symmetric(horizontal:14,vertical:4),leading:Container(width:38,height:38,decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(12)),child:Icon(i,size:20,color:YunyuColors.primary)),title:Text(t,style:YunyuTextStyle.title),subtitle:Text(s,style:YunyuTextStyle.caption),trailing:Switch(value:v,onChanged:f));
  Widget _themeRow(ThemeProvider p)=>ListTile(contentPadding:const EdgeInsets.symmetric(horizontal:14,vertical:4),leading:Container(width:38,height:38,decoration:BoxDecoration(color:YunyuColors.primaryLight,borderRadius:BorderRadius.circular(12)),child:const Icon(Icons.dark_mode_outlined,size:20,color:YunyuColors.primary)),title:const Text('深色模式',style:YunyuTextStyle.title),subtitle:const Text('选择你喜欢的显示方式',style:YunyuTextStyle.caption),trailing:DropdownButton<ThemeMode>(value:p.themeMode,underline:const SizedBox(),items:const[DropdownMenuItem(value:ThemeMode.system,child:Text('跟随系统')),DropdownMenuItem(value:ThemeMode.light,child:Text('浅色')),DropdownMenuItem(value:ThemeMode.dark,child:Text('深色'))],onChanged:(m){if(m!=null)p.setThemeMode(m);}));
}
