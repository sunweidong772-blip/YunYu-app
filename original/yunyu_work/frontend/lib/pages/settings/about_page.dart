import 'package:flutter/material.dart';
import '../../providers/theme_provider.dart';
import 'agreement_page.dart';
import 'privacy_page.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/yunyu_v25_visual.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('关于云屿')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
        children: [
          YunyuInfoHero(eyebrow: 'ABOUT YUNYU', title: '关于云屿', subtitle: '在云间发现好软件，在岛上遇见同好。', icon: Icons.cloud_outlined),
          SizedBox(height: 28),
          // Logo
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [ThemeProvider.primaryColor, ThemeProvider.secondaryColor]),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: ThemeProvider.primaryColor.withOpacity(0.3), blurRadius: 20, offset: Offset(0, 10))],
              ),
              child: Icon(Icons.cloud, size: 40, color: Colors.white),
            ),
          ),
          SizedBox(height: 16),
          Text('云屿', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          SizedBox(height: 4),
          Text('版本 4.2.6', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 13)),
          SizedBox(height: 8),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 40),
            child: Text('社区驱动的软件聚合平台，发现优质应用，分享技术心得', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5)),
          ),
          SizedBox(height: 32),
          Divider(),
          ListTile(
            leading: Icon(Icons.description_outlined, color: ThemeProvider.primaryColor),
            title: Text('用户协议'),
            trailing: Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AgreementPage())),
          ),
          ListTile(
            leading: Icon(Icons.privacy_tip_outlined, color: ThemeProvider.primaryColor),
            title: Text('隐私政策'),
            trailing: Icon(Icons.chevron_right),
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PrivacyPage())),
          ),
          ListTile(
            leading: Icon(Icons.people_outline, color: ThemeProvider.primaryColor),
            title: Text('开发者团队'),
            subtitle: Text('云屿开发团队', style: TextStyle(fontSize: 12)),
            trailing: Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (d) => AlertDialog(
                  title: Text('开发者团队'),
                  content: Text('云屿开发团队\n\n致力于打造国内一流的社区/软件聚合平台，为用户提供优质的应用发现和社区交流体验。'),
                  actions: [TextButton(onPressed: () => Navigator.pop(d), child: Text('确定'))],
                ),
              );
            },
          ),
          ListTile(
            leading: Icon(Icons.feedback_outlined, color: ThemeProvider.primaryColor),
            title: Text('意见反馈'),
            subtitle: Text('发送邮件到3750481994@qq.com', style: TextStyle(fontSize: 12)),
            trailing: Icon(Icons.chevron_right),
            onTap: () async {
              final uri = Uri(
                scheme: 'mailto',
                path: '3750481994@qq.com',
                query: 'subject=云屿APP意见反馈',
              );
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              } else {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('无法打开邮件应用，请手动发送邮件到3750481994@qq.com')));
                }
              }
            },
          ),
          ListTile(
            leading: Icon(Icons.group_outlined, color: Color(0xFF12B7F5)),
            title: Text('官方QQ群'),
            subtitle: Text('加入QQ群反馈问题，与大家交流', style: TextStyle(fontSize: 12)),
            trailing: Icon(Icons.chevron_right),
            onTap: () async {
              final uri = Uri.parse('https://qm.qq.com/q/B1QXPTzAbe');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              } else {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('无法打开QQ，请手动复制链接加入')));
                }
              }
            },
          ),
          Divider(),
          SizedBox(height: 16),
          Center(child: Text('© 2026 云屿 版权所有', style: TextStyle(color: Colors.grey, fontSize: 12))),
          SizedBox(height: 24),
        ],
      ),
    );
  }
}
