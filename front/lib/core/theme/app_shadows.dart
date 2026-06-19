import 'package:flutter/material.dart';
import 'app_colors.dart';

abstract final class AppShadows {
  static final List<BoxShadow> cardLight = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> card = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> cardMedium = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> primaryGlow = [
    BoxShadow(
      color: AppColors.primary.withValues(alpha: 0.30),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];
}
