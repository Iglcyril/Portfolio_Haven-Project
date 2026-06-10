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
      duration: const Duration(milliseconds: 950),
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
      // builder adds the contracting-circle overlay on top of every route.
      // _RevealOverlay manages its own AnimatedBuilder so child! is never
      // affected by the overlay's rebuilds.
      builder: (ctx, child) {
        return Stack(
          children: [
            child!,
            _RevealOverlay(ctrl: _revealCtrl),
          ],
        );
      },
      home: _showIntro
          ? IntroScreen(onComplete: _onIntroComplete)
          : HomePage(onToggleTheme: _toggleTheme),
    );
  }
}

// Contracting circle that reveals the page underneath after the intro.
// Only visible while _revealCtrl is actively running (status == forward).
// When dismissed (value=0, not yet started) it returns nothing — this is
// what prevented the overlay from covering the screen during the intro.
class _RevealOverlay extends StatelessWidget {
  final AnimationController ctrl;
  const _RevealOverlay({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ctrl,
      builder: (ctx, __) {
        // Hidden when not yet started or already finished
        if (ctrl.status == AnimationStatus.dismissed ||
            ctrl.status == AnimationStatus.completed) {
          return const SizedBox.shrink();
        }

        final fraction = 1.0 -
            CurvedAnimation(parent: ctrl, curve: Curves.easeOutQuart).value;
        if (fraction <= 0.001) return const SizedBox.shrink();

        final size = MediaQuery.of(ctx).size;
        return Positioned.fill(
          child: IgnorePointer(
            child: ClipPath(
              clipper: CircleClipper(
                center: Offset(size.width / 2, size.height * 760 / 1920),
                fraction: fraction,
              ),
              child: const ColoredBox(color: AppColors.darkGradientTop),
            ),
          ),
        );
      },
    );
  }
}
