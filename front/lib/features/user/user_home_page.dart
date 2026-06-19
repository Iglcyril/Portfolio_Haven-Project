import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/glass_circle_button.dart';
import '../report/confidential_choice_page.dart';
import '../dashboard/dashboard_page.dart';

class UserHomePage extends StatelessWidget {
  final VoidCallback onToggleTheme;
  const UserHomePage({super.key, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
        child: Material(
          color: Colors.transparent,
          child: Stack(
            children: [
              AnchorBackground(isDark: isDark),
              SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 8),
                      _ThemeToggle(isDark: isDark, onTap: onToggleTheme),
                      const SizedBox(height: 8),
                      _TopBar(isDark: isDark, onToggleTheme: onToggleTheme),
                      const SizedBox(height: 32),
                      _HeroText(isDark: isDark),
                      const SizedBox(height: 28),
                      _ReportCard(
                        title: 'Victime de harcèlement ?',
                        subtitle: 'Signale-le ici, en toute sécurité',
                        icon: Icons.person_outline_rounded,
                        isFilled: true,
                        isDark: isDark,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ConfidentialChoicePage(
                              onToggleTheme: onToggleTheme,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _ReportCard(
                        title: 'Témoin de harcèlement ?',
                        subtitle: "Aide à protéger quelqu'un",
                        icon: Icons.remove_red_eye_outlined,
                        isFilled: false,
                        isDark: isDark,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ConfidentialChoicePage(
                              onToggleTheme: onToggleTheme,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                      _ResourcesSection(isDark: isDark),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Theme toggle (aligned right, same style as home/auth pages) ──────────────

class _ThemeToggle extends StatelessWidget {
  final bool isDark;
  final VoidCallback onTap;
  const _ThemeToggle({required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: GestureDetector(
        onTap: onTap,
        child: GlassCircleButton(
          isDark: isDark,
          child: Icon(
            isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black,
            size: 20,
          ),
        ),
      ),
    );
  }
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  const _TopBar({required this.isDark, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: isDark
                ? AppColors.primary.withValues(alpha: 0.45)
                : AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              'AM',
              style: AppTextStyles.initials(),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bienvenue,',
              style: GoogleFonts.manrope(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.45)
                    : AppColors.lightTextSecondary,
              ),
            ),
            Text(
              'Alex Morgan',
              style: AppTextStyles.nameBold(isDark, fontSize: 16),
            ),
          ],
        ),
        const Spacer(),
        GestureDetector(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => DashboardPage(
                onToggleTheme: onToggleTheme,
              ),
            ),
          ),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(20),
              border: isDark
                  ? Border.all(color: Colors.white.withValues(alpha: 0.12))
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.bar_chart_rounded,
                  size: 16,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.80)
                      : AppColors.lightTextPrimary,
                ),
                const SizedBox(width: 6),
                Text(
                  'Espace Personnel',
                  style: GoogleFonts.manrope(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.90)
                        : AppColors.lightTextPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Hero text ────────────────────────────────────────────────────────────────

class _HeroText extends StatelessWidget {
  final bool isDark;
  const _HeroText({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "On est là pour toi.",
          style: AppTextStyles.heroTitle(isDark),
        ),
        Text(
          "À n'importe quel moment !",
          style: AppTextStyles.pageTitle(isDark).copyWith(color: AppColors.primary),
        ),
        const SizedBox(height: 12),
        Text(
          "Que tu aies vécu quelque chose toi-même ou en témoin, tu peux le signaler en toute sécurité et anonymat.",
          style: AppTextStyles.body(isDark, height: 1.6),
        ),
      ],
    );
  }
}

// ─── Report cards ─────────────────────────────────────────────────────────────

class _ReportCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isFilled;
  final bool isDark;
  final VoidCallback onTap;

  const _ReportCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isFilled,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final Color bgColor;
    final Color textColor;
    final Color subtitleColor;
    final Color iconBgColor;
    final Color iconColor;
    final Color arrowColor;
    final List<BoxShadow>? shadows;

    if (isFilled) {
      bgColor = AppColors.studentButtonFill;
      textColor = Colors.white;
      subtitleColor = Colors.white.withValues(alpha: 0.65);
      iconBgColor = Colors.white.withValues(alpha: 0.15);
      iconColor = Colors.white;
      arrowColor = Colors.white.withValues(alpha: 0.70);
      shadows = null;
    } else {
      bgColor = isDark
          ? Colors.white.withValues(alpha: 0.07)
          : AppColors.lightCard;
      textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
      subtitleColor = isDark
          ? Colors.white.withValues(alpha: 0.55)
          : AppColors.lightTextSecondary;
      iconBgColor = isDark
          ? Colors.white.withValues(alpha: 0.12)
          : AppColors.primary.withValues(alpha: 0.10);
      iconColor = isDark ? Colors.white : AppColors.primary;
      arrowColor = isDark
          ? Colors.white.withValues(alpha: 0.55)
          : AppColors.lightTextSecondary;
      shadows = isDark
          ? null
          : [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ];
    }

    final Widget card = Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(28),
        boxShadow: shadows,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.cardTitle(isDark).copyWith(color: textColor),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: AppTextStyles.caption(isDark, fontWeight: FontWeight.w500).copyWith(color: subtitleColor),
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
      child: isFilled && isDark
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

// ─── Resources section ────────────────────────────────────────────────────────

class _ResourcesSection extends StatelessWidget {
  final bool isDark;
  const _ResourcesSection({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'RESSOURCES',
          style: AppTextStyles.sectionLabel(isDark),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _ResourceTile(
                label: 'Urgences',
                icon: Icons.phone_outlined,
                isDark: isDark,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ResourceTile(
                label: 'Guide sécurité',
                icon: Icons.shield_outlined,
                isDark: isDark,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ResourceTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isDark;

  const _ResourceTile({
    required this.label,
    required this.icon,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          border: isDark
              ? Border.all(color: Colors.white.withValues(alpha: 0.10))
              : null,
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.80)
                    : AppColors.lightTextPrimary,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
