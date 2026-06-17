import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../auth/auth_page.dart';
import '../legal/cgu_modal.dart';

class HomePage extends StatefulWidget {
  final VoidCallback onToggleTheme;

  const HomePage({super.key, required this.onToggleTheme});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    // L'animation de réveil dans app.dart dure 950ms — on attend qu'elle soit
    // terminée avant d'afficher le modal pour qu'il soit visible.
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) showCguModalIfNeeded(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        decoration: BoxDecoration(
          gradient: isDark
              ? const RadialGradient(
                  center: Alignment(0.0, 0.8),
                  radius: 1.2,
                  colors: [
                    AppColors.darkGradientBottom,
                    AppColors.darkGradientTop,
                  ],
                  stops: [0.0, 1.0],
                )
              : const RadialGradient(
                  center: Alignment(0.0, -0.6),
                  radius: 1.4,
                  colors: [
                    AppColors.lightGradientBottom,
                    AppColors.lightGradientTop,
                  ],
                  stops: [0.5, 1.0],
                ),
        ),
        child: Material(
          color: Colors.transparent,
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _ThemeToggleButton(onTap: widget.onToggleTheme, isDark: isDark),
                  const SizedBox(height: 24),
                  Center(child: _AppIcon()),
                  const SizedBox(height: 16),
                  Center(child: _TitleText(isDark: isDark)),
                  const SizedBox(height: 10),
                  Center(child: _SubtitleText(isDark: isDark)),
                  const Spacer(flex: 3),
                  _PortalButton(
                    label: 'Portail Étudiants',
                    subtitle: 'Pour les collèges & lycées',
                    icon: Icons.person_outline_rounded,
                    isFilled: true,
                    isDark: isDark,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AuthPage(
                          portal: PortalType.student,
                          onToggleTheme: widget.onToggleTheme,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _PortalButton(
                    label: 'Espace Parents',
                    subtitle: 'Pour les parents & tuteurs',
                    icon: Icons.family_restroom,
                    isFilled: false,
                    isDark: isDark,
                    customBgColor: const Color(0xFF8ED4BF),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AuthPage(
                          portal: PortalType.parent,
                          onToggleTheme: widget.onToggleTheme,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _PortalButton(
                    label: 'Espace Professionnels',
                    subtitle: 'Pour les référents & le réctorat',
                    icon: Icons.shield_outlined,
                    isFilled: false,
                    isDark: isDark,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AuthPage(
                          portal: PortalType.professional,
                          onToggleTheme: widget.onToggleTheme,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const _EncryptionLabel(),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Sub-widgets ─────────────────────────────────────────────────────────────

class _ThemeToggleButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool isDark;

  const _ThemeToggleButton({required this.onTap, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Padding(
        padding: const EdgeInsets.only(top: 8.0),
        child: GestureDetector(
          onTap: onTap,
          child: ClipOval(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.18)
                      : Colors.black.withValues(alpha: 0.07),
                ),
                child: Icon(
                  isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                  color: isDark ? Colors.white.withValues(alpha: 0.9) : Colors.black,
                  size: 20,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AppIcon extends StatelessWidget {
  const _AppIcon();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/logo.PNG',
      width: 120,
      height: 120,
      fit: BoxFit.contain,
    );
  }
}

class _TitleText extends StatelessWidget {
  final bool isDark;

  const _TitleText({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Text(
      'Haven',
      style: GoogleFonts.fraunces(
        fontSize: 48,
        fontWeight: FontWeight.w600,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -1.5,
        height: 0.9,
      ),
    );
  }
}

class _SubtitleText extends StatelessWidget {
  final bool isDark;

  const _SubtitleText({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Text(
      'Un espace sûr et confidentiel pour signaler\net traiter le harcèlement.',
      textAlign: TextAlign.center,
      style: GoogleFonts.manrope(
        fontSize: 14,
        color: isDark
            ? Colors.white.withOpacity(0.65)
            : AppColors.lightTextSecondary,
        height: 1.6,
      ),
    );
  }
}

class _PortalButton extends StatelessWidget {
  final String label;
  final String subtitle;
  final IconData icon;
  final bool isFilled;
  final bool isDark;
  final VoidCallback onTap;
  final Color? customBgColor;

  const _PortalButton({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.isFilled,
    required this.isDark,
    required this.onTap,
    this.customBgColor,
  });

  @override
  Widget build(BuildContext context) {
    final Color bgColor;
    final Color borderColor;
    final Color textColor;
    final Color subtitleColor;
    final Color iconBgColor;
    final Color iconColor;
    final List<BoxShadow>? shadows;

    final bool useGlass = isFilled && isDark && customBgColor == null;

    if (customBgColor != null) {
      // Espace Parents : mint en light, style étudiant en dark
      bgColor = isDark ? Colors.white.withOpacity(0.12) : customBgColor!;
      borderColor = isDark
          ? Colors.white.withOpacity(0.15)
          : Colors.transparent;
      textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
      subtitleColor = isDark
          ? Colors.white.withOpacity(0.65)
          : AppColors.lightTextSecondary;
      iconBgColor = isDark
          ? Colors.white.withOpacity(0.15)
          : AppColors.primary.withOpacity(0.1);
      iconColor = isDark ? Colors.white : AppColors.primary;
      shadows = null;
    } else if (isFilled) {
      // Portail Étudiant : couleur la plus sombre en dark + glass, vert plein en light
      bgColor = isDark
          ? AppColors.darkGradientTop.withOpacity(0.70)
          : AppColors.studentButtonFill;
      borderColor = isDark
          ? Colors.white.withOpacity(0.08)
          : Colors.transparent;
      textColor = Colors.white;
      subtitleColor = Colors.white.withOpacity(0.65);
      iconBgColor = isDark
          ? Colors.white.withOpacity(0.10)
          : Colors.white.withOpacity(0.15);
      iconColor = Colors.white;
      shadows = null;
    } else {
      bgColor = isDark ? Colors.white.withOpacity(0.07) : AppColors.warmWhite;
      borderColor = isDark
          ? Colors.white.withOpacity(0.15)
          : Colors.black.withOpacity(0.08);
      textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
      subtitleColor = isDark
          ? Colors.white.withOpacity(0.55)
          : AppColors.lightTextSecondary;
      iconBgColor = isDark
          ? Colors.white.withOpacity(0.12)
          : AppColors.primary.withOpacity(0.1);
      iconColor = isDark ? Colors.white : AppColors.primary;
      shadows = isDark
          ? null
          : [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ];
    }

    final Color arrowColor = (isFilled || (customBgColor != null && isDark))
        ? Colors.white.withOpacity(0.70)
        : (isDark
            ? Colors.white.withOpacity(0.55)
            : AppColors.lightTextSecondary);

    final Widget card = Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: borderColor),
        boxShadow: shadows,
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.fraunces(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                    letterSpacing: -0.1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.manrope(
                    fontSize: 12,
                    color: subtitleColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.arrow_forward_ios_rounded, color: arrowColor, size: 15),
        ],
      ),
    );

    return GestureDetector(
      onTap: onTap,
      child: useGlass
          ? ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: card,
              ),
            )
          : card,
    );
  }
}

class _EncryptionLabel extends StatelessWidget {
  const _EncryptionLabel();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark
        ? Colors.white.withOpacity(0.35)
        : AppColors.lightTextSecondary.withOpacity(0.6);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.lock_outline_rounded, size: 11, color: color),
        const SizedBox(width: 4),
        Text(
          'Chiffrement de bout en bout  •  Anonymat par défaut',
          style: GoogleFonts.manrope(
            fontSize: 11,
            color: color,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.1,
          ),
        ),
      ],
    );
  }
}
