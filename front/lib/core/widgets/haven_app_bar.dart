import 'package:flutter/material.dart';
import 'glass_circle_button.dart';

class HavenAppBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  final Widget? leading;
  final Widget? title;

  const HavenAppBar({
    super.key,
    required this.isDark,
    required this.onToggleTheme,
    this.leading,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          if (leading != null) leading!,
          if (title != null) Expanded(child: title!) else const Spacer(),
          GestureDetector(
            onTap: onToggleTheme,
            child: GlassCircleButton(
              isDark: isDark,
              child: Icon(
                isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
