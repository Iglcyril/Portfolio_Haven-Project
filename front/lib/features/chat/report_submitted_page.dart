import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../dashboard/dashboard_page.dart';

class ReportSubmittedPage extends StatelessWidget {
  final VoidCallback onToggleTheme;
  const ReportSubmittedPage({super.key, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children: [
            AnchorBackground(isDark: isDark),
            SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check_rounded,
                          color: AppColors.primary,
                          size: 40,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Signalement envoyé',
                        style: TextStyle(fontFamily: 'Fraunces', 
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: isDark
                              ? Colors.white
                              : AppColors.lightTextPrimary,
                          letterSpacing: -0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "Merci d'avoir eu le courage de le signaler. L'équipe Haven prend en charge ton dossier.",
                        style: TextStyle(fontFamily: 'Manrope', 
                          fontSize: 18,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.65)
                              : AppColors.lightTextSecondary,
                          height: 1.6,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 40),
                      GestureDetector(
                        onTap: () {
                          int count = 0;
                          Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(
                              builder: (_) => DashboardPage(
                                onToggleTheme: onToggleTheme,
                              ),
                            ),
                            (route) => count++ >= 3,
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 28, vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.35),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Text(
                            'Voir mes signalements',
                            style: TextStyle(fontFamily: 'Manrope', 
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
