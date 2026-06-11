import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../dashboard/dashboard_page.dart';
import '../dashboard/report_detail_page.dart';

// ─── Modèle local ─────────────────────────────────────────────────────────────

class _ParentReport {
  final ReportItem report;
  final String childName;
  _ParentReport({required this.report, required this.childName});
}

List<_ParentReport> _buildParentReports() {
  final reports = buildMockReports();
  return [
    _ParentReport(report: reports[0], childName: 'Lucas Martin'),
    _ParentReport(report: reports[1], childName: 'Lucas Martin'),
    _ParentReport(report: reports[2], childName: 'Emma Martin'),
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

class ParentDashboardPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  const ParentDashboardPage({super.key, required this.onToggleTheme});

  @override
  State<ParentDashboardPage> createState() => _ParentDashboardPageState();
}

class _ParentDashboardPageState extends State<ParentDashboardPage> {
  static List<_ParentReport>? _persistentReports;
  late List<_ParentReport> _reports;

  @override
  void initState() {
    super.initState();
    _persistentReports ??= _buildParentReports();
    _reports = _persistentReports!;
  }

  int get _activeCount =>
      _reports.where((r) => r.report.status != ReportStatus.resolved).length;

  int get _resolvedCount =>
      _reports.where((r) => r.report.status == ReportStatus.resolved).length;

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
                    _ParentAppBar(isDark: isDark, onToggleTheme: widget.onToggleTheme),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 20),
                            _Greeting(isDark: isDark),
                            const SizedBox(height: 20),
                            _StatsRow(
                              isDark: isDark,
                              activeCount: _activeCount,
                              resolvedCount: _resolvedCount,
                            ),
                            const SizedBox(height: 28),
                            _SectionHeader(isDark: isDark),
                            const SizedBox(height: 12),
                            ..._reports.map(
                              (r) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ParentReportCard(
                                  isDark: isDark,
                                  parentReport: r,
                                  onToggleTheme: widget.onToggleTheme,
                                  onArchive: () => setState(() => _reports.remove(r)),
                                ),
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

class _ParentAppBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  const _ParentAppBar({required this.isDark, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          // Bouton déconnexion
          GestureDetector(
            onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
            child: Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: isDark
                    ? Colors.white.withValues(alpha: 0.10)
                    : Colors.black.withValues(alpha: 0.07),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.logout_rounded,
                      size: 16,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.70)
                          : AppColors.lightTextSecondary),
                  const SizedBox(width: 6),
                  Text(
                    'Déconnexion',
                    style: GoogleFonts.manrope(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.70)
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Spacer(),
          // Toggle dark/light
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
                    isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                    color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black,
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
          'Bienvenue sur le portail de suivi.',
          style: GoogleFonts.fraunces(
            fontSize: 30,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppColors.lightTextPrimary,
            letterSpacing: -0.5,
            height: 1.15,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "Ici, vous suivrez l'avancement des signalements de votre ou vos enfant(s).",
          style: GoogleFonts.fraunces(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
            letterSpacing: -0.1,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

// ─── Stats row ────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  final bool isDark;
  final int activeCount;
  final int resolvedCount;
  const _StatsRow({required this.isDark, required this.activeCount, required this.resolvedCount});

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(child: _StatCard(value: '$activeCount', label: 'Actifs', isFilled: true, isDark: isDark)),
          const SizedBox(width: 10),
          Expanded(child: _StatCard(value: '$resolvedCount', label: 'Résolu', isFilled: false, isDark: isDark)),
          const SizedBox(width: 10),
          Expanded(child: _ContactCard(isDark: isDark)),
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

  const _StatCard({required this.value, required this.label, required this.isFilled, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final bg = isFilled
        ? AppColors.primary
        : (isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard);
    final valueColor = isFilled ? Colors.white : (isDark ? Colors.white : AppColors.lightTextPrimary);
    final labelColor = isFilled
        ? Colors.white.withValues(alpha: 0.80)
        : (isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary);

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        boxShadow: isFilled
            ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.30), blurRadius: 12, offset: const Offset(0, 4))]
            : (isDark ? null : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))]),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(value, style: GoogleFonts.fraunces(fontSize: 28, fontWeight: FontWeight.w800, color: valueColor, letterSpacing: -0.5, height: 1.0)),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: labelColor)),
        ],
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final bool isDark;
  const _ContactCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isDark
              ? null
              : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.phone_outlined, color: AppColors.primary, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              'Contact',
              style: GoogleFonts.manrope(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary,
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
  const _SectionHeader({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Text(
      'SIGNALEMENTS',
      style: GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white.withValues(alpha: 0.45) : AppColors.lightTextSecondary,
        letterSpacing: 1.2,
      ),
    );
  }
}

// ─── Carte signalement parent ─────────────────────────────────────────────────

class _ParentReportCard extends StatelessWidget {
  final bool isDark;
  final _ParentReport parentReport;
  final VoidCallback onToggleTheme;
  final VoidCallback onArchive;

  const _ParentReportCard({
    required this.isDark,
    required this.parentReport,
    required this.onToggleTheme,
    required this.onArchive,
  });

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

  String _initials(String fullName) {
    final parts = fullName.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return fullName.substring(0, 1).toUpperCase();
  }

  void _showOptions(BuildContext context) {
    final canArchive = parentReport.report.status == ReportStatus.resolved;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A3832) : Colors.white,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.20) : Colors.black.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 8),
            // Voir le détail
            GestureDetector(
              onTap: () {
                Navigator.of(sheetCtx).pop();
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => ReportDetailPage(
                    report: parentReport.report,
                    onToggleTheme: onToggleTheme,
                    onDelete: () {},
                    canAddInfo: false,
                    canDelete: false,
                  ),
                ));
              },
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Row(
                  children: [
                    Icon(Icons.open_in_new_rounded, size: 20, color: AppColors.primary),
                    const SizedBox(width: 14),
                    Text('Voir le détail', style: GoogleFonts.manrope(fontSize: 15, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.lightTextPrimary)),
                  ],
                ),
              ),
            ),
            Divider(height: 1, indent: 20, endIndent: 20, color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.06)),
            // Archiver
            GestureDetector(
              onTap: canArchive
                  ? () {
                      Navigator.of(sheetCtx).pop();
                      _confirmArchive(context);
                    }
                  : null,
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Row(
                  children: [
                    Icon(
                      Icons.archive_outlined,
                      size: 20,
                      color: canArchive
                          ? AppColors.primary
                          : (isDark ? Colors.white.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.20)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Archiver',
                            style: GoogleFonts.manrope(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: canArchive
                                  ? (isDark ? Colors.white : AppColors.lightTextPrimary)
                                  : (isDark ? Colors.white.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.22)),
                            ),
                          ),
                          if (!canArchive)
                            Text(
                              'Disponible uniquement si résolu',
                              style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.30) : AppColors.lightTextSecondary),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _confirmArchive(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A3832) : Colors.white,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.archive_outlined, color: AppColors.primary, size: 24),
              ),
              const SizedBox(height: 16),
              Text(
                'Archiver ce signalement ?',
                style: GoogleFonts.fraunces(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Ce signalement disparaîtra de votre tableau de bord. Vous pourrez le retrouver à tout moment depuis votre portail web parent.',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  color: isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () {
                  Navigator.of(context).pop();
                  onArchive();
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.30), blurRadius: 12, offset: const Offset(0, 4))],
                  ),
                  child: Text('Archiver', style: GoogleFonts.manrope(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white), textAlign: TextAlign.center),
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: Text(
                    'Annuler',
                    style: GoogleFonts.manrope(fontSize: 15, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final report = parentReport.report;
    final color = _colors[report.priority]!;
    final badge = _badges[report.priority]!;

    return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
          borderRadius: BorderRadius.circular(24),
          border: isDark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
          boxShadow: isDark
              ? null
              : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar enfant
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.primary.withValues(alpha: 0.35)
                        : AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      _initials(parentReport.childName),
                      style: GoogleFonts.manrope(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Nom de l'enfant
                      Text(
                        parentReport.childName,
                        style: GoogleFonts.manrope(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.55)
                              : AppColors.lightTextSecondary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      // Badges numéro + priorité
                      Row(
                        children: [
                          isDark
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: BackdropFilter(
                                    filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.10),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(report.caseNumber, style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.70))),
                                    ),
                                  ),
                                )
                              : Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: AppColors.warmWhite, borderRadius: BorderRadius.circular(8)),
                                  child: Text(report.caseNumber, style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.lightTextSecondary)),
                                ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: isDark ? 0.20 : 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                                const SizedBox(width: 4),
                                Text(badge, style: GoogleFonts.manrope(fontSize: 10, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.3)),
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
                          color: isDark ? Colors.white : AppColors.lightTextPrimary,
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
                          color: isDark ? Colors.white.withValues(alpha: 0.45) : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => _showOptions(context),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 4),
                    child: Icon(Icons.more_horiz_rounded,
                        color: isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary,
                        size: 20),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _ParentProgressTracker(isDark: isDark, status: report.status, activeColor: color),
          ],
        ),
      );
  }
}

// ─── Barre de progression (copie allégée) ─────────────────────────────────────

class _ParentProgressTracker extends StatelessWidget {
  final bool isDark;
  final ReportStatus status;
  final Color activeColor;

  const _ParentProgressTracker({required this.isDark, required this.status, required this.activeColor});

  static const List<String> _labels = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU'];

  int get _ci {
    switch (status) {
      case ReportStatus.filed: return 0;
      case ReportStatus.reviewed: return 1;
      case ReportStatus.inProgress: return 2;
      case ReportStatus.resolved: return 3;
    }
  }

  @override
  Widget build(BuildContext context) {
    final ci = _ci;
    final inactive = isDark ? Colors.white.withValues(alpha: 0.15) : Colors.black.withValues(alpha: 0.12);

    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _dot(0, ci, inactive),
            Expanded(child: _line(ci >= 1, inactive)),
            _dot(1, ci, inactive),
            Expanded(child: _line(ci >= 2, inactive)),
            _dot(2, ci, inactive),
            Expanded(child: _line(ci >= 3, inactive)),
            _dot(3, ci, inactive),
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
                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                color: isCurrent
                    ? activeColor
                    : (isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary.withValues(alpha: 0.70)),
                letterSpacing: 0.3,
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _dot(int i, int ci, Color inactive) {
    final filled = i <= ci;
    final isCurrent = i == ci;
    return Container(
      width: isCurrent ? 10 : 7,
      height: isCurrent ? 10 : 7,
      decoration: BoxDecoration(color: filled ? activeColor : inactive, shape: BoxShape.circle),
    );
  }

  Widget _line(bool filled, Color inactive) {
    return Container(height: 2, decoration: BoxDecoration(color: filled ? activeColor : inactive, borderRadius: BorderRadius.circular(1)));
  }
}
