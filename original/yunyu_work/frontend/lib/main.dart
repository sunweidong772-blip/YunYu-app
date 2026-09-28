import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'core/dio_client.dart';
import 'pages/auth/login_page.dart';
import 'pages/home/home_page.dart';
import 'theme/yunyu_design.dart';
import 'core/yunyu_v19_visual.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DioClient().init();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  final ThemeProvider _themeProvider = ThemeProvider();
  final AuthProvider _authProvider = AuthProvider();

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => _themeProvider..init()),
        ChangeNotifierProvider(create: (_) => _authProvider..init()),
      ],
      child: Consumer2<ThemeProvider, AuthProvider>(
        builder: (context, theme, auth, _) {
          return MaterialApp(
            title: '云屿',
            debugShowCheckedModeBanner: false,
            theme: theme.lightTheme,
            darkTheme: theme.darkTheme,
            themeMode: theme.themeMode,
            home: auth.isInitializing
                ? const YunyuBootPage()
                : auth.isLoggedIn ? const HomePage() : const LoginPage(),
            routes: {
              '/login': (context) => LoginPage(),
              '/home': (context) => HomePage(),
            },
          );
        },
      ),
    );
  }
}


class YunyuBootPage extends StatelessWidget {
  const YunyuBootPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: YunyuCloudBackdrop(child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 88, height: 88,
              decoration: BoxDecoration(
                gradient: YunyuColors.brandGradient,
                borderRadius: BorderRadius.circular(30),
                boxShadow: YunyuShadow.elevated,
              ),
              child: const Icon(Icons.cloud_rounded, color: Colors.white, size: 46),
            ),
            const SizedBox(height: 18),
            Text('云屿', style: YunyuTextStyle.h2.copyWith(fontSize: 25)),
            const SizedBox(height: 6),
            Text('在云间，找到属于你的岛屿', style: YunyuTextStyle.caption),
            const SizedBox(height: 26),
            const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.4)),
          ]),
        )),
    );
  }
}
