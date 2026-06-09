import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/home/home_page.dart';
import 'features/intro/intro_screen.dart';

class HavenApp extends StatefulWidget {
  const HavenApp({super.key});

  @override
  State<HavenApp> createState() => _HavenAppState();
}

class _HavenAppState extends State<HavenApp> {
  ThemeMode _themeMode = ThemeMode.light;
  bool _showIntro = true;

  void _toggleTheme() {
    setState(() {
      _themeMode =
          _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haven',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: _themeMode,
      home: _showIntro
          ? IntroScreen(
              onComplete: () => setState(() => _showIntro = false),
            )
          : HomePage(onToggleTheme: _toggleTheme),
    );
  }
}
