import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/glass_circle_button.dart';
import '../../core/services/auth_service.dart';
import '../../core/widgets/emergency_sheet.dart';
import '../breathing/breathing_page.dart';
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
                  padding: EdgeInsets.symmetric(horizontal: 24.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(height: 8.h),
                      _ThemeToggle(isDark: isDark, onTap: onToggleTheme),
                      SizedBox(height: 8.h),
                      _TopBar(isDark: isDark, onToggleTheme: onToggleTheme),
                      SizedBox(height: 32.h),
                      _HeroText(isDark: isDark),
                      SizedBox(height: 28.h),
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
                              reportType: 'victime',
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 12.h),
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
                              reportType: 'temoin',
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 28.h),
                      _ResourcesSection(isDark: isDark),
                      SizedBox(height: 24.h),
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

// ─── Theme toggle ─────────────────────────────────────────────────────────────

class _ThemeToggle extends StatelessWidget {
  final bool isDark;
  final VoidCallback onTap;
  const _ThemeToggle({required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
          child: Container(
            height: 40.h,
            padding: EdgeInsets.symmetric(horizontal: 14.w),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20.r),
              color: isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.07),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.logout_rounded,
                    size: 16.sp,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.70)
                        : AppColors.lightTextSecondary),
                SizedBox(width: 6.w),
                Text(
                  'Déconnexion',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.70)
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: onTap,
          child: GlassCircleButton(
            isDark: isDark,
            child: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black,
              size: 20.sp,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  const _TopBar({required this.isDark, required this.onToggleTheme});

  static String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return parts[0][0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42.r,
          height: 42.r,
          decoration: BoxDecoration(
            color: isDark
                ? AppColors.primary.withValues(alpha: 0.45)
                : AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              _initials(AuthService.currentUser?.fullName),
              style: AppTextStyles.initials(),
            ),
          ),
        ),
        SizedBox(width: 10.w),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bienvenue,',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.45)
                    : AppColors.lightTextSecondary,
              ),
            ),
            Text(
              AuthService.currentUser?.fullName ?? 'Utilisateur',
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
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 9.h),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(20.r),
              border: isDark
                  ? Border.all(color: Colors.white.withValues(alpha: 0.12))
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.bar_chart_rounded,
                  size: 16.sp,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.80)
                      : AppColors.lightTextPrimary,
                ),
                SizedBox(width: 6.w),
                Text(
                  'Espace Personnel',
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 13.sp,
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
        SizedBox(height: 12.h),
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
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 28.h),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(28.r),
        boxShadow: shadows,
      ),
      child: Row(
        children: [
          Container(
            width: 44.r,
            height: 44.r,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(13.r),
            ),
            child: Icon(icon, color: iconColor, size: 22.sp),
          ),
          SizedBox(width: 14.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.cardTitle(isDark).copyWith(color: textColor),
                ),
                SizedBox(height: 3.h),
                Text(
                  subtitle,
                  style: AppTextStyles.caption(isDark, fontWeight: FontWeight.w500)
                      .copyWith(color: subtitleColor),
                ),
              ],
            ),
          ),
          Icon(Icons.arrow_forward_ios_rounded, color: arrowColor, size: 15.sp),
        ],
      ),
    );

    return GestureDetector(
      onTap: onTap,
      child: isFilled && isDark
          ? ClipRRect(
              borderRadius: BorderRadius.circular(28.r),
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
        SizedBox(height: 12.h),
        Row(
          children: [
            Expanded(
              child: _ResourceTile(
                label: 'Urgences',
                icon: Icons.phone_outlined,
                isDark: isDark,
                onTap: () => showEmergencySheet(context),
              ),
            ),
            SizedBox(width: 10.w),
            Expanded(
              child: _ResourceTile(
                label: 'Respiration',
                icon: Icons.self_improvement_rounded,
                isDark: isDark,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const BreathingPage()),
                ),
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
  final VoidCallback? onTap;

  const _ResourceTile({
    required this.label,
    required this.icon,
    required this.isDark,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 16.h),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20.r),
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
              width: 40.r,
              height: 40.r,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.12),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: 20.sp,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 12.sp,
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
