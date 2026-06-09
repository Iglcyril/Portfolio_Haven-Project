import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

abstract final class AppTheme {
  static ThemeData get light => ThemeData(
        brightness: Brightness.light,
        colorScheme: const ColorScheme.light(primary: AppColors.primary),
        textTheme: GoogleFonts.manropeTextTheme(),
        useMaterial3: true,
      );

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(primary: AppColors.primary),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      );
}
