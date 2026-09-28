import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../theme/yunyu_design.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    if (username.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('请输入用户名')));
      return;
    }
    if (password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('请输入密码')));
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.login(username, password);

    if (success && mounted) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else if (auth.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: YunyuColors.softGradient),
        child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(YunyuSpacing.page, YunyuV11.authTopSpace, YunyuSpacing.page, YunyuV11.pageBottomSafeGap),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              // Logo
              Center(
                child: Container(
                  width: YunyuV11.authLogo,
                  height: YunyuV11.authLogo,
                  decoration: BoxDecoration(
                    gradient: YunyuColors.brandGradient,
                    borderRadius: BorderRadius.circular(YunyuRadius.xxl),
                    boxShadow: YunyuShadow.fab,
                  ),
                  child: Icon(Icons.cloud, size: 44, color: Colors.white),
                ),
              ),
              SizedBox(height: YunyuSpacing.lg),
              Text('欢迎回到云屿', textAlign: TextAlign.center, style: YunyuTextStyle.h1),
              SizedBox(height: YunyuSpacing.xs),
              Text('在云间停靠，在岛上发现新的精彩', textAlign: TextAlign.center, style: YunyuTextStyle.caption),
              SizedBox(height: YunyuSpacing.xxxl),
              Container(
                padding: const EdgeInsets.all(YunyuSpacing.lg),
                decoration: BoxDecoration(color: YunyuColors.surface, borderRadius: BorderRadius.circular(YunyuV11.authCardRadius), boxShadow: YunyuShadow.card),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              // 用户名
              TextField(
                controller: _usernameController,
                decoration: InputDecoration(
                  labelText: '用户名',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              SizedBox(height: 16),
              // 密码
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: '密码',
                  prefixIcon: Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                onSubmitted: (_) => _login(),
              ),
              SizedBox(height: 24),
              // 登录按钮
              ElevatedButton(
                onPressed: auth.isLoading ? null : _login,
                child: auth.isLoading
                    ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text('登录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              ]),
              ),
              SizedBox(height: YunyuSpacing.lg),
              // 注册
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('还没有账号？', style: TextStyle(color: Colors.grey)),
                TextButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RegisterPage())),
                  child: Text('立即注册', style: TextStyle(color: ThemeProvider.primaryColor, fontWeight: FontWeight.bold)),
                ),
              ]),
              SizedBox(height: 24),
            ],
          ),
        ),
      ),
      ),
    );
  }
}
