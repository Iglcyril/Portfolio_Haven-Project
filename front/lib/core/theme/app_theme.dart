import 'package:flutter/material.dart';
import 'app_colors.dart';

abstract final class AppTheme {
  static const _manrope = 'Manrope';

  static ThemeData get light => ThemeData(
        brightness: Brightness.light,
        colorScheme: const ColorScheme.light(primary: AppColors.primary),
        fontFamily: _manrope,
        useMaterial3: true,
      );

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(primary: AppColors.primary),
        fontFamily: _manrope,
        useMaterial3: true,
      );
}
