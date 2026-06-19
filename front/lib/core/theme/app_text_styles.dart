import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Centralized text styles. Methods accepting [isDark] resolve the
/// standard light/dark text color; callers may override with .copyWith.
abstract final class AppTextStyles {

  // ── Fraunces ─────────────────────────────────────────────────────────────────

  /// Home page hero title — 48 · w600 · h0.9 · ls-1.5
  static TextStyle homeTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 48,
        fontWeight: FontWeight.w600,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -1.5,
        height: 0.9,
      );

  /// Landing hero heading — 34 · w800 · h1.1 · ls-0.5
  static TextStyle heroTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 34,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  /// Dashboard / portal greeting — 30 · w800 · h1.1 · ls-0.5
  static TextStyle dashTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 30,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  /// Page / report main title — 26 · w800 · h1.1 · ls-0.5
  static TextStyle pageTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 26,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.1,
      );

  /// Bottom-sheet or panel title — 22 · w700 · ls-0.3
  static TextStyle sheetTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  /// Dialog / confirm title — 20 · w700 · ls-0.3
  static TextStyle dialogTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  /// Section heading (e.g. "En cours") — 18 · w700 · ls-0.3
  static TextStyle sectionHeading(bool isDark) => GoogleFonts.fraunces(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: isDark
            ? Colors.white.withValues(alpha: 0.85)
            : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
      );

  /// Card / portal button title — 17 · w700 · ls-0.1
  static TextStyle cardTitle(bool isDark) => GoogleFonts.fraunces(
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.1,
      );

  /// Stat value — large variant (parent dashboard) — 28 · w800 · h1.0 · ls-0.5
  static TextStyle statValueLG(bool isDark) => GoogleFonts.fraunces(
        fontSize: 28,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.5,
        height: 1.0,
      );

  /// Stat value — medium variant (pro / referent dashboards) — 22 · w800 · h1.0 · ls-0.3
  static TextStyle statValueMD(bool isDark) => GoogleFonts.fraunces(
        fontSize: 22,
        fontWeight: FontWeight.w800,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        letterSpacing: -0.3,
        height: 1.0,
      );

  /// Tutorial large title — 52 · w700 · h1.0 · ls-1.5 (always light background)
  static TextStyle tutorialBig() => GoogleFonts.fraunces(
        fontSize: 52,
        fontWeight: FontWeight.w700,
        height: 1.0,
        letterSpacing: -1.5,
        color: AppColors.lightTextPrimary,
      );

  /// Tutorial subtitle — 28 · w500 · h1.2 · ls-0.5 (color supplied by caller)
  static TextStyle tutorialSub(Color color) => GoogleFonts.fraunces(
        fontSize: 28,
        fontWeight: FontWeight.w500,
        height: 1.2,
        letterSpacing: -0.5,
        color: color,
      );

  // ── Manrope ──────────────────────────────────────────────────────────────────

  /// Section overline (ALL CAPS, internal) — 11 · w700 · ls1.2
  static TextStyle sectionLabel(bool isDark) => GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: isDark
            ? Colors.white.withValues(alpha: 0.45)
            : AppColors.lightTextSecondary,
        letterSpacing: 1.2,
      );

  /// Overline with explicit color (portal badges, custom labels) — 11 · w700
  static TextStyle overline(Color color, {double letterSpacing = 0.8}) =>
      GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: letterSpacing,
        color: color,
      );

  /// Body text (muted / secondary) — 14 · w400
  static TextStyle body(bool isDark, {double? height}) => GoogleFonts.manrope(
        fontSize: 14,
        color: isDark
            ? Colors.white.withValues(alpha: 0.65)
            : AppColors.lightTextSecondary,
        height: height,
      );

  /// Body text (primary color) — 14 · w500 · h1.5
  static TextStyle bodyPrimary(bool isDark, {double? height = 1.5}) =>
      GoogleFonts.manrope(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
        height: height,
      );

  /// Muted subtitle / helper — 13 · [fontWeight]
  static TextStyle subtitle(
    bool isDark, {
    FontWeight fontWeight = FontWeight.w400,
    double? height,
  }) =>
      GoogleFonts.manrope(
        fontSize: 13,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.50)
            : AppColors.lightTextSecondary,
        height: height,
      );

  /// Caption / helper text — 12 · [fontWeight]
  static TextStyle caption(bool isDark,
          {FontWeight fontWeight = FontWeight.w500}) =>
      GoogleFonts.manrope(
        fontSize: 12,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.50)
            : AppColors.lightTextSecondary,
      );

  /// Bold person name / label — [fontSize] · w700
  static TextStyle nameBold(bool isDark, {double fontSize = 14}) =>
      GoogleFonts.manrope(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
      );

  /// Avatar / initials — [fontSize] · w700 · white
  static TextStyle initials({double fontSize = 14}) => GoogleFonts.manrope(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  /// Primary action button label — [fontSize] · w700 · white
  static TextStyle button({double fontSize = 15}) => GoogleFonts.manrope(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  /// Badge / pill text (color supplied by caller) — [fontSize] · w700 · ls0.3
  static TextStyle badge(Color color, {double fontSize = 10}) =>
      GoogleFonts.manrope(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.3,
      );

  /// Timestamp / time-ago — 11 · [fontWeight]
  static TextStyle timeAgo(bool isDark,
          {FontWeight fontWeight = FontWeight.w500}) =>
      GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: fontWeight,
        color: isDark
            ? Colors.white.withValues(alpha: 0.35)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70),
      );

  /// Form field micro-label (ALL CAPS) — 10 · w700 · ls0.9
  static TextStyle fieldLabel(bool isDark) => GoogleFonts.manrope(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.9,
        color: isDark
            ? Colors.white.withValues(alpha: 0.55)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70),
      );

  /// Form text field input — 15 · w500
  static TextStyle fieldInput(bool isDark) => GoogleFonts.manrope(
        fontSize: 15,
        fontWeight: FontWeight.w500,
        color: isDark ? Colors.white : AppColors.lightTextPrimary,
      );

  /// Tab chip label — 14 · w700/w500 (active state)
  static TextStyle tabChip(bool isDark, {required bool active}) =>
      GoogleFonts.manrope(
        fontSize: 14,
        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
        color: active
            ? (isDark ? Colors.white : AppColors.lightTextPrimary)
            : (isDark
                ? Colors.white.withValues(alpha: 0.40)
                : AppColors.lightTextSecondary),
      );
}
