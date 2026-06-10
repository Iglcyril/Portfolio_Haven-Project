import 'package:flutter/material.dart';

abstract final class AppColors {
  // Brand
  static const Color primary = Color(0xFF2EAB7B);

  // Light mode gradient
  static const Color lightGradientTop = Color(0xFF1EA983);
  static const Color lightGradientBottom = Color(0xFFF9F6F1);

  // Warm white (replaces pure white in light mode)
  static const Color warmWhite = Color(0xFFF9F6F1);

  // Card background — light mode
  static const Color lightCard = Color(0xFFE6E4DF);

  // Dark mode gradient
  static const Color darkGradientTop = Color(0xFF102F2B);
  static const Color darkGradientBottom = Color(0xFF028966);

  // Text — light mode
  static const Color lightTextPrimary = Color(0xFF1A2E20);
  static const Color lightTextSecondary = Color(0xFF5C7A68);

  // Student Portal button fill (light mode)
  static const Color studentButtonFill = Color(0xFF00A176);
}
