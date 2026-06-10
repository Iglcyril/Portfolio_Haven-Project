import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/circle_clipper.dart';

// ─── Intro palette (same as dark theme home page) ───────────────────────────
const _green   = Color(0xFF00A176);
const _greenHi = Color(0xFF00C892);
const _greenLo = Color(0xFF008566);
const _white   = Color(0xFFF9F6F1);

// ─── easeOutBack (slight overshoot) ─────────────────────────────────────────
class _EaseOutBack extends Curve {
  const _EaseOutBack();
  @override
  double transformInternal(double t) {
    const c1 = 1.70158, c3 = c1 + 1;
    final m = t - 1;
    return 1 + c3 * m * m * m + c1 * m * m;
  }
}

const _easeOutBack = _EaseOutBack();

// ─── Helper: maps t ∈ [start,end] → [0,1] through a curve ──────────────────
double _seg(double t, double start, double end, {Curve curve = Curves.easeInOut}) {
  if (t <= start) return 0.0;
  if (t >= end) return 1.0;
  return curve.transform((t - start) / (end - start));
}

// ─── IntroScreen ────────────────────────────────────────────────────────────
class IntroScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const IntroScreen({super.key, required this.onComplete});

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  bool _completionFired = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      duration: const Duration(milliseconds: 6000),
      vsync: this,
    )..forward();

    // Fire at t≈5.8s — ripple circle fully covers screen, swap is seamless
    _ctrl.addListener(_checkCompletion);
  }

  void _checkCompletion() {
    if (!_completionFired && _ctrl.value >= 5.8 / 6.0) {
      _completionFired = true;
      widget.onComplete();
    }
  }

  @override
  void dispose() {
    _ctrl.removeListener(_checkCompletion);
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkGradientTop,
      body: LayoutBuilder(
        builder: (_, constraints) {
          final w  = constraints.maxWidth;
          final h  = constraints.maxHeight;
          final sx = w / 1080;
          final sy = h / 1920;
          final cx = w / 2;
          final markCy = 760 * sy;

          return AnimatedBuilder(
            animation: _ctrl,
            builder: (_, __) {
              final t = _ctrl.value * 6.0;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  _Backdrop(t: t, w: w, h: h, cx: cx, markCy: markCy, sx: sx),
                  _Ripples(t: t, cx: cx, markCy: markCy, sx: sx),
                  _Splash(t: t, cx: cx, markCy: markCy, sx: sx),
                  _AnchorMark(t: t, cx: cx, markCy: markCy, sx: sx, sy: sy),
                  _Wordmark(t: t, w: w, markCy: markCy, sx: sx, sy: sy),
                  _Tagline(t: t, w: w, markCy: markCy, sx: sx, sy: sy),
                  _TrustBadge(t: t, w: w, sx: sx, sy: sy),
                  // Ripple circle expands from logo center → covers screen at t=5.8s
                  _RippleExpand(t: t, cx: cx, markCy: markCy),
                  _FadeOverlay(t: t),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

// ─── Backdrop ───────────────────────────────────────────────────────────────
// Uses the same dark-theme radial gradient as HomePage:
// darkGradientBottom (brighter) at logo center → darkGradientTop (dark) at edges
class _Backdrop extends StatelessWidget {
  final double t, w, h, cx, markCy, sx;
  const _Backdrop({
    required this.t,
    required this.w,
    required this.h,
    required this.cx,
    required this.markCy,
    required this.sx,
  });

  @override
  Widget build(BuildContext context) {
    final breathe     = 0.5 + 0.5 * sin(t * 0.7);
    final haloOpacity = 0.20 + 0.10 * breathe;
    final haloScale   = 1.0 + 0.06 * breathe;
    final haloBase    = 1200 * sx;

    // Logo center in Alignment coords (-1..1)
    final alignX = (cx / w) * 2 - 1;          // 0.0 (always center)
    final alignY = (markCy / h) * 2 - 1;       // near -0.2 on most phones

    return Positioned.fill(
      child: Stack(children: [
        // Base: radial gradient from logo outward — mirrors HomePage dark mode
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(alignX, alignY),
                radius: 1.3,
                colors: const [
                  AppColors.darkGradientBottom, // #028966 — brighter at logo
                  AppColors.darkGradientTop,    // #102F2B — darker at edges
                ],
                stops: const [0.0, 1.0],
              ),
            ),
          ),
        ),
        // Soft animated halo pulse at logo center
        Positioned(
          left: cx - haloBase / 2,
          top:  markCy - haloBase / 2,
          width:  haloBase,
          height: haloBase,
          child: Transform.scale(
            scale: haloScale,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color.fromRGBO(0, 200, 146, haloOpacity),
                    const Color.fromRGBO(0, 200, 146, 0),
                  ],
                ),
              ),
            ),
          ),
        ),
        // Vignette — darkens edges slightly
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                radius: 1.0,
                colors: [
                  Colors.transparent,
                  Color.fromRGBO(10, 20, 18, 0.50),
                ],
                stops: [0.55, 1.0],
              ),
            ),
          ),
        ),
      ]),
    );
  }
}

// ─── Ripples ─────────────────────────────────────────────────────────────────
class _Ripples extends StatelessWidget {
  final double t, cx, markCy, sx;
  const _Ripples({
    required this.t,
    required this.cx,
    required this.markCy,
    required this.sx,
  });

  @override
  Widget build(BuildContext context) {
    const period = 3.2;
    const count  = 4;
    return Positioned.fill(
      child: Stack(
        clipBehavior: Clip.none,
        children: List.generate(count, (i) {
          final phase   = ((t + i * (period / count)) % period) / period;
          final size    = (260 + phase * 900) * sx;
          final opacity = ((1 - phase) * 0.18).clamp(0.0, 1.0);
          return Positioned(
            left:   cx - size / 2,
            top:    markCy - size / 2,
            width:  size,
            height: size,
            child: Opacity(
              opacity: opacity,
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: _greenHi,
                    width: (2 * sx).clamp(0.5, 2.0),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ─── Splash (one-time ring burst when square lands) ──────────────────────────
class _Splash extends StatelessWidget {
  final double t, cx, markCy, sx;
  const _Splash({
    required this.t,
    required this.cx,
    required this.markCy,
    required this.sx,
  });

  @override
  Widget build(BuildContext context) {
    final p = _seg(t, 1.95, 3.0, curve: Curves.easeOutCubic);
    if (p <= 0 || p >= 1) return const SizedBox.shrink();
    final size    = (260 + p * 560) * sx;
    final opacity = ((1 - p) * 0.5).clamp(0.0, 1.0);
    return Positioned(
      left:   cx - size / 2,
      top:    markCy - size / 2,
      width:  size,
      height: size,
      child: Opacity(
        opacity: opacity,
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: _greenHi,
              width: (3 * sx).clamp(0.5, 3.0),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Anchor mark: rounded square + draw-on anchor SVG ────────────────────────
class _AnchorMark extends StatelessWidget {
  final double t, cx, markCy, sx, sy;
  const _AnchorMark({
    required this.t,
    required this.cx,
    required this.markCy,
    required this.sx,
    required this.sy,
  });

  @override
  Widget build(BuildContext context) {
    final sqIn       = _seg(t, 1.9, 2.65, curve: _easeOutBack);
    final sqScale    = 0.2 + 0.8 * sqIn;
    final sqOpacity  = _seg(t, 1.9, 2.2, curve: Curves.easeOutQuad).clamp(0.0, 1.0);
    final floatPhase = _seg(t, 2.6, 3.4);
    final floatY     = sin(t * 1.1) * 6 * sy * floatPhase;
    final glow       = 0.5 + 0.5 * sin(t * 1.6);
    final glowAmt    = (_seg(t, 2.4, 3.0) * (0.35 + 0.25 * glow)).clamp(0.0, 1.0);

    final ring  = _seg(t, 0.45, 1.15);
    final shaft = _seg(t, 1.0,  1.6);
    final cross = _seg(t, 1.5,  1.9);
    final arms  = _seg(t, 1.7,  2.45);

    final sqSize   = 296 * sx;
    final sqRadius = 68 * sx;
    final ancSz    = 220 * sx;
    final glowSz   = sqSize * 1.6;
    final cy       = markCy + floatY;

    return Positioned.fill(
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Radial glow behind the square
          Positioned(
            left:   cx - glowSz / 2,
            top:    cy - glowSz / 2,
            width:  glowSz,
            height: glowSz,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color.fromRGBO(0, 200, 146, glowAmt),
                    const Color.fromRGBO(0, 200, 146, 0),
                  ],
                ),
              ),
            ),
          ),
          // Rounded green square
          Positioned(
            left:   cx - sqSize / 2,
            top:    cy - sqSize / 2,
            width:  sqSize,
            height: sqSize,
            child: Opacity(
              opacity: sqOpacity,
              child: Transform.scale(
                scale: sqScale,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(sqRadius),
                    gradient: const LinearGradient(
                      begin: Alignment(-0.7, -0.8),
                      end: Alignment(0.7, 0.8),
                      stops: [0.0, 0.52, 1.0],
                      colors: [_greenHi, _green, _greenLo],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00A176).withAlpha(153),
                        blurRadius: 80 * sx,
                        offset: Offset(0, 40 * sy),
                        spreadRadius: -24 * sx,
                      ),
                    ],
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(sqRadius),
                      gradient: const RadialGradient(
                        center: Alignment(-0.56, -0.72),
                        radius: 0.8,
                        colors: [
                          Color.fromRGBO(255, 255, 255, 0.35),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.52],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Anchor drawn progressively
          Positioned(
            left:   cx - ancSz / 2,
            top:    cy - ancSz / 2,
            width:  ancSz,
            height: ancSz,
            child: CustomPaint(
              painter: _AnchorPainter(
                ringProgress:  ring,
                shaftProgress: shaft,
                crossProgress: cross,
                armsProgress:  arms,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── CustomPainter: draw-on anchor ──────────────────────────────────────────
class _AnchorPainter extends CustomPainter {
  final double ringProgress, shaftProgress, crossProgress, armsProgress;
  const _AnchorPainter({
    required this.ringProgress,
    required this.shaftProgress,
    required this.crossProgress,
    required this.armsProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 200.0;
    canvas.save();
    canvas.scale(s, s);

    final paint = Paint()
      ..color = _white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 13
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    _drawProgress(canvas,
      Path()..addOval(Rect.fromCircle(center: const Offset(100, 40), radius: 17)),
      ringProgress, paint);

    _drawProgress(canvas,
      Path()..moveTo(100, 57)..lineTo(100, 150),
      shaftProgress, paint);

    _drawProgress(canvas,
      Path()..moveTo(64, 78)..lineTo(136, 78),
      crossProgress, paint);

    _drawProgress(canvas,
      Path()
        ..moveTo(44, 116)
        ..cubicTo(44, 150, 70, 168, 100, 168)
        ..cubicTo(130, 168, 156, 150, 156, 116),
      armsProgress, paint);

    _drawProgress(canvas,
      Path()
        ..moveTo(44, 116)..lineTo(30, 104)
        ..moveTo(44, 116)..lineTo(60, 110),
      armsProgress, paint);

    _drawProgress(canvas,
      Path()
        ..moveTo(156, 116)..lineTo(170, 104)
        ..moveTo(156, 116)..lineTo(140, 110),
      armsProgress, paint);

    canvas.restore();
  }

  void _drawProgress(Canvas canvas, Path path, double progress, Paint paint) {
    if (progress <= 0) return;
    if (progress >= 1) { canvas.drawPath(path, paint); return; }
    for (final m in path.computeMetrics()) {
      canvas.drawPath(m.extractPath(0, m.length * progress), paint);
    }
  }

  @override
  bool shouldRepaint(_AnchorPainter old) =>
      ringProgress  != old.ringProgress  ||
      shaftProgress != old.shaftProgress ||
      crossProgress != old.crossProgress ||
      armsProgress  != old.armsProgress;
}

// ─── Wordmark: "Haven" slides up, explicitly centered using w ─────────────────
class _Wordmark extends StatelessWidget {
  final double t, w, markCy, sx, sy;
  const _Wordmark({
    required this.t,
    required this.w,
    required this.markCy,
    required this.sx,
    required this.sy,
  });

  @override
  Widget build(BuildContext context) {
    final p  = _seg(t, 2.7, 3.5, curve: Curves.easeOutCubic);
    if (p <= 0) return const SizedBox.shrink();
    final ty = (1 - p) * 40 * sy;

    return Positioned(
      left: 0,
      width: w,                           // explicit width — guarantees centering
      top: (760 + 250) * sy + ty,
      child: Opacity(
        opacity: p.clamp(0.0, 1.0),
        child: Text(
          'Haven',
          textAlign: TextAlign.center,
          style: GoogleFonts.fraunces(
            fontSize: 132 * sx,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.02 * 132 * sx,
            color: _white,
            height: 1.0,
          ),
        ),
      ),
    );
  }
}

// ─── Tagline + animated underline ────────────────────────────────────────────
class _Tagline extends StatelessWidget {
  final double t, w, markCy, sx, sy;
  const _Tagline({
    required this.t,
    required this.w,
    required this.markCy,
    required this.sx,
    required this.sy,
  });

  @override
  Widget build(BuildContext context) {
    final p     = _seg(t, 3.5, 4.3, curve: Curves.easeOutQuad);
    if (p <= 0) return const SizedBox.shrink();
    final lineW = _seg(t, 3.4, 4.2) * 56 * sx;
    final ty    = (1 - p) * 16 * sy;

    return Positioned(
      left: 0,
      width: w,                           // explicit width — guarantees centering
      top: (760 + 430) * sy + ty,
      child: Opacity(
        opacity: p.clamp(0.0, 1.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Ta Safe Place',
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(
                fontSize: 40 * sx,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.01 * 40 * sx,
                color: const Color.fromRGBO(249, 246, 241, 0.82),
                height: 1.2,
              ),
            ),
            SizedBox(height: 26 * sy),
            Container(
              width: lineW,
              height: (4 * sy).clamp(1.0, 4.0),
              decoration: const BoxDecoration(
                color: _green,
                borderRadius: BorderRadius.all(Radius.circular(2)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Trust badge ─────────────────────────────────────────────────────────────
class _TrustBadge extends StatelessWidget {
  final double t, w, sx, sy;
  const _TrustBadge({
    required this.t,
    required this.w,
    required this.sx,
    required this.sy,
  });

  @override
  Widget build(BuildContext context) {
    final p = _seg(t, 4.4, 5.1, curve: Curves.easeOutQuad);
    if (p <= 0) return const SizedBox.shrink();
    final ty = (1 - p) * 12 * sy;

    return Positioned(
      left: 0,
      width: w,
      top: 1640 * sy + ty,
      child: Opacity(
        opacity: p.clamp(0.0, 1.0),
        child: Center(
          child: DecoratedBox(
            // outer glow — must be outside ClipRRect so it isn't clipped
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.darkGradientBottom.withOpacity(0.15),
                  blurRadius: 5,
                  spreadRadius: 0,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 30 * sx,
                    vertical: 18 * sy,
                  ),
                  // glass fill: bright green top-left → dark bottom-right
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      stops: const [0.0, 0.5, 1.0],
                      colors: [
                        AppColors.darkGradientBottom.withOpacity(0.30),
                        AppColors.darkGradientBottom.withOpacity(0.18),
                        AppColors.darkGradientTop.withOpacity(0.52),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.darkGradientBottom.withOpacity(0.48),
                      width: 1.5,
                    ),
                  ),
                  // top-highlight sheen painted over the content (liquid glass)
                  foregroundDecoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: const [0.0, 0.38, 1.0],
                      colors: [
                        const Color(0xFFFFFFFF).withOpacity(0.11),
                        const Color(0xFFFFFFFF).withOpacity(0.02),
                        Colors.transparent,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CustomPaint(
                        size: Size(28 * sx, 28 * sx),
                        painter: const _ShieldPainter(),
                      ),
                      SizedBox(width: 14 * sx),
                      Text(
                        'Confidentiel · Anonyme · Toujours',
                        style: GoogleFonts.manrope(
                          fontSize: 27 * sx,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.02 * 27 * sx,
                          color: const Color.fromRGBO(249, 246, 241, 0.88),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ShieldPainter extends CustomPainter {
  const _ShieldPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / 24;
    final sy = size.height / 24;
    canvas.save();
    canvas.scale(sx, sy);

    final paint = Paint()
      ..color = _green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(
      Path()
        ..moveTo(12, 3)
        ..lineTo(20, 6)
        ..lineTo(20, 12)
        ..cubicTo(20, 16.5, 16.5, 20, 12, 21)
        ..cubicTo(7.5, 20, 4, 16.5, 4, 12)
        ..lineTo(4, 6)
        ..close(),
      paint,
    );
    canvas.drawPath(
      Path()
        ..moveTo(9, 12.5)
        ..lineTo(11, 14.5)
        ..lineTo(15, 10),
      paint,
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(_ShieldPainter _) => false;
}

// ─── Ripple expand: filled circle grows from logo center → covers full screen ─
// Starts at t=5.2s, reaches full coverage at t=5.8s.
// Hands off seamlessly to app.dart's contracting reveal overlay.
class _RippleExpand extends StatelessWidget {
  final double t, cx, markCy;
  const _RippleExpand({required this.t, required this.cx, required this.markCy});

  @override
  Widget build(BuildContext context) {
    final p = _seg(t, 5.2, 5.8, curve: Curves.easeInCubic);
    if (p <= 0) return const SizedBox.shrink();
    return Positioned.fill(
      child: IgnorePointer(
        child: ClipPath(
          clipper: CircleClipper(
            center: Offset(cx, markCy),
            fraction: p,
          ),
          child: const ColoredBox(color: AppColors.darkGradientTop),
        ),
      ),
    );
  }
}

// ─── Fade overlay: only handles the opening fade-in (t=0 → 0.45s) ────────────
class _FadeOverlay extends StatelessWidget {
  final double t;
  const _FadeOverlay({required this.t});

  @override
  Widget build(BuildContext context) {
    if (t >= 0.45) return const SizedBox.shrink();
    final opacity = 1.0 - _seg(t, 0, 0.45, curve: Curves.easeInOutCubic);
    if (opacity <= 0.001) return const SizedBox.shrink();
    return Positioned.fill(
      child: IgnorePointer(
        child: ColoredBox(
          color: AppColors.darkGradientTop.withAlpha((opacity * 255).round()),
        ),
      ),
    );
  }
}
