import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/glass_circle_button.dart';
import 'anon_level.dart';
import '../chat/chat_page.dart';
import '../chat/report_submitted_page.dart';

class ConfidentialChoicePage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  const ConfidentialChoicePage({super.key, required this.onToggleTheme});

  @override
  State<ConfidentialChoicePage> createState() => _ConfidentialChoicePageState();
}

class _ConfidentialChoicePageState extends State<ConfidentialChoicePage> {
  AnonLevel? _selected;

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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.10)
                                    : Colors.black.withValues(alpha: 0.07),
                              ),
                              child: Icon(
                                Icons.arrow_back_rounded,
                                color: isDark ? Colors.white : Colors.black,
                                size: 20,
                              ),
                            ),
                          ),
                          _ThemeToggle(isDark: isDark, onTap: widget.onToggleTheme),
                        ],
                      ),
                      const SizedBox(height: 8),
                      _UserBar(isDark: isDark),
                      const SizedBox(height: 32),
                      _HeroText(isDark: isDark),
                      const SizedBox(height: 24),
                      _AnonCard(
                        title: "Pas d'anonymat pour moi",
                        subtitle: "Ton nom et ta classe seront visibles",
                        icon: Icons.badge_outlined,
                        selected: _selected == AnonLevel.none,
                        isDark: isDark,
                        onTap: () => setState(() => _selected = AnonLevel.none),
                      ),
                      const SizedBox(height: 12),
                      _AnonCard(
                        title: "Anonyme mais à moitié",
                        subtitle: "Ton nom est caché, mais ta classe visible",
                        icon: Icons.remove_red_eye_outlined,
                        selected: _selected == AnonLevel.partial,
                        isDark: isDark,
                        onTap: () => setState(() => _selected = AnonLevel.partial),
                      ),
                      const SizedBox(height: 12),
                      _AnonCard(
                        title: "Anonyme à 100%",
                        subtitle: "Ton nom et ta classe seront cachés !",
                        icon: Icons.lock_outline_rounded,
                        selected: _selected == AnonLevel.full,
                        isDark: isDark,
                        onTap: () => setState(() => _selected = AnonLevel.full),
                      ),
                      const SizedBox(height: 28),
                      Row(
                        children: [
                          _EmergencyTile(isDark: isDark),
                          const Spacer(),
                          _StartButton(
                            enabled: _selected != null,
                            isDark: isDark,
                            onTap: _selected != null
                                ? () => Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ChatPage(
                                          onToggleTheme: widget.onToggleTheme,
                                          anonLevel: _selected!,
                                          onSend: () => Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (_) => ReportSubmittedPage(
                                                onToggleTheme: widget.onToggleTheme,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    )
                                : null,
                          ),
                        ],
                      ),
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

// ─── Theme toggle ─────────────────────────────────────────────────────────────

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

// ─── User bar (avatar + name) ─────────────────────────────────────────────────

class _UserBar extends StatelessWidget {
  final bool isDark;
  const _UserBar({required this.isDark});

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
              'Alex Morgan',
              style: AppTextStyles.nameBold(isDark, fontSize: 16),
            ),
          ],
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
          "Plus qu'une étape",
          style: AppTextStyles.heroTitle(isDark),
        ),
        Text(
          "Choisis ton niveau d'anonymat :",
          style: AppTextStyles.sheetTitle(isDark).copyWith(color: AppColors.primary, height: 1.2),
        ),
      ],
    );
  }
}

// ─── Anonymity card ───────────────────────────────────────────────────────────

class _AnonCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  const _AnonCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = isDark
        ? Colors.white.withValues(alpha: selected ? 0.12 : 0.07)
        : (selected
            ? AppColors.primary.withValues(alpha: 0.07)
            : AppColors.lightCard);

    final borderColor = selected
        ? AppColors.primary
        : (isDark
            ? Colors.white.withValues(alpha: 0.10)
            : Colors.transparent);

    final iconBgColor = isDark
        ? AppColors.primary.withValues(alpha: selected ? 0.30 : 0.15)
        : AppColors.primary.withValues(alpha: selected ? 0.15 : 0.10);

    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDark
        ? Colors.white.withValues(alpha: 0.55)
        : AppColors.lightTextSecondary;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 110),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: borderColor,
            width: selected ? 1.5 : 1.0,
          ),
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
              child: Icon(icon, color: AppColors.primary, size: 22),
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
            const SizedBox(width: 10),
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: selected ? AppColors.primary : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected
                      ? AppColors.primary
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.25)
                          : Colors.black.withValues(alpha: 0.18)),
                  width: 1.5,
                ),
              ),
              child: selected
                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Emergency tile (red) ─────────────────────────────────────────────────────

class _EmergencyTile extends StatelessWidget {
  final bool isDark;
  const _EmergencyTile({required this.isDark});

  static const _red = Color(0xFFC0392B);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: _red.withValues(alpha: 0.80),
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: _red.withValues(alpha: 0.70),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.phone_outlined, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Urgences',
                  style: AppTextStyles.button(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Start button ─────────────────────────────────────────────────────────────

class _StartButton extends StatelessWidget {
  final bool enabled;
  final bool isDark;
  final VoidCallback? onTap;

  const _StartButton({
    required this.enabled,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        decoration: BoxDecoration(
          color: enabled
              ? AppColors.primary
              : (isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.08)),
          borderRadius: BorderRadius.circular(28),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'On commence',
              style: GoogleFonts.manrope(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: enabled
                    ? Colors.white
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.30)
                        : Colors.black.withValues(alpha: 0.25)),
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              Icons.arrow_forward_rounded,
              size: 18,
              color: enabled
                  ? Colors.white
                  : (isDark
                      ? Colors.white.withValues(alpha: 0.30)
                      : Colors.black.withValues(alpha: 0.25)),
            ),
          ],
        ),
      ),
    );
  }
}
