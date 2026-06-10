import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

class TutorialPage extends StatefulWidget {
  const TutorialPage({super.key});

  @override
  State<TutorialPage> createState() => _TutorialPageState();
}

class _TutorialPageState extends State<TutorialPage>
    with TickerProviderStateMixin {
  static const _totalPages = 3;
  final _pageCtrl = PageController();
  int _currentPage = 0;

  late final List<AnimationController> _animCtrl;

  // Screen 1 — animations staggerées
  late final Animation<double> _s1TitleBig;
  late final Animation<Offset> _s1TitleBigSlide;
  late final Animation<double> _s1TitleSub;
  late final Animation<Offset> _s1TitleSubSlide;
  late final Animation<double> _s1Illus;
  late final Animation<double> _s1Bubble;

  // Screen 2 — animations staggerées
  late final Animation<double> _s2TitleBig;
  late final Animation<Offset> _s2TitleBigSlide;
  late final Animation<double> _s2TitleSub;
  late final Animation<Offset> _s2TitleSubSlide;
  late final Animation<double> _s2Illus;
  late final Animation<double> _s2Bubble;

  // Screen 3 — animations staggerées
  late final Animation<double> _s3TitleBig;
  late final Animation<Offset> _s3TitleBigSlide;
  late final Animation<double> _s3TitleSub;
  late final Animation<Offset> _s3TitleSubSlide;
  late final Animation<double> _s3Illus;
  late final Animation<double> _s3Bubble;

  @override
  void initState() {
    super.initState();
    _animCtrl = List.generate(
      _totalPages,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 2200),
      ),
    );
    _buildScreen1Anims();
    _buildScreen2Anims();
    _buildScreen3Anims();
    _animCtrl[0].forward();
  }

  void _buildScreen1Anims() {
    final c = _animCtrl[0];

    _s1TitleBig = CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    );
    _s1TitleBigSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    ));

    _s1TitleSub = CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    );
    _s1TitleSubSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    ));

    _s1Illus = CurvedAnimation(
      parent: c,
      curve: const Interval(0.28, 0.60, curve: Curves.easeOut),
    );

    _s1Bubble = CurvedAnimation(
      parent: c,
      curve: const Interval(0.58, 0.82, curve: Curves.easeOut),
    );
  }

  void _buildScreen2Anims() {
    final c = _animCtrl[1];

    _s2TitleBig = CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    );
    _s2TitleBigSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    ));

    _s2TitleSub = CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    );
    _s2TitleSubSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    ));

    _s2Illus = CurvedAnimation(
      parent: c,
      curve: const Interval(0.28, 0.60, curve: Curves.easeOut),
    );

    _s2Bubble = CurvedAnimation(
      parent: c,
      curve: const Interval(0.58, 0.82, curve: Curves.easeOut),
    );
  }

  void _buildScreen3Anims() {
    final c = _animCtrl[2];

    _s3TitleBig = CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    );
    _s3TitleBigSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    ));

    _s3TitleSub = CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    );
    _s3TitleSubSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: c,
      curve: const Interval(0.12, 0.35, curve: Curves.easeOut),
    ));

    _s3Illus = CurvedAnimation(
      parent: c,
      curve: const Interval(0.28, 0.60, curve: Curves.easeOut),
    );

    _s3Bubble = CurvedAnimation(
      parent: c,
      curve: const Interval(0.58, 0.82, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    for (final c in _animCtrl) {
      c.dispose();
    }
    _pageCtrl.dispose();
    super.dispose();
  }

  void _next() {
    if (_currentPage < _totalPages - 1) {
      _pageCtrl.nextPage(
        duration: const Duration(milliseconds: 380),
        curve: Curves.easeInOut,
      );
    } else {
      Navigator.of(context).pop();
    }
  }

  void _skip() {
    Navigator.of(context).pop();
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
    final ctrl = _animCtrl[page];
    if (ctrl.value == 0) ctrl.forward();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: AppColors.warmWhite,
        body: SafeArea(
          child: Stack(
            children: [
              // Pages
              PageView(
                controller: _pageCtrl,
                onPageChanged: _onPageChanged,
                physics: const BouncingScrollPhysics(),
                children: [
                  _Screen1(
                    titleBigAnim: _s1TitleBig,
                    titleBigSlide: _s1TitleBigSlide,
                    titleSubAnim: _s1TitleSub,
                    titleSubSlide: _s1TitleSubSlide,
                    illusAnim: _s1Illus,
                    bubbleAnim: _s1Bubble,
                  ),
                  _Screen2(
                    titleBigAnim: _s2TitleBig,
                    titleBigSlide: _s2TitleBigSlide,
                    titleSubAnim: _s2TitleSub,
                    titleSubSlide: _s2TitleSubSlide,
                    illusAnim: _s2Illus,
                    bubbleAnim: _s2Bubble,
                  ),
                  _Screen3(
                    titleBigAnim: _s3TitleBig,
                    titleBigSlide: _s3TitleBigSlide,
                    titleSubAnim: _s3TitleSub,
                    titleSubSlide: _s3TitleSubSlide,
                    illusAnim: _s3Illus,
                    bubbleAnim: _s3Bubble,
                  ),
                ],
              ),

              // "Passer" — haut droite
              Positioned(
                top: 8,
                right: 16,
                child: TextButton(
                  onPressed: _skip,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'Passer',
                    style: GoogleFonts.manrope(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),

              // Dots + bouton Suivant — bas droite
              Positioned(
                right: 24,
                bottom: 28,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ProgressDots(
                        current: _currentPage, total: _totalPages),
                    const SizedBox(height: 16),
                    _NextButton(
                      label: _currentPage == _totalPages - 1
                          ? 'Commencer'
                          : 'Suivant',
                      onTap: _next,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Screen 1 ─────────────────────────────────────────────────────────────────

class _Screen1 extends StatelessWidget {
  final Animation<double> titleBigAnim;
  final Animation<Offset> titleBigSlide;
  final Animation<double> titleSubAnim;
  final Animation<Offset> titleSubSlide;
  final Animation<double> illusAnim;
  final Animation<double> bubbleAnim;

  const _Screen1({
    required this.titleBigAnim,
    required this.titleBigSlide,
    required this.titleSubAnim,
    required this.titleSubSlide,
    required this.illusAnim,
    required this.bubbleAnim,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation:
          Listenable.merge([titleBigAnim, illusAnim, bubbleAnim]),
      builder: (_, __) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Titre — avec padding horizontal
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 52, 28, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FadeTransition(
                    opacity: titleBigAnim,
                    child: SlideTransition(
                      position: titleBigSlide,
                      child: Text(
                        'Salut toi !',
                        style: GoogleFonts.fraunces(
                          fontSize: 52,
                          fontWeight: FontWeight.w700,
                          height: 1.0,
                          letterSpacing: -1.5,
                          color: AppColors.lightTextPrimary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  FadeTransition(
                    opacity: titleSubAnim,
                    child: SlideTransition(
                      position: titleSubSlide,
                      child: Text(
                        'Bienvenue sur Haven !',
                        style: GoogleFonts.fraunces(
                          fontSize: 28,
                          fontWeight: FontWeight.w500,
                          height: 1.2,
                          letterSpacing: -0.5,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Illustration pleine largeur + bulle en overlay
            Expanded(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  // Blob organique en arrière-plan
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: CustomPaint(painter: _BlobPainter()),
                    ),
                  ),

                  // SVG — plein écran, aligné en bas
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.88, end: 1.0)
                            .animate(illusAnim),
                        child: SvgPicture.asset(
                          'assets/svg_screen_1.svg',
                          fit: BoxFit.cover,
                          alignment: Alignment.center,
                        ),
                      ),
                    ),
                  ),

                  // Bulle de conversation — bas gauche, au-dessus du bouton
                  Positioned(
                    left: 24,
                    right: 80,
                    bottom: 112,
                    child: FadeTransition(
                      opacity: bubbleAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.85, end: 1.0)
                            .animate(bubbleAnim),
                        alignment: Alignment.bottomLeft,
                        child: const _SpeechBubble(
                          text:
                              'Ouvre ton app, choisis ton portail & connecte-toi.',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─── Screen 2 ─────────────────────────────────────────────────────────────────

class _Screen2 extends StatelessWidget {
  final Animation<double> titleBigAnim;
  final Animation<Offset> titleBigSlide;
  final Animation<double> titleSubAnim;
  final Animation<Offset> titleSubSlide;
  final Animation<double> illusAnim;
  final Animation<double> bubbleAnim;

  const _Screen2({
    required this.titleBigAnim,
    required this.titleBigSlide,
    required this.titleSubAnim,
    required this.titleSubSlide,
    required this.illusAnim,
    required this.bubbleAnim,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([titleBigAnim, illusAnim, bubbleAnim]),
      builder: (_, __) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 52, 28, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FadeTransition(
                    opacity: titleBigAnim,
                    child: SlideTransition(
                      position: titleBigSlide,
                      child: Text(
                        'Tu es :',
                        style: GoogleFonts.fraunces(
                          fontSize: 52,
                          fontWeight: FontWeight.w700,
                          height: 1.0,
                          letterSpacing: -1.5,
                          color: AppColors.lightTextPrimary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  FadeTransition(
                    opacity: titleSubAnim,
                    child: SlideTransition(
                      position: titleSubSlide,
                      child: Text(
                        'témoin ou victime\nde harcèlement ?',
                        style: GoogleFonts.fraunces(
                          fontSize: 28,
                          fontWeight: FontWeight.w500,
                          height: 1.2,
                          letterSpacing: -0.5,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: CustomPaint(painter: _BlobPainter()),
                    ),
                  ),
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.88, end: 1.0)
                            .animate(illusAnim),
                        child: SvgPicture.asset(
                          'assets/svg_screen_2.svg',
                          fit: BoxFit.cover,
                          alignment: Alignment.center,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    right: 80,
                    bottom: 112,
                    child: FadeTransition(
                      opacity: bubbleAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.85, end: 1.0)
                            .animate(bubbleAnim),
                        alignment: Alignment.bottomLeft,
                        child: const _SpeechBubble(
                          text:
                              'Ouvre le chat, choisis ton anonymat & explique ce que tu as vu ou vécu !',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─── Screen 3 ─────────────────────────────────────────────────────────────────

class _Screen3 extends StatelessWidget {
  final Animation<double> titleBigAnim;
  final Animation<Offset> titleBigSlide;
  final Animation<double> titleSubAnim;
  final Animation<Offset> titleSubSlide;
  final Animation<double> illusAnim;
  final Animation<double> bubbleAnim;

  const _Screen3({
    required this.titleBigAnim,
    required this.titleBigSlide,
    required this.titleSubAnim,
    required this.titleSubSlide,
    required this.illusAnim,
    required this.bubbleAnim,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([titleBigAnim, illusAnim, bubbleAnim]),
      builder: (_, __) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 52, 28, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FadeTransition(
                    opacity: titleBigAnim,
                    child: SlideTransition(
                      position: titleBigSlide,
                      child: Text(
                        'Un référent',
                        style: GoogleFonts.fraunces(
                          fontSize: 52,
                          fontWeight: FontWeight.w700,
                          height: 1.0,
                          letterSpacing: -1.5,
                          color: AppColors.lightTextPrimary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  FadeTransition(
                    opacity: titleSubAnim,
                    child: SlideTransition(
                      position: titleSubSlide,
                      child: Text(
                        'prendra ton signalement\nen charge.',
                        style: GoogleFonts.fraunces(
                          fontSize: 28,
                          fontWeight: FontWeight.w500,
                          height: 1.2,
                          letterSpacing: -0.5,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: CustomPaint(painter: _BlobPainter()),
                    ),
                  ),
                  Positioned.fill(
                    child: FadeTransition(
                      opacity: illusAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.88, end: 1.0)
                            .animate(illusAnim),
                        child: SvgPicture.asset(
                          'assets/svg_screen_3.svg',
                          fit: BoxFit.cover,
                          alignment: Alignment.center,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    right: 80,
                    bottom: 112,
                    child: FadeTransition(
                      opacity: bubbleAnim,
                      child: ScaleTransition(
                        scale: Tween<double>(begin: 0.85, end: 1.0)
                            .animate(bubbleAnim),
                        alignment: Alignment.bottomLeft,
                        child: const _SpeechBubble(
                          text:
                              'Toi, tu pourras tout voir en temps réel sur ton Espace Personnel !',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─── Bulle de conversation ────────────────────────────────────────────────────

class _SpeechBubble extends StatelessWidget {
  final String text;
  const _SpeechBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: const BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
              bottomLeft: Radius.circular(4),
              bottomRight: Radius.circular(20),
            ),
          ),
          child: Text(
            text,
            style: GoogleFonts.manrope(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              height: 1.45,
            ),
          ),
        ),
        // Queue pointant vers le bas-gauche
        Padding(
          padding: const EdgeInsets.only(left: 4),
          child: CustomPaint(
            painter: _BubbleTailPainter(),
            size: const Size(14, 9),
          ),
        ),
      ],
    );
  }
}

// ─── Blob organique arrière-plan ─────────────────────────────────────────────

class _BlobPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary.withOpacity(0.11)
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.shortestSide * 0.44;

    final path = Path()
      ..moveTo(cx + r * 0.90, cy - r * 0.28)
      ..cubicTo(
        cx + r * 1.12, cy + r * 0.08,
        cx + r * 0.88, cy + r * 0.82,
        cx + r * 0.18, cy + r * 1.08,
      )
      ..cubicTo(
        cx - r * 0.42, cy + r * 1.28,
        cx - r * 1.12, cy + r * 0.78,
        cx - r * 1.06, cy + r * 0.08,
      )
      ..cubicTo(
        cx - r * 1.00, cy - r * 0.62,
        cx - r * 0.38, cy - r * 1.06,
        cx + r * 0.22, cy - r * 1.02,
      )
      ..cubicTo(
        cx + r * 0.62, cy - r * 0.96,
        cx + r * 0.72, cy - r * 0.62,
        cx + r * 0.90, cy - r * 0.28,
      )
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

// ─── Queue de la bulle ────────────────────────────────────────────────────────

class _BubbleTailPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

// ─── Placeholder screens (2 & 3) ─────────────────────────────────────────────

class _PlaceholderScreen extends StatelessWidget {
  final int index;
  const _PlaceholderScreen({required this.index});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 52, 28, 120),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Écran $index',
            style: GoogleFonts.fraunces(
              fontSize: 40,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.0,
              color: AppColors.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Contenu à venir.',
            style: GoogleFonts.manrope(
              fontSize: 16,
              color: AppColors.lightTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Progress dots ────────────────────────────────────────────────────────────

class _ProgressDots extends StatelessWidget {
  final int current;
  final int total;
  const _ProgressDots({required this.current, required this.total});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: List.generate(total, (i) {
        final active = i == current;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: active ? 20 : 7,
          height: 7,
          decoration: BoxDecoration(
            color: active
                ? AppColors.primary
                : AppColors.primary.withOpacity(0.22),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}

// ─── Bouton Suivant / Commencer ───────────────────────────────────────────────

class _NextButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _NextButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.30),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: 0.1,
              ),
            ),
            const SizedBox(width: 6),
            const Icon(
              Icons.arrow_forward_rounded,
              color: Colors.white,
              size: 17,
            ),
          ],
        ),
      ),
    );
  }
}
