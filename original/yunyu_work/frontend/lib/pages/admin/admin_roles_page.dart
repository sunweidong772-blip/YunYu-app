import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';

class AdminRolesPage extends StatelessWidget {
  const AdminRolesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('管理员职责')),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: YunyuColors.heroGradient,
              borderRadius: BorderRadius.circular(YunyuRadius.xl),
              boxShadow: YunyuShadow.elevated,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Icon(Icons.shield_rounded, color: Colors.white),
                  SizedBox(width: 8),
                  Text('云屿管理员体系', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                ]),
                SizedBox(height: 8),
                Text('不同等级拥有不同职责与权限', style: TextStyle(color: Colors.white.withOpacity(0.82), fontSize: 13)),
              ],
            ),
          ),
          SizedBox(height: 16),
          _role('云屿岛主', 'Owner / 创始人', '最高权限，仅创始人拥有', ['管理全部管理员','任命/解除管理员','管理全部权限','系统核心设置','最终处罚裁决','官方认证与重大事务'], Icons.workspace_premium_rounded, Color(0xFFC18A2A)),
          _role('云屿议长', 'Chief Admin / 最高管理员', '协助管理整个云屿', ['协助管理整个云屿','管理其他管理员','审核重大处罚','处理重大申诉','查看管理员操作日志'], Icons.account_balance_rounded, Color(0xFF7C64D1)),
          _role('云屿守护者', 'Super Admin / 超级管理员', '负责核心社区秩序与安全', ['处理严重违规','封禁/解封用户','管理举报','审核申诉','紧急处理异常内容','查看数据统计'], Icons.shield_rounded, Color(0xFFD8606F)),
          _role('审核管理员', 'Moderator / 审核员', '负责内容审核', ['帖子审核','软件审核','评论审核','短期禁言','用户申诉初审'], Icons.fact_check_rounded, YunyuColors.primary),
          _role('巡检管理员', 'Inspector / 巡检员', '负责巡查内容，发现问题', ['巡查帖子、评论、软件','发现违规内容','提交违规记录','提醒用户修改','上报严重问题'], Icons.travel_explore_rounded, Color(0xFF2BA89B)),
          _role('社区管理员', 'Community Admin / 社区管理员', '负责日常社区服务', ['新用户引导','回复用户问题','维护评论区氛围','处理普通纠纷','收集问题反馈'], Icons.support_agent_rounded, Color(0xFF51A978)),
          SizedBox(height: 8),
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: YunyuColors.primaryLight,
              borderRadius: BorderRadius.circular(YunyuRadius.lg),
              border: Border.all(color: YunyuColors.border),
            ),
            child: Row(children: [
              Icon(Icons.info_outline_rounded, color: YunyuColors.primary),
              SizedBox(width: 10),
              Expanded(child: Text('巡检管理员和社区管理员不拥有处罚权限，只负责发现、服务与上报。', style: YunyuTextStyle.caption.copyWith(color: YunyuColors.textSecondary))),
            ]),
          ),
          SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _role(String title, String subtitle, String desc, List<String> perms, IconData icon, Color color) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: YunyuColors.surface,
        borderRadius: BorderRadius.circular(YunyuRadius.lg),
        border: Border.all(color: color.withOpacity(0.14)),
        boxShadow: YunyuShadow.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: color, size: 21),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: YunyuTextStyle.title),
                  Text(subtitle, style: YunyuTextStyle.tiny.copyWith(color: color)),
                ],
              ),
            ),
          ]),
          SizedBox(height: 12),
          Text(desc, style: YunyuTextStyle.caption),
          SizedBox(height: 12),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: perms.map((p) => Container(
              padding: EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(color: color.withOpacity(0.07), borderRadius: BorderRadius.circular(YunyuRadius.pill)),
              child: Text(p, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
            )).toList(),
          ),
        ],
      ),
    );
  }
}
