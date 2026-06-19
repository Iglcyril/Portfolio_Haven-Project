import 'package:flutter/material.dart';
import 'app_colors.dart';

abstract final class AppConstants {
  static const Map<String, Color> riskColors = {
    'Faible': AppColors.primary,
    'Moyen':  Color(0xFFE67E22),
    'Élevé':  Color(0xFFC0392B),
  };
}
