import 'package:flutter/material.dart';
import '../../core/yunyu_v25_visual.dart';

class AgreementPage extends StatelessWidget {
  const AgreementPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('用户协议')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            YunyuInfoHero(eyebrow: '云屿服务', title: '用户协议', subtitle: '一起维护友好、安全的云屿社区', icon: Icons.handshake_outlined),
            SizedBox(height: 20),
            Text('云屿用户服务协议', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('更新日期：2026年8月31日', style: TextStyle(color: Colors.grey, fontSize: 12)),
            SizedBox(height: 24),
            _buildSection('一、协议的接受与修改', '欢迎使用云屿！本协议是您与云屿之间关于使用云屿服务所订立的协议。您在使用云屿服务前，应当仔细阅读本协议的全部内容。您使用云屿服务即视为您已阅读并同意本协议的全部内容。'),
            _buildSection('二、账号注册与使用', '1. 您在注册云屿账号时，应当提供真实、准确、完整的个人信息。\n2. 您应妥善保管账号和密码，对账号下的所有行为承担责任。\n3. 用户名长度为3-40位，密码至少6位。\n4. 您不得将账号转让、出借或以其他方式允许他人使用。'),
            _buildSection('三、用户行为规范', '您在使用云屿服务时，应当遵守法律法规，不得发布、传播以下内容：\n1. 违反宪法确定的基本原则的；\n2. 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；\n3. 损害国家荣誉和利益的；\n4. 煽动民族仇恨、民族歧视，破坏民族团结的；\n5. 破坏国家宗教政策，宣扬邪教和封建迷信的；\n6. 散布谣言，扰乱社会秩序，破坏社会稳定的；\n7. 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；\n8. 侮辱或者诽谤他人，侵害他人合法权益的；\n9. 含有法律、行政法规禁止的其他内容的。'),
            _buildSection('四、内容审核与处理', '1. 您发布的帖子、软件等内容需要经过管理员审核后才会公开显示。\n2. 云屿有权对违反本协议的内容进行删除、屏蔽等处理。\n3. 对于严重违反本协议的用户，云屿有权封禁其账号。'),
            _buildSection('五、知识产权', '1. 您在云屿上发布的原创内容，其知识产权归您所有。\n2. 您授予云屿在全球范围内免费使用、复制、修改、展示该内容的非独家许可。\n3. 云屿的商标、标识、界面设计等知识产权归云屿所有。'),
            _buildSection('六、免责声明', '1. 云屿服务按"现状"提供，云屿不对服务的可用性、准确性、完整性做出任何明示或暗示的保证。\n2. 因不可抗力、系统故障、网络中断等原因导致的服务中断或数据丢失，云屿不承担责任。\n3. 您通过云屿下载的软件，其安全性、合法性由软件提供者负责，云屿不承担责任。'),
            _buildSection('七、协议的终止', '1. 您可以随时停止使用云屿服务并注销账号。\n2. 您严重违反本协议时，云屿有权终止向您提供服务。\n3. 协议终止后，本协议中关于知识产权、免责声明、争议解决等条款仍然有效。'),
            _buildSection('八、争议解决', '本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，任何一方均可向云屿所在地有管辖权的人民法院提起诉讼。'),
            SizedBox(height: 24),
            Text('如有任何疑问，请通过邮箱3750481994@qq.com或加入官方QQ群联系我们。', style: TextStyle(color: Colors.grey, fontSize: 13)),
            SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: YunyuInfoSection(title: title, content: content),
    );
  }
}
