import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/yunyu_design.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;

  // 兼容旧代码的静态颜色
  static const Color primaryColor = YunyuColors.primary;
  static const Color secondaryColor = YunyuColors.secondary;
  static const Color accentColor = Color(0xFFEE6B73);
  static const Color bgLight = YunyuColors.background;
  static const Color bgDark = Color(0xFF0F172A);

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final theme = prefs.getString('theme_mode');
    if (theme == 'light') _themeMode = ThemeMode.light;
    else if (theme == 'dark') _themeMode = ThemeMode.dark;
    else _themeMode = ThemeMode.system;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', mode.name);
    notifyListeners();
  }

  ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: YunyuColors.primary,
      scaffoldBackgroundColor: YunyuColors.background,
      colorScheme: ColorScheme.light(
        primary: YunyuColors.primary,
        secondary: YunyuColors.secondary,
        surface: YunyuColors.surface,
        error: YunyuColors.error,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: YunyuColors.surface,
        scrolledUnderElevation: 0,
        foregroundColor: YunyuColors.textPrimary,
        elevation: 0,
        toolbarHeight: 60,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: YunyuTextStyle.h3,
        iconTheme: IconThemeData(color: YunyuColors.textPrimary),
      ),
      cardTheme: CardTheme(
        color: YunyuColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shadowColor: Color(0x0A000000),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.lg), side: BorderSide(color: YunyuColors.border)),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: YunyuColors.primary,
        textColor: YunyuColors.textPrimary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.lg)),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: YunyuColors.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: const CircleBorder(),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: YunyuColors.surfaceVariant,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(YunyuRadius.md), borderSide: BorderSide(color: YunyuColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(YunyuRadius.md), borderSide: BorderSide(color: YunyuColors.primary, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(YunyuRadius.md), borderSide: BorderSide.none),
        contentPadding: EdgeInsets.symmetric(horizontal: YunyuSpacing.lg, vertical: YunyuSpacing.md),
        hintStyle: YunyuTextStyle.body.copyWith(color: YunyuColors.textTertiary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: YunyuColors.primary,
          foregroundColor: YunyuColors.textInverse,
          elevation: 0,
          shadowColor: Color(0x405BAEFF),
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.xl, vertical: YunyuSpacing.md),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
          textStyle: YunyuTextStyle.button,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: YunyuColors.primary,
          side: BorderSide(color: YunyuColors.primary, width: 1.5),
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.xl, vertical: YunyuSpacing.md),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
          textStyle: YunyuTextStyle.button.copyWith(color: YunyuColors.primary),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: YunyuColors.primary,
          textStyle: YunyuTextStyle.body.copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: YunyuColors.surface,
        selectedItemColor: YunyuColors.primary,
        unselectedItemColor: YunyuColors.textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11),
      ),
      dividerTheme: DividerThemeData(
        color: YunyuColors.divider,
        thickness: 1,
        space: 1,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: YunyuColors.primaryLight,
        labelStyle: YunyuTextStyle.tag.copyWith(color: YunyuColors.primary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.pill)),
        side: BorderSide.none,
        padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.sm, vertical: YunyuSpacing.xs),
      ),
      tabBarTheme: TabBarTheme(
        labelColor: YunyuColors.primary,
        unselectedLabelColor: YunyuColors.textSecondary,
        indicatorColor: YunyuColors.primary,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: YunyuTextStyle.body.copyWith(fontWeight: FontWeight.w700),
        unselectedLabelStyle: YunyuTextStyle.body,
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: YunyuColors.surface,
        elevation: 8,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.lg)),
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(color: YunyuColors.textPrimary, borderRadius: BorderRadius.circular(YunyuRadius.sm)),
        textStyle: YunyuTextStyle.caption.copyWith(color: Colors.white),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected) ? Colors.white : YunyuColors.textTertiary),
        trackColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected) ? YunyuColors.primary : YunyuColors.border),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: YunyuColors.primary, linearTrackColor: YunyuColors.primaryLight),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: YunyuColors.surface,
        modalBackgroundColor: YunyuColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(YunyuRadius.xl))),
        showDragHandle: true,
      ),
      iconButtonTheme: IconButtonThemeData(style: IconButton.styleFrom(
        foregroundColor: YunyuColors.textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
      )),
      textTheme: const TextTheme(
        headlineLarge: YunyuTextStyle.h1,
        headlineMedium: YunyuTextStyle.h2,
        titleLarge: YunyuTextStyle.h3,
        titleMedium: YunyuTextStyle.title,
        bodyLarge: YunyuTextStyle.body,
        bodyMedium: YunyuTextStyle.body,
        bodySmall: YunyuTextStyle.caption,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: YunyuColors.textPrimary,
        contentTextStyle: TextStyle(color: YunyuColors.textInverse, fontSize: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
        behavior: SnackBarBehavior.floating,
      ),
      dialogTheme: DialogTheme(
        backgroundColor: YunyuColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.xl)),
        titleTextStyle: YunyuTextStyle.h3,
        contentTextStyle: YunyuTextStyle.body,
      ),
    );
  }

  ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: YunyuColors.primary,
      scaffoldBackgroundColor: Color(0xFF0F172A),
      colorScheme: ColorScheme.dark(
        primary: YunyuColors.primary,
        secondary: YunyuColors.secondary,
        surface: Color(0xFF1E293B),
        error: YunyuColors.error,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Color(0xFF0F172A),
        scrolledUnderElevation: 0,
        foregroundColor: Colors.white,
        elevation: 0,
        toolbarHeight: 60,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardTheme(
        color: Color(0xFF1E293B),
        margin: EdgeInsets.zero,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.lg), side: BorderSide(color: const Color(0xFF26354A))),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true, fillColor: const Color(0xFF172235),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(YunyuRadius.md), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(YunyuRadius.md), borderSide: const BorderSide(color: YunyuColors.primary, width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: YunyuSpacing.lg, vertical: YunyuSpacing.md),
      ),
      listTileTheme: ListTileThemeData(iconColor: YunyuColors.sky, textColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 5), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.lg))),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: YunyuColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: EdgeInsets.symmetric(horizontal: YunyuSpacing.xl, vertical: YunyuSpacing.md),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md)),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1E293B),
        selectedItemColor: YunyuColors.sky,
        unselectedItemColor: const Color(0xFF718096),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      tabBarTheme: TabBarTheme(labelColor: YunyuColors.sky, unselectedLabelColor: const Color(0xFF9AA5B6), indicatorColor: YunyuColors.sky),
      snackBarTheme: SnackBarThemeData(backgroundColor: const Color(0xFF26354A), behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.md))),
      dialogTheme: DialogTheme(backgroundColor: const Color(0xFF1E293B), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(YunyuRadius.xl))),
      bottomSheetTheme: BottomSheetThemeData(backgroundColor: const Color(0xFF1E293B), modalBackgroundColor: const Color(0xFF1E293B), shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(YunyuRadius.xl))), showDragHandle: true),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: YunyuColors.sky),
    );
  }
}
