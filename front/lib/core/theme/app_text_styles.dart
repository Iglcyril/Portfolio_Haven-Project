import 'package:flutter/material.dart';
import 'app_colors.dart';

abstract final class AppTextStyles {

  // ── Fraunces ─────────────────────────────────────────────────────────────────

  static TextStyle homeTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 48,
        fontWeight: FontWeight.w600,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -1.5,
        height: 0.9,
      );

  static TextStyle heroTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 34,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  static TextStyle dashTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 30,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  static TextStyle pageTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 26,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  static TextStyle sheetTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  static TextStyle dialogTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  static TextStyle sectionHeading(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: isDark
            ? Colors.white.withValues(alpha: 0.85)
            : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  static TextStyle cardTitle(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.1,
      );

  static TextStyle statValueLG(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 28,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.0,
      );

  static TextStyle statValueMD(bool isDark) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 22,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
        height: 1.0,
      );

  static TextStyle tutorialBig() => const TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 52,
        fontWeight: FontWeight.w700,
        height: 1.0,
        letterSpacing: -1.5,
        color: AppColors.lightTextPrimary,
      );

  static TextStyle tutorialSub(Color color) => TextStyle(
        fontFamily: 'Fraunces',
        fontSize: 28,
        fontWeight: FontWeight.w500,
        height: 1.2,
        letterSpacing: -0.5,
        color: color,
      );

  // ── Manrope ──────────────────────────────────────────────────────────────────

  static TextStyle sectionLabel(bool isDark) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: isDark
            ? Colors.white.withValues(alpha: 0.45)
            : AppColors.lightTextSecondary,
        letterSpacing: 1.2,
      );

  static TextStyle overline(Color color, {double letterSpacing = 0.8}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: letterSpacing,
        color: color,
      );

  static TextStyle body(bool isDark, {double? height}) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: 14,
        color: isDark
            ? Colors.white.withValues(alpha: 0.65)
            : AppColors.lightTextSecondary,
        height: height,
      );

  static TextStyle bodyPrimary(bool isDark, {double? height = 1.5}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        height: height,
      );

  static TextStyle subtitle(
    bool isDark, {
    FontWeight fontWeight = FontWeight.w400,
    double? height,
  }) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 13,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.50)
            : AppColors.lightTextSecondary,
        height: height,
      );

  static TextStyle caption(bool isDark,
          {FontWeight fontWeight = FontWeight.w500}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 12,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.50)
            : AppColors.lightTextSecondary,
      );

  static TextStyle nameBold(bool isDark, {double fontSize = 14}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
      );

  static TextStyle initials({double fontSize = 14}) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  static TextStyle button({double fontSize = 15}) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  static TextStyle badge(Color color, {double fontSize = 10}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.3,
      );

  static TextStyle timeAgo(bool isDark,
          {FontWeight fontWeight = FontWeight.w500}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 11,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.35)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70),
      );

  static TextStyle fieldLabel(bool isDark) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.9,
        color: isDark
            ? Colors.white.withValues(alpha: 0.55)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70),
      );

  static TextStyle fieldInput(bool isDark) => TextStyle(
        fontFamily: 'Manrope',
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
      );

  static TextStyle tabChip(bool isDark, {required bool active}) =>
      TextStyle(
        fontFamily: 'Manrope',
        fontSize: 14,
        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
        color: active
            ? (isDark ? Colors.white : AppColors.lightTextPrimary)
            : (isDark
                ? Colors.white.withValues(alpha: 0.40)
                : AppColors.lightTextSecondary),
      );
}
