import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

enum _Phase { ready, inhale, exhale, done }

class BreathingPage extends StatefulWidget {
  const BreathingPage({super.key});

  @override
  State<BreathingPage> createState() => _BreathingPageState();
}

class _BreathingPageState extends State<BreathingPage>
    with SingleTickerProviderStateMixin {
  static const int _totalCycles = 18; // 18 × 10 s = 3 min
  static const Duration _breathDuration = Duration(seconds: 5);

  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  _Phase _phase = _Phase.ready;
  int _countdown = 3;
  int _cyclesLeft = _totalCycles;
  Timer? _readyTimer;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: _breathDuration);
    // begin = 0.60 correspond à la taille de repos → aucun saut visuel
    _scale = Tween<double>(begin: 0.60, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _beginCountdown();
  }

  void _beginCountdown() {
    _readyTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      final next = _countdown - 1;
      if (next <= 0) {
        t.cancel();
        setState(() => _countdown = 0);
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) _startInhale();
        });
      } else {
        setState(() => _countdown = next);
      }
    });
  }

  void _startInhale() {
    if (!mounted) return;
    setState(() => _phase = _Phase.inhale);
    _ctrl.forward(from: 0.0).then((_) {
      if (mounted) _startExhale();
    });
  }

  void _startExhale() {
    if (!mounted) return;
    setState(() => _phase = _Phase.exhale);
    _ctrl.reverse().then((_) {
      if (!mounted) return;
      final left = _cyclesLeft - 1;
      setState(() => _cyclesLeft = left);
      if (left <= 0) {
        setState(() => _phase = _Phase.done);
      } else {
        _startInhale();
      }
    });
  }

  @override
  void dispose() {
    _readyTimer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDone = _phase == _Phase.done;
    final totalSecs = _cyclesLeft * 10;
    final mins = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSecs % 60).toString().padLeft(2, '0');

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: const Color(0xFF0A2420),
        body: SafeArea(
          child: Column(
            children: [
              // ─── Bouton fermer ────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Align(
                  alignment: Alignment.centerRight,
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, color: Colors.white, size: 18),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // ─── Titre ────────────────────────────────────────────────────
              Text(
                'Cohérence cardiaque',
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withValues(alpha: 0.90),
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  isDone ? 'Séance terminée' : '$mins:$secs restantes',
                  key: ValueKey(isDone ? 'done' : '$_cyclesLeft'),
                  style: GoogleFonts.manrope(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary.withValues(alpha: 0.80),
                  ),
                ),
              ),
              const Spacer(flex: 2),
              // ─── Cercle animé ─────────────────────────────────────────────
              AnimatedBuilder(
                animation: _scale,
                builder: (context, _) {
                  final s = (_phase == _Phase.ready || isDone)
                      ? 0.60
                      : _scale.value;
                  return SizedBox(
                    width: 280,
                    height: 280,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Halo lumineux extérieur
                        Transform.scale(
                          scale: s,
                          child: Container(
                            width: 280,
                            height: 280,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  AppColors.primary.withValues(alpha: 0.22),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        ),
                        // Cercle principal
                        Transform.scale(
                          scale: s,
                          child: Container(
                            width: 210,
                            height: 210,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const RadialGradient(
                                colors: [
                                  Color(0xFF028966),
                                  Color(0xFF015940),
                                ],
                                stops: [0.2, 1.0],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.30),
                                  blurRadius: 60,
                                  spreadRadius: 12,
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Compte à rebours pendant la phase "prêt"
                        if (_phase == _Phase.ready && _countdown > 0)
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 250),
                            child: Text(
                              '$_countdown',
                              key: ValueKey(_countdown),
                              style: GoogleFonts.fraunces(
                                fontSize: 60,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        // Coche à la fin
                        if (isDone)
                          const Icon(
                            Icons.check_rounded,
                            color: Colors.white,
                            size: 64,
                          ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 44),
              // ─── Instruction principale ───────────────────────────────────
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 450),
                transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.12),
                      end: Offset.zero,
                    ).animate(anim),
                    child: child,
                  ),
                ),
                child: Text(
                  switch (_phase) {
                    _Phase.ready  => 'Prêt ?',
                    _Phase.inhale => 'Inspirez...',
                    _Phase.exhale => 'Expirez...',
                    _Phase.done   => 'Excellent travail !',
                  },
                  key: ValueKey(_phase),
                  textAlign: TextAlign.center,
                  style: GoogleFonts.fraunces(
                    fontSize: 30,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                switch (_phase) {
                  _Phase.ready  => 'Respirez lentement et régulièrement',
                  _Phase.inhale => '5 secondes',
                  _Phase.exhale => '5 secondes',
                  _Phase.done   => 'Tu te sens mieux ? On est là pour toi.',
                },
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.40),
                ),
              ),
              const Spacer(flex: 3),
              // ─── Bas de page : progression ou bouton retour ───────────────
              if (isDone) ...[
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Text(
                      'Retour',
                      style: GoogleFonts.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ] else ...[
                _ProgressDots(
                  total: _totalCycles,
                  remaining: _cyclesLeft,
                ),
              ],
              const SizedBox(height: 36),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Points de progression ────────────────────────────────────────────────────

class _ProgressDots extends StatelessWidget {
  final int total;
  final int remaining;

  const _ProgressDots({required this.total, required this.remaining});

  @override
  Widget build(BuildContext context) {
    final done = total - remaining;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (i) {
        final filled = i < done;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 2.5),
          width: filled ? 8 : 5,
          height: filled ? 8 : 5,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: filled
                ? AppColors.primary
                : Colors.white.withValues(alpha: 0.18),
          ),
        );
      }),
    );
  }
}
