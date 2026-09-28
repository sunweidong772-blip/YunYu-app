import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../widgets/common_widgets.dart';
import '../app/app_detail_page.dart';

class FavoritesPage extends StatefulWidget {
  const FavoritesPage({super.key});

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  List<dynamic> _apps = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    try {
      final result = await DioClient().get('/my/favorites');
      setState(() {
        _apps = result['data'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) showError(context, e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('我的收藏')),
      body: RefreshIndicator(
        onRefresh: _loadFavorites,
        child: _isLoading
            ? LoadingView()
            : _apps.isEmpty
                ? EmptyView(icon: Icons.favorite_border, message: '暂无收藏的软件')
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _apps.length,
                    itemBuilder: (context, index) {
                      final app = _apps[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: app['icon_url'] != null && app['icon_url'].toString().isNotEmpty
                              ? ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(app['icon_url'], width: 48, height: 48, fit: BoxFit.cover))
                              : Container(width: 48, height: 48, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(8)), child: Icon(Icons.apps, color: Colors.grey)),
                          title: Text(app['name'] ?? '', style: TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${app['category'] ?? ''} · ${app['version'] ?? ''}'),
                          trailing: Icon(Icons.chevron_right),
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailPage(appId: app['id']))),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
