import 'package:flutter/material.dart';
import '../../theme/yunyu_design.dart';

class ChangelogPage extends StatelessWidget {
  const ChangelogPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 160,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(gradient: YunyuColors.heroGradient),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text('云屿 App', style: TextStyle(color: Colors.white.withOpacity(.7), fontSize: 12, letterSpacing: 1.2, fontWeight: FontWeight.w600)),
                        SizedBox(height: 4),
                        Text('版本更新日志', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800)),
                        SizedBox(height: 4),
                        Text('记录云屿每一次成长与变化', style: TextStyle(color: Colors.white.withOpacity(.75), fontSize: 13)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLatestSection(context),
                  SizedBox(height: 28),
                  _buildVersionSection(
                    context,
                    version: '4.0.0',
                    title: '云屿正式升级',
                    subtitle: '一个更完整的云屿',
                    isLatest: false,
                    content: [
                      '云屿 4.0 是一次重要的产品阶段升级。',
                      '这一版本进一步整合软件、社区、用户、身份与管理能力。',
                      '云屿不再只是一个简单的软件库，而是一个正在持续成长的：软件发现 · 兴趣交流 · 内容分享 · 用户社区',
                    ],
                    features: [
                      '云屿软件', '社区内容流', '帖子发布与互动', '评论系统',
                      '用户主页', '我的帖子', '收藏内容', '消息中心',
                      '个人中心', '设置系统', '用户等级', '身份头衔',
                      '管理员体系', '软件管理', '内容审核', '举报处理', '管理中心',
                    ],
                  ),
                  SizedBox(height: 28),
                  _buildVersionSection(
                    context,
                    version: '3.x',
                    title: '功能持续完善',
                    subtitle: '在云屿的发展过程中，持续完善产品功能与用户体验',
                    isLatest: false,
                    content: [],
                    features: [
                      '软件发布流程', '软件审核机制', '帖子发布', '帖子评论',
                      '内容互动', '收藏功能', '消息系统', '用户主页',
                      '个人资料', '设置中心', '管理员系统', '内容审核',
                      '用户管理', '举报处理', '数据管理',
                    ],
                    footer: '同时，我们也开始建立云屿自己的身份与成长体系，让不同用户在云屿拥有属于自己的身份标识与成长记录。',
                  ),
                  SizedBox(height: 28),
                  _buildVersionSection(
                    context,
                    version: '3.0.0',
                    title: '云屿品牌重构',
                    subtitle: '青歌软件库，正式走向云屿',
                    isLatest: false,
                    content: [
                      '为了让产品拥有更加独立、完整的品牌形象，我们进行了重要的品牌升级。',
                      '「青歌软件库」逐渐升级为：云屿',
                      '云，代表连接、自由与陪伴。屿，代表属于每一位用户自己的小岛。',
                      '我们希望云屿不仅仅是一个工具或软件平台，而是一个在网络世界里，让人们发现内容、分享兴趣、交流想法，并找到属于自己位置的地方。',
                    ],
                    features: [
                      '正式启用「云屿」品牌名称',
                      '建立云屿品牌视觉方向',
                      '软件库升级为云屿软件生态',
                      '社区系统进一步完善',
                      '用户身份体系开始建立',
                      '产品整体定位重新规划',
                    ],
                  ),
                  SizedBox(height: 28),
                  _buildVersionSection(
                    context,
                    version: '2.0.0',
                    title: '产品升级与社区探索',
                    subtitle: '从软件库，开始走向用户社区',
                    isLatest: false,
                    content: [
                      '随着功能不断完善，产品不再只关注"软件下载"。',
                      '我们开始思考：一个软件平台，是否也可以成为用户交流、分享与发现的地方？',
                      '因此，产品逐渐加入社区化方向。',
                    ],
                    features: [
                      '社区内容功能', '用户发帖', '帖子互动', '点赞与评论',
                      '用户主页', '收藏内容', '消息与互动系统', '更完善的账号体系',
                    ],
                    footer: '产品开始从单纯的软件资源工具，逐步向"软件 + 社区"的方向发展。',
                  ),
                  SizedBox(height: 28),
                  _buildVersionSection(
                    context,
                    version: '1.0.0',
                    title: '青歌软件库',
                    subtitle: '青歌软件库正式诞生，这是项目的起点',
                    isLatest: false,
                    content: [
                      '青歌软件库最初定位为一款面向用户的软件资源与软件下载平台，提供软件浏览、软件详情、资源下载等基础服务。',
                    ],
                    features: [
                      '软件资源浏览', '软件分类', '软件详情展示',
                      '软件发布与管理', '用户账号系统', '基础个人中心', '基础管理功能',
                    ],
                    footer: '青歌软件库 1.0 的出现，正式开启了这个项目的发展。',
                  ),
                  SizedBox(height: 40),
                  Center(
                    child: Column(
                      children: [
                        Icon(Icons.cloud_rounded, size: 32, color: YunyuColors.primary.withOpacity(.4)),
                        SizedBox(height: 8),
                        Text('在云间相遇 · 在屿上停留', style: YunyuTextStyle.caption.copyWith(color: YunyuColors.textTertiary)),
                        SizedBox(height: 4),
                        Text('版本：4.1.0', style: YunyuTextStyle.tiny.copyWith(color: YunyuColors.textTertiary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLatestSection(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: YunyuColors.softGradient,
        borderRadius: BorderRadius.circular(YunyuRadius.xl),
        border: Border.all(color: YunyuColors.primary.withOpacity(.15)),
        boxShadow: YunyuShadow.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  gradient: YunyuColors.brandGradient,
                  borderRadius: BorderRadius.circular(YunyuRadius.pill),
                ),
                child: Text('最新版本', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: .5)),
              ),
              SizedBox(width: 8),
              Text('4.1.0', style: YunyuTextStyle.h2.copyWith(color: YunyuColors.primary)),
            ],
          ),
          SizedBox(height: 8),
          Text('UI 视觉体验升级', style: YunyuTextStyle.h3),
          SizedBox(height: 4),
          Text('全新的云屿视觉体验', style: YunyuTextStyle.caption),
          SizedBox(height: 14),
          Text('本次更新为云屿 4.0 的小版本视觉升级。我们更关注一件事：让云屿真正拥有属于自己的视觉语言。', style: YunyuTextStyle.body.copyWith(height: 1.65)),
          SizedBox(height: 16),
          _buildFeatureGroup('全新云屿 Design System', [
            '统一品牌色彩、页面背景、字体层级、页面留白',
            '统一卡片圆角、按钮高度、图标尺寸、阴影效果',
            '统一信息层级、空状态、加载状态、错误状态',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('首页与社区内容流升级', [
            '首页品牌视觉、内容流结构、帖子信息层级',
            '用户身份展示、头像尺寸、内容卡片',
            '热门与最新内容、评论阅读体验',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('云屿软件体验升级', [
            '软件页面品牌视觉、软件卡片、软件图标比例',
            '软件详情信息层级、软件介绍阅读体验',
            '版本信息展示、发布者信息、软件发布页面',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('个人中心升级', [
            '个人身份展示、用户等级、身份头衔、管理员身份',
            '个人资料、我的内容、收藏内容、用户主页',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('消息与设置体验升级', [
            '消息中心：会话信息层级、头像与未读提示、消息列表、聊天页面留白、空状态',
            '设置中心：重新规划为账号 / 外观 / 通用 / 关于云屿',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('登录与认证体验升级', [
            '全新的云屿入口体验：进入云屿',
            '品牌入口、页面留白、登录表单、输入组件、按钮层级',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('管理中心视觉升级', [
            '管理员系统升级为：云屿 · 管理中心',
            '管理概览、工作台、用户管理、内容审核、软件审核、举报中心、数据统计',
          ]),
          SizedBox(height: 14),
          _buildFeatureGroup('图标与资源优化', [
            '图标尺寸统一、视觉重心统一、使用规范统一',
            'Android 资源结构检查、PNG/XML 资源冲突检查',
            '保留正常系统 XML 资源',
          ]),
          SizedBox(height: 18),
          Container(
            padding: EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: YunyuColors.primaryLight,
              borderRadius: BorderRadius.circular(YunyuRadius.md),
            ),
            child: Text(
              '云屿 4.1.0 并不是一次简单的"换皮"。这是一次全页面视觉统一，也是云屿第一次真正建立完整设计语言。',
              style: YunyuTextStyle.caption.copyWith(color: YunyuColors.primaryDark, height: 1.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureGroup(String title, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: YunyuTextStyle.title.copyWith(fontSize: 14)),
        SizedBox(height: 8),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 5),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: EdgeInsets.only(top: 5, right: 8),
                width: 5, height: 5,
                decoration: BoxDecoration(color: YunyuColors.primary, shape: BoxShape.circle),
              ),
              Expanded(child: Text(item, style: YunyuTextStyle.caption.copyWith(height: 1.55))),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildVersionSection(
    BuildContext context, {
    required String version,
    required String title,
    required String subtitle,
    required bool isLatest,
    required List<String> content,
    required List<String> features,
    String? footer,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: YunyuColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(child: Text(version.split('.')[0], style: TextStyle(color: YunyuColors.primary, fontWeight: FontWeight.w800, fontSize: 14))),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('$version · ', style: YunyuTextStyle.title.copyWith(color: YunyuColors.primary)),
                      Expanded(child: Text(title, style: YunyuTextStyle.title, maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  SizedBox(height: 2),
                  Text(subtitle, style: YunyuTextStyle.caption),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 12),
        if (content.isNotEmpty) ...[
          ...content.map((p) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(p, style: YunyuTextStyle.body.copyWith(height: 1.65, color: YunyuColors.textSecondary)),
          )),
          SizedBox(height: 4),
        ],
        if (features.isNotEmpty) ...[
          Text('核心功能', style: YunyuTextStyle.caption.copyWith(color: YunyuColors.textTertiary, fontWeight: FontWeight.w700)),
          SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: features.map((f) => Container(
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: YunyuColors.surfaceVariant,
                borderRadius: BorderRadius.circular(YunyuRadius.pill),
              ),
              child: Text(f, style: TextStyle(fontSize: 11, color: YunyuColors.textSecondary, fontWeight: FontWeight.w500)),
            )).toList(),
          ),
        ],
        if (footer != null) ...[
          SizedBox(height: 12),
          Text(footer, style: YunyuTextStyle.caption.copyWith(height: 1.6, fontStyle: FontStyle.italic)),
        ],
        SizedBox(height: 20),
        Divider(color: YunyuColors.divider, height: 1),
      ],
    );
  }
}
