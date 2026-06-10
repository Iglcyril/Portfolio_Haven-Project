import 'package:flutter/material.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/circle_clipper.dart';
import 'features/home/home_page.dart';
import 'features/intro/intro_screen.dart';

class HavenApp extends StatefulWidget {
  const HavenApp({super.key});

  @override
  State<HavenApp> createState() => _HavenAppState();
}

class _HavenAppState extends State<HavenApp> with TickerProviderStateMixin {
  ThemeMode _themeMode = ThemeMode.light;
  bool _showIntro = true;

  // Drives the contracting circle that reveals the home page after the intro.
  late final AnimationController _revealCtrl;

  @override
  void initState() {
    super.initState();
    _revealCtrl = AnimationController(
      duration: const Duration(milliseconds: 650),
      vsync: this,
    );
    _revealCtrl.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        // Overlay is gone — force a rebuild so the builder stops drawing it.
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _revealCtrl.dispose();
    super.dispose();
  }

  void _toggleTheme() {
    setState(() {
      _themeMode =
          _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  void _onIntroComplete() {
    // Swap to the real page, then immediately start the contracting circle.
    setState(() => _showIntro = false);
    _revealCtrl.forward();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Haven',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: _themeMode,
      // builder wraps every route — used here only for the transition overlay.
      builder: (ctx, child) {
        return Stack(
          children: [
            child!,
            // Contracting circle overlay: starts at full coverage, shrinks to
            // the logo center position, revealing the page underneath.
            if (!_revealCtrl.isCompleted && _revealCtrl.value > 0)
              AnimatedBuilder(
                animation: _revealCtrl,
                builder: (_, __) {
                  final size   = MediaQuery.of(ctx).size;
                  final center = Offset(
                    size.width / 2,
                    size.height * 760 / 1920,
                  );
                  // fraction: 1.0 (full screen) → 0.0 (nothing)
                  final fraction = 1.0 -
                      CurvedAnimation(
                        parent: _revealCtrl,
                        curve: Curves.easeOutCubic,
                      ).value;
                  if (fraction <= 0.001) return const SizedBox.shrink();
                  return Positioned.fill(
                    child: IgnorePointer(
                      child: ClipPath(
                        clipper: CircleClipper(
                          center: center,
                          fraction: fraction,
                        ),
                        child: const ColoredBox(
                          color: AppColors.darkGradientTop,
                        ),
                      ),
                    ),
                  );
                },
              ),
          ],
        );
      },
      home: _showIntro
          ? IntroScreen(onComplete: _onIntroComplete)
          : HomePage(onToggleTheme: _toggleTheme),
    );
  }
}
