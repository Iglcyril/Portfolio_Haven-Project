import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class PaginationRow extends StatelessWidget {
  final int page;
  final int totalPages;
  final ValueChanged<int> onPageChange;
  final bool isDark;

  const PaginationRow({
    super.key,
    required this.page,
    required this.totalPages,
    required this.onPageChange,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    if (totalPages <= 1) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _NavButton(
            icon: Icons.chevron_left_rounded,
            onTap: page > 1 ? () => onPageChange(page - 1) : null,
            isDark: isDark,
          ),
          const SizedBox(width: 20),
          Text(
            'Page $page / $totalPages',
            style: TextStyle(fontFamily: 'Manrope', 
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.65)
                  : AppColors.lightTextSecondary,
            ),
          ),
          const SizedBox(width: 20),
          _NavButton(
            icon: Icons.chevron_right_rounded,
            onTap: page < totalPages ? () => onPageChange(page + 1) : null,
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool isDark;

  const _NavButton({
    required this.icon,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: enabled
              ? AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.12)
              : (isDark
                  ? Colors.white.withValues(alpha: 0.05)
                  : Colors.black.withValues(alpha: 0.04)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          icon,
          size: 20,
          color: enabled
              ? AppColors.primary
              : (isDark
                  ? Colors.white.withValues(alpha: 0.20)
                  : Colors.black.withValues(alpha: 0.20)),
        ),
      ),
    );
  }
}
