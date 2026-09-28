import 'package:flutter/material.dart';
import '../../core/yunyu_v25_visual.dart';

class PrivacyPage extends StatelessWidget {
  const PrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('隐私政策')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            YunyuInfoHero(eyebrow: '隐私与安全', title: '隐私政策', subtitle: '清晰说明信息如何被使用与保护', icon: Icons.shield_outlined),
            SizedBox(height: 20),
            Text('云屿隐私政策', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('更新日期：2026年8月31日', style: TextStyle(color: Colors.grey, fontSize: 12)),
            SizedBox(height: 24),
            _buildSection('引言', '云屿非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用云屿服务前仔细阅读本政策。'),
            _buildSection('一、我们收集的信息', '1. 您主动提供的信息：\n   - 注册信息：用户名、密码\n   - 个人资料：昵称、头像、个人简介\n   - 发布内容：帖子、软件、评论等\n\n2. 我们自动收集的信息：\n   - 设备信息：设备型号、操作系统版本\n   - 日志信息：访问时间、访问IP、操作记录\n   - 使用信息：浏览记录、点赞、收藏、关注等'),
            _buildSection('二、我们如何使用信息', '1. 提供、维护和改进云屿服务；\n2. 向您发送服务通知、更新提醒；\n3. 进行数据分析，优化产品体验；\n4. 保障账号安全，防范欺诈和滥用；\n5. 遵守法律法规的要求。'),
            _buildSection('三、信息的存储与保护', '1. 我们将您的个人信息存储在安全的服务器上，并采取加密等技术措施保护您的信息安全。\n2. 我们建立了严格的数据访问权限控制，只有授权人员才能访问您的个人信息。\n3. 我们会在实现目的所必需的最短时间内保留您的个人信息。'),
            _buildSection('四、信息的共享与披露', '我们不会向第三方出售您的个人信息。仅在以下情况下，我们可能会共享您的信息：\n1. 获得您的明确同意；\n2. 为完成服务所必需的第三方服务提供商；\n3. 法律法规要求或政府主管部门的强制性要求；\n4. 为维护云屿及用户的合法权益。'),
            _buildSection('五、您的权利', '您对您的个人信息享有以下权利：\n1. 访问权：您可以随时查看您的个人信息；\n2. 更正权：您可以随时修改您的个人资料；\n3. 删除权：您可以要求删除您的个人信息；\n4. 注销权：您可以随时注销您的账号。'),
            _buildSection('六、未成年人保护', '云屿非常重视未成年人的隐私保护。如果您是未满18周岁的未成年人，请在监护人的指导下使用云屿服务。我们不会主动收集未成年人的个人信息。'),
            _buildSection('七、Cookie和类似技术', '我们可能会使用Cookie和类似技术来提升您的使用体验。您可以通过浏览器设置管理或删除Cookie。'),
            _buildSection('八、隐私政策的更新', '我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，重大变更会通过显著方式通知您。'),
            _buildSection('九、联系我们', '如果您对本隐私政策有任何疑问或建议，请通过邮箱3750481994@qq.com或加入官方QQ群联系我们。'),
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
