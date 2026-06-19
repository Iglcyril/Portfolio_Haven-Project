import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';

class GlassCircleButton extends StatelessWidget {
  final bool isDark;
  final Widget child;
  final double size;
  final double darkAlpha;
  final double lightAlpha;

  const GlassCircleButton({
    super.key,
    required this.isDark,
    required this.child,
    this.size = 40,
    this.darkAlpha = 0.18,
    this.lightAlpha = 0.07,
  });

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDark
                ? Colors.white.withValues(alpha: darkAlpha)
                : Colors.black.withValues(alpha: lightAlpha),
          ),
          child: child,
        ),
      ),
    );
  }
}
