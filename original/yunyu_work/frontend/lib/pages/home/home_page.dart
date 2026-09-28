import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/yunyu_design.dart';
import '../../widgets/common_widgets.dart';
import '../../core/yunyu_v19_visual.dart';
import 'community_tab.dart'; import 'apps_tab.dart'; import 'profile_tab.dart'; import '../post/post_edit_page.dart';
class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override State<HomePage> createState()=>_HomePageState();
}
class _HomePageState extends State<HomePage> {
  int _currentIndex=0; final PageController _pageController=PageController();
  final List<Widget> _pages=const [CommunityTab(),AppsTab(),SizedBox.shrink(),MessageCenterPlaceholder(),ProfileTab()];
  @override void dispose(){_pageController.dispose();super.dispose();}
  void _onTabTapped(int index){
    if(index==2){
      final auth=context.read<AuthProvider>();
      if(!auth.isLoggedIn){showInfo(context,'请先登录后再发布内容');return;}
      Navigator.push(context,MaterialPageRoute(builder:(_)=>const PostEditPage()));
      return;
    }
    setState(()=>_currentIndex=index);
    _pageController.jumpToPage(index);
  }
  @override Widget build(BuildContext context)=>Scaffold(
    body: YunyuCloudBackdrop(child: PageView(controller:_pageController,physics:const NeverScrollableScrollPhysics(),children:_pages)),
    bottomNavigationBar: _buildNav(),
  );
  Widget _buildNav()=>SafeArea(
    top:false,
    child: Padding(
      padding:const EdgeInsets.fromLTRB(YunyuV18.navInset,8,YunyuV18.navInset,12),
      child: Container(
        height:YunyuV18.navHeight,
        decoration:BoxDecoration(
          color:Theme.of(context).colorScheme.surface,
          borderRadius:BorderRadius.circular(YunyuV18.navRadius),
          border:Border.all(color:Theme.of(context).brightness==Brightness.dark?Colors.white.withOpacity(.06):YunyuColors.border.withOpacity(.75)),
          boxShadow:Theme.of(context).brightness==Brightness.dark?null:YunyuShadow.card,
        ),
        child:Row(mainAxisAlignment:MainAxisAlignment.spaceAround,children:[
          _buildNavItem(0,Icons.home_outlined,Icons.home_rounded,'首页'),
          _buildNavItem(1,Icons.apps_outlined,Icons.apps_rounded,'软件'),
          _buildPublishButton(),
          _buildNavItem(3,Icons.chat_bubble_outline_rounded,Icons.chat_bubble_rounded,'消息'),
          _buildNavItem(4,Icons.person_outline_rounded,Icons.person_rounded,'我的'),
        ]),
      ),
    ),
  );
  Widget _buildNavItem(int index,IconData outline,IconData filled,String label){
    final on=_currentIndex==index;
    return InkWell(
      borderRadius:BorderRadius.circular(YunyuRadius.lg),
      onTap:()=>_onTabTapped(index),
      child:SizedBox(width:60,child:Column(mainAxisAlignment:MainAxisAlignment.center,mainAxisSize:MainAxisSize.min,children:[
        AnimatedContainer(duration:YunyuV18.microMotion,padding:const EdgeInsets.symmetric(horizontal:13,vertical:5),
          decoration:BoxDecoration(color:on?YunyuColors.primaryLight:Colors.transparent,borderRadius:BorderRadius.circular(YunyuRadius.pill)),
          child:Icon(on?filled:outline,size:20,color:on?YunyuColors.primary:YunyuColors.textTertiary)),
        const SizedBox(height:3),
        Text(label,style:TextStyle(fontSize:10.5,fontWeight:on?FontWeight.w700:FontWeight.w500,color:on?YunyuColors.primary:YunyuColors.textTertiary)),
      ])),
    );
  }
  Widget _buildPublishButton()=>Transform.translate(
    offset:const Offset(0,-10),
    child:GestureDetector(
      onTap:()=>_onTabTapped(2),
      child:Container(width:YunyuV18.actionSize,height:YunyuV18.actionSize,decoration:BoxDecoration(
        gradient:YunyuColors.brandGradient,shape:BoxShape.circle,
        border:Border.all(color:Theme.of(context).colorScheme.surface,width:4),
        boxShadow:YunyuShadow.fab,
      ),child:const Icon(Icons.add_rounded,color:Colors.white,size:29)),
    ),
  );
}
class MessageCenterPlaceholder extends StatelessWidget{
  const MessageCenterPlaceholder({super.key});
  @override Widget build(BuildContext context)=>Scaffold(
    appBar:AppBar(automaticallyImplyLeading:false,title:Text('消息',style:YunyuTextStyle.h2)),
    body:const EmptyView(icon:Icons.chat_bubble_outline_rounded,message:'暂无消息',subMessage:'有新的互动和系统通知，会第一时间出现在这里 ☁️'),
  );
}
