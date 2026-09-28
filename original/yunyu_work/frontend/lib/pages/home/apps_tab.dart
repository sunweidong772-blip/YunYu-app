import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/yunyu_design.dart';
import '../../providers/theme_provider.dart';
import '../app/app_detail_page.dart';
import '../app/app_publish_page.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/yunyu_v23_visual.dart';

class AppsTab extends StatefulWidget {
  const AppsTab({super.key});

  @override
  State<AppsTab> createState() => _AppsTabState();
}

class _AppsTabState extends State<AppsTab> {
  List<dynamic> _apps = [];
  bool _isLoading = true;
  String? _selectedCategory;
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = ['全部', '实用工具', '社交通讯', '影音娱乐', '学习教育', '游戏', 'Ai工具', '其他'];

  @override
  void initState() {
    super.initState();
    _loadApps();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 每次进入页面时重新加载软件列表
    _loadApps();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadApps() async {
    setState(() => _isLoading = true);
    try {
      final params = <String, dynamic>{'limit': 50};
      if (_selectedCategory != null && _selectedCategory != '全部') params['category'] = _selectedCategory;
      if (_searchController.text.isNotEmpty) params['search'] = _searchController.text;
      final result = await DioClient().get('/apps', queryParameters: params);
      setState(() {
        _apps = result['data']['list'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(automaticallyImplyLeading: false, title: Row(children: [Text('软件', style: YunyuTextStyle.h2), const SizedBox(width: 8), const Text('发现好软件', style: YunyuTextStyle.caption)])),
      floatingActionButton: auth.isLoggedIn
          ? GestureDetector(
              onTap: () async {
                final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => AppPublishPage()));
                if (result == true) _loadApps();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                decoration: BoxDecoration(
                  gradient: YunyuColors.brandGradient,
                  borderRadius: BorderRadius.circular(YunyuRadius.pill),
                  boxShadow: [BoxShadow(color: YunyuColors.primary.withOpacity(.4), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.upload_rounded, size: 20, color: Colors.white),
                  SizedBox(width: 8),
                  Text('发布软件', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                ]),
              ),
            )
          : null,
      body: Column(
        children: [
          YunyuBrandHero(eyebrow: 'YUNYU APPS', title: '发现新工具', subtitle: '把真正好用的软件带到你的岛上'),
          // 搜索框
          Padding(
            padding: EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '搜索软件...',
                prefixIcon: Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(icon: Icon(Icons.clear), onPressed: () { _searchController.clear(); _loadApps(); })
                    : null,
              ),
              onSubmitted: (_) => _loadApps(),
            ),
          ),
          // 分类
          Container(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.page),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category || (_selectedCategory == null && category == '全部');
                return Padding(
                  padding: EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedCategory = category);
                      _loadApps();
                    },
                    selectedColor: ThemeProvider.primaryColor, backgroundColor: YunyuColors.surface, side: BorderSide(color: isSelected ? ThemeProvider.primaryColor : YunyuColors.border),
                    labelStyle: TextStyle(color: isSelected ? Colors.white : YunyuColors.textSecondary, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500),
                  ),
                );
              },
            ),
          ),
          SizedBox(height: 8),
          // 软件列表
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadApps,
              child: _isLoading
                  ? LoadingView(message: '加载中...')
                  : _apps.isEmpty
                      ? EmptyView(icon: Icons.apps_outlined, message: '暂无软件')
                      : GridView.builder(
                          padding: EdgeInsets.all(16),
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.85,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: _apps.length,
                          itemBuilder: (context, index) => _buildAppCard(_apps[index]),
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppCard(dynamic app) {
    return Container(
      decoration: BoxDecoration(
        color: YunyuColors.surface,
        borderRadius: BorderRadius.circular(YunyuRadius.lg),
        boxShadow: YunyuShadow.card,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailPage(appId: app['id']))),
          borderRadius: BorderRadius.circular(YunyuRadius.lg),
          child: Padding(
            padding: EdgeInsets.all(YunyuSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      gradient: YunyuColors.brandGradient,
                      borderRadius: BorderRadius.circular(YunyuRadius.md),
                    ),
                    child: app['icon_url'] != null && app['icon_url'].toString().isNotEmpty
                        ? ClipRRect(borderRadius: BorderRadius.circular(YunyuRadius.md), child: Image.network(app['icon_url'], fit: BoxFit.cover))
                        : Icon(Icons.apps, size: 28, color: Colors.white),
                  ),
                ),
                SizedBox(height: YunyuSpacing.sm),
                Text(app['name'] ?? '', style: YunyuTextStyle.title.copyWith(fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
                SizedBox(height: 2),
                Text(app['category'] ?? '', style: YunyuTextStyle.tiny, textAlign: TextAlign.center),
                Spacer(),
                Row(children: [
                  Icon(Icons.download, size: 12, color: YunyuColors.textTertiary),
                  SizedBox(width: 2),
                  Text('${app['download_count'] ?? 0}', style: YunyuTextStyle.tiny),
                  Spacer(),
                  Text('v${app['version'] ?? '1.0'}', style: YunyuTextStyle.tiny.copyWith(color: YunyuColors.primary, fontWeight: FontWeight.w600)),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
