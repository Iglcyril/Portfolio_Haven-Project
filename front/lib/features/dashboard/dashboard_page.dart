import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../report/confidential_choice_page.dart';

// ─── Modèles ──────────────────────────────────────────────────────────────────

enum ReportPriority { high, medium, low }

enum ReportStatus { filed, reviewed, inProgress, resolved }

class ReportItem {
  final String caseNumber;
  final ReportPriority priority;
  final String title;
  final String date;
  final String counselor;
  final ReportStatus status;

  const ReportItem({
    required this.caseNumber,
    required this.priority,
    required this.title,
    required this.date,
    required this.counselor,
    required this.status,
  });
}

const List<ReportItem> _mockReports = [
  ReportItem(
    caseNumber: '#HV-8829',
    priority: ReportPriority.high,
    title: "Messages répétés d'un camarade",
    date: '28 avr.',
    counselor: 'M. Reyes',
    status: ReportStatus.inProgress,
  ),
  ReportItem(
    caseNumber: '#HV-8714',
    priority: ReportPriority.medium,
    title: 'Commentaire inapproprié en classe',
    date: '12 avr.',
    counselor: 'J. Park',
    status: ReportStatus.inProgress,
  ),
  ReportItem(
    caseNumber: '#HV-8602',
    priority: ReportPriority.low,
    title: 'Témoin de harcèlement verbal',
    date: '30 mars',
    counselor: 'Fermé',
    status: ReportStatus.resolved,
  ),
];

// ─── Page ─────────────────────────────────────────────────────────────────────

class DashboardPage extends StatelessWidget {
  final VoidCallback onToggleTheme;

  const DashboardPage({
    super.key,
    required this.onToggleTheme,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
        child: Material(
          color: Colors.transparent,
          child: Stack(
            children: [
              AnchorBackground(isDark: isDark),
              SafeArea(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _DashAppBar(isDark: isDark, onToggleTheme: onToggleTheme),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 20),
                            _Greeting(isDark: isDark),
                            const SizedBox(height: 20),
                            _StatsRow(isDark: isDark),
                            const SizedBox(height: 28),
                            _SectionHeader(
                              isDark: isDark,
                              onNewReport: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ConfidentialChoicePage(
                                    onToggleTheme: onToggleTheme,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            ..._mockReports.map(
                              (r) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ReportCard(isDark: isDark, report: r),
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── App bar ──────────────────────────────────────────────────────────────────

class _DashAppBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  const _DashAppBar({required this.isDark, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.10)
                    : Colors.black.withValues(alpha: 0.07),
              ),
              child: Icon(
                Icons.arrow_back_rounded,
                color: isDark ? Colors.white : Colors.black,
                size: 20,
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: onToggleTheme,
            child: ClipOval(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.18)
                        : Colors.black.withValues(alpha: 0.07),
                  ),
                  child: Icon(
                    isDark
                        ? Icons.light_mode_outlined
                        : Icons.dark_mode_outlined,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.90)
                        : Colors.black,
                    size: 20,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

class _Greeting extends StatelessWidget {
  final bool isDark;
  const _Greeting({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bonjour, Alex.',
          style: GoogleFonts.fraunces(
            fontSize: 34,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppColors.lightTextPrimary,
            letterSpacing: -0.5,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Voici un résumé de tes signalements.',
          style: GoogleFonts.manrope(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isDark
                ? Colors.white.withValues(alpha: 0.55)
                : AppColors.lightTextSecondary,
          ),
        ),
      ],
    );
  }
}

// ─── Stats row ────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  final bool isDark;
  const _StatsRow({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: _StatCard(
                value: '3', label: 'Actifs', isFilled: true, isDark: isDark),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _StatCard(
                value: '1', label: 'Résolu', isFilled: false, isDark: isDark),
          ),
          const SizedBox(width: 10),
          Expanded(child: _BreathingCard(isDark: isDark)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final bool isFilled;
  final bool isDark;

  const _StatCard({
    required this.value,
    required this.label,
    required this.isFilled,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isFilled
        ? AppColors.primary
        : (isDark
            ? Colors.white.withValues(alpha: 0.07)
            : AppColors.lightCard);
    final valueColor = isFilled
        ? Colors.white
        : (isDark ? Colors.white : AppColors.lightTextPrimary);
    final labelColor = isFilled
        ? Colors.white.withValues(alpha: 0.80)
        : (isDark
            ? Colors.white.withValues(alpha: 0.50)
            : AppColors.lightTextSecondary);

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        boxShadow: isFilled
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.30),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                )
              ]
            : (isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ]),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            value,
            style: GoogleFonts.fraunces(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: valueColor,
              letterSpacing: -0.5,
              height: 1.0,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.manrope(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: labelColor,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Breathing card ───────────────────────────────────────────────────────────

class _BreathingCard extends StatelessWidget {
  final bool isDark;
  const _BreathingCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.self_improvement_rounded,
              color: AppColors.primary,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              'Respirer',
              style: GoogleFonts.manrope(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.50)
                    : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── En-tête de section ───────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final bool isDark;
  final VoidCallback onNewReport;

  const _SectionHeader(
      {required this.isDark, required this.onNewReport});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'MES SIGNALEMENTS',
          style: GoogleFonts.manrope(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isDark
                ? Colors.white.withValues(alpha: 0.45)
                : AppColors.lightTextSecondary,
            letterSpacing: 1.2,
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: onNewReport,
          child: Text(
            '+ Nouveau',
            style: GoogleFonts.manrope(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Carte signalement ────────────────────────────────────────────────────────

class _ReportCard extends StatelessWidget {
  final bool isDark;
  final ReportItem report;

  const _ReportCard({required this.isDark, required this.report});

  static const Map<ReportPriority, Color> _colors = {
    ReportPriority.high: Color(0xFFE53935),
    ReportPriority.medium: Color(0xFFFF8F00),
    ReportPriority.low: AppColors.primary,
  };

  static const Map<ReportPriority, String> _badges = {
    ReportPriority.high: 'ÉLEVÉ',
    ReportPriority.medium: 'MOYEN',
    ReportPriority.low: 'FAIBLE',
  };

  @override
  Widget build(BuildContext context) {
    final color = _colors[report.priority]!;
    final badge = _badges[report.priority]!;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : AppColors.lightCard,
        borderRadius: BorderRadius.circular(24),
        border: isDark
            ? Border.all(color: Colors.white.withValues(alpha: 0.08))
            : null,
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                )
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icône bouclier
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: isDark ? 0.20 : 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.shield_outlined, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        isDark
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: BackdropFilter(
                                  filter: ImageFilter.blur(
                                      sigmaX: 12, sigmaY: 12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.white
                                          .withValues(alpha: 0.10),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      report.caseNumber,
                                      style: GoogleFonts.manrope(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white
                                            .withValues(alpha: 0.70),
                                      ),
                                    ),
                                  ),
                                ),
                              )
                            : Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.warmWhite,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  report.caseNumber,
                                  style: GoogleFonts.manrope(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.lightTextSecondary,
                                  ),
                                ),
                              ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: color.withValues(
                                alpha: isDark ? 0.20 : 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                badge,
                                style: GoogleFonts.manrope(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: color,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      report.title,
                      style: GoogleFonts.manrope(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? Colors.white
                            : AppColors.lightTextPrimary,
                        letterSpacing: -0.4,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Déposé le ${report.date} · Responsable : ${report.counselor}',
                      style: GoogleFonts.manrope(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.45)
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.more_horiz_rounded,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.35)
                    : AppColors.lightTextSecondary,
                size: 20,
              ),
            ],
          ),
          const SizedBox(height: 14),
          _ProgressTracker(isDark: isDark, status: report.status, activeColor: color),
        ],
      ),
    );
  }
}

// ─── Barre de progression ─────────────────────────────────────────────────────

class _ProgressTracker extends StatelessWidget {
  final bool isDark;
  final ReportStatus status;
  final Color activeColor;

  const _ProgressTracker({required this.isDark, required this.status, required this.activeColor});

  static const List<String> _labels = [
    'DÉPOSÉ',
    'EXAMINÉ',
    'EN COURS',
    'RÉSOLU',
  ];

  int get _ci {
    switch (status) {
      case ReportStatus.filed:
        return 0;
      case ReportStatus.reviewed:
        return 1;
      case ReportStatus.inProgress:
        return 2;
      case ReportStatus.resolved:
        return 3;
    }
  }

  @override
  Widget build(BuildContext context) {
    final ci = _ci;
    final active = activeColor;
    final inactive = isDark
        ? Colors.white.withValues(alpha: 0.15)
        : Colors.black.withValues(alpha: 0.12);

    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _dot(0, ci, active, inactive),
            Expanded(child: _line(ci >= 1, active, inactive)),
            _dot(1, ci, active, inactive),
            Expanded(child: _line(ci >= 2, active, inactive)),
            _dot(2, ci, active, inactive),
            Expanded(child: _line(ci >= 3, active, inactive)),
            _dot(3, ci, active, inactive),
          ],
        ),
        const SizedBox(height: 5),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(4, (i) {
            final isCurrent = i == ci;
            return Text(
              _labels[i],
              style: GoogleFonts.manrope(
                fontSize: 8,
                fontWeight:
                    isCurrent ? FontWeight.w700 : FontWeight.w500,
                color: isCurrent
                    ? active
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.35)
                        : AppColors.lightTextSecondary
                            .withValues(alpha: 0.70)),
                letterSpacing: 0.3,
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _dot(int i, int ci, Color active, Color inactive) {
    final filled = i <= ci;
    final isCurrent = i == ci;
    return Container(
      width: isCurrent ? 10 : 7,
      height: isCurrent ? 10 : 7,
      decoration: BoxDecoration(
        color: filled ? active : inactive,
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _line(bool filled, Color active, Color inactive) {
    return Container(
      height: 2,
      decoration: BoxDecoration(
        color: filled ? active : inactive,
        borderRadius: BorderRadius.circular(1),
      ),
    );
  }
}
