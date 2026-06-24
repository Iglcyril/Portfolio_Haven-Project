import 'dart:async';
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/data/report_store.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/report_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/glass_circle_button.dart';

// ─── Page principale ──────────────────────────────────────────────────────────

class ReferentDashboardPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final String? currentUserName;

  const ReferentDashboardPage({
    super.key,
    required this.onToggleTheme,
    this.currentUserName,
  });

  @override
  State<ReferentDashboardPage> createState() => _ReferentDashboardPageState();
}

class _ReferentDashboardPageState extends State<ReferentDashboardPage> {
  bool _isLoading = true;
  Timer? _pollingTimer;

  List<HavenReport> get _myReports => widget.currentUserName == null
      ? []
      : ReportStore.instance.reports
          .where((r) => r.assignedTo == widget.currentUserName)
          .toList();

  List<HavenReport> get _active =>
      _myReports.where((r) => !r.isResolved && !r.isArchivedByReferent).toList();

  List<HavenReport> get _resolved =>
      _myReports.where((r) => r.isResolved && !r.isArchivedByReferent).toList();

  List<HavenReport> get _archived =>
      _myReports.where((r) => r.isArchivedByReferent).toList();

  void _rebuild() => setState(() {});

  @override
  void initState() {
    super.initState();
    ReportStore.instance.addListener(_rebuild);
    _fetchReports();
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) => _fetchReports());
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    ReportStore.instance.removeListener(_rebuild);
    super.dispose();
  }

  Future<void> _fetchReports() async {
    try {
      final apiReports = await ReportService.getAdminReports();
      if (!mounted) return;
      ReportStore.instance.reports
        ..clear()
        ..addAll(apiReports.map(_toHavenReport));
      ReportStore.instance.notify();
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  HavenReport _toHavenReport(ApiReport r) => HavenReport(
        caseNumber: r.trackingId,
        anonLevel: switch (r.anonymatLevel) {
          'total' => 'Anonyme',
          'partiel' => 'Semi-anonyme',
          _ => 'Identité visible',
        },
        initialText: r.deposition ?? '',
        studentName: r.studentName,
        studentClass: r.studentClass,
        submittedAt: r.createdAt,
        riskLevel: switch (r.severity) {
          'ELEVE' => 'Élevé',
          'MOYEN' => 'Moyen',
          _ => null,
        },
        crisisDetected: r.crisisDetected,
        isAssigned: r.assignedTo != null,
        assignedTo: r.assignedTo?.fullName,
        isResolved: r.status == 'RESOLU' || r.status == 'ARCHIVE',
        isArchivedByDirector: r.status == 'ARCHIVE',
        progressStage: switch (r.status) {
          'EN_COURS' => 2,
          'RESOLU' || 'ARCHIVE' => 3,
          _ => 0,
        },
        events: r.staffEvents
            .map((e) => ReportEvent(
                  type: e.type,
                  comment: e.comment,
                  createdAt: e.createdAt,
                ))
            .toList(),
      );

  // ── Navigation vers le détail ─────────────────────────────────────────────

  void _openDetail(BuildContext ctx, HavenReport report) {
    Navigator.push(
      ctx,
      MaterialPageRoute(
        builder: (_) => _ReferentDetailPage(
          report: report,
          onToggleTheme: widget.onToggleTheme,
        ),
      ),
    );
  }

  // ── Bottom sheet : archivés ───────────────────────────────────────────────

  void _showArchivedSheet(BuildContext ctx, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => _ReferentBottomSheet(
        isDark: isDark,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mes signalements archivés',
              style: AppTextStyles.sheetTitle(isDark),
            ),
            const SizedBox(height: 4),
            Text(
              _archived.isEmpty
                  ? 'Aucun signalement archivé'
                  : '${_archived.length} signalement${_archived.length > 1 ? 's' : ''} archivé${_archived.length > 1 ? 's' : ''}',
              style: AppTextStyles.subtitle(isDark),
            ),
            if (_archived.isNotEmpty) ...[
              const SizedBox(height: 20),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(ctx).size.height * 0.45,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    children: _archived.map((r) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _ReferentReportCard(
                          report: r,
                          isDark: isDark,
                          onTap: null,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Bottom sheet : résolus ────────────────────────────────────────────────

  void _showResolvedSheet(BuildContext ctx, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (_, setSheet) => _ReferentBottomSheet(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Signalements résolus',
                style: AppTextStyles.sheetTitle(isDark),
              ),
              const SizedBox(height: 4),
              Text(
                _resolved.isEmpty
                    ? 'Aucun signalement résolu en attente d\'archivage'
                    : '${_resolved.length} signalement${_resolved.length > 1 ? 's' : ''} résolu${_resolved.length > 1 ? 's' : ''}',
                style: AppTextStyles.subtitle(isDark),
              ),
              if (_resolved.isNotEmpty) ...[
                const SizedBox(height: 20),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(ctx).size.height * 0.50,
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      children: _resolved.map((r) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _ReferentReportCard(
                            report: r,
                            isDark: isDark,
                            trailing: GestureDetector(
                              onTap: () {
                                ReportStore.instance.archiveByReferent(r);
                                ReportService.updateStatus(r.caseNumber, 'ARCHIVE').catchError((_) {});
                                setSheet(() {});
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  'Archiver',
                                  style: GoogleFonts.manrope(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            onTap: () {
                              Navigator.pop(sheetCtx);
                              _openDetail(ctx, r);
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Container(
        color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
        child: const Center(child: CircularProgressIndicator()),
      );
    }

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
                    // ── App bar ──────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                      child: Row(
                        children: [
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
                          GestureDetector(
                            onTap: widget.onToggleTheme,
                            child: GlassCircleButton(
                              isDark: isDark,
                              darkAlpha: 0.10,
                              lightAlpha: 0.06,
                              child: Icon(
                                isDark
                                    ? Icons.light_mode_rounded
                                    : Icons.dark_mode_rounded,
                                size: 18,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.80)
                                    : AppColors.lightTextSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // ── Titre ─────────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Mes signalements',
                            style: GoogleFonts.fraunces(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? Colors.white
                                  : AppColors.lightTextPrimary,
                              letterSpacing: -0.5,
                              height: 1.1,
                            ),
                          ),
                          if (widget.currentUserName != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              widget.currentUserName!,
                              style: GoogleFonts.manrope(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.50)
                                    : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── Stat cards ───────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Row(
                        children: [
                          Expanded(
                            child: _ReferentStatCard(
                              value: '${_active.length}',
                              label: 'Actifs',
                              icon: Icons.folder_open_outlined,
                              isDark: isDark,
                              isFilled: true,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _ReferentStatCard(
                              value: '${_resolved.length}',
                              label: 'Résolus',
                              icon: Icons.check_circle_outline_rounded,
                              isDark: isDark,
                              highlight: _resolved.isNotEmpty,
                              onTap: () => _showResolvedSheet(context, isDark),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _ReferentStatCard(
                              value: '${_archived.length}',
                              label: 'Archivés',
                              icon: Icons.archive_outlined,
                              isDark: isDark,
                              onTap: () => _showArchivedSheet(context, isDark),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),

                    // ── Section titre ────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        'En cours',
                        style: AppTextStyles.sectionHeading(isDark),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // ── Liste signalements actifs ────────────────────────
                    Expanded(
                      child: _active.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.inbox_outlined,
                                    size: 52,
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.15)
                                        : AppColors.lightTextSecondary
                                            .withValues(alpha: 0.30),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    'Aucun signalement actif',
                                    style: GoogleFonts.manrope(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.35)
                                          : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Les signalements qui vous sont attribués\napparaîtront ici',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.manrope(
                                      fontSize: 12,
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.20)
                                          : AppColors.lightTextSecondary
                                              .withValues(alpha: 0.60),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding:
                                  const EdgeInsets.fromLTRB(24, 0, 24, 32),
                              itemCount: _active.length,
                              itemBuilder: (ctx, i) {
                                final report = _active[i];
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 14),
                                  child: _ReferentReportCard(
                                    report: report,
                                    isDark: isDark,
                                    onTap: () => _openDetail(ctx, report),
                                  ),
                                );
                              },
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

// ─── Card signalement référent ────────────────────────────────────────────────

class _ReferentReportCard extends StatelessWidget {
  final HavenReport report;
  final bool isDark;
  final VoidCallback? onTap;
  final Widget? trailing;

  const _ReferentReportCard({
    required this.report,
    required this.isDark,
    this.onTap,
    this.trailing,
  });

  static String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return 'il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'il y a ${diff.inHours} h';
    return 'il y a ${diff.inDays} j';
  }

  static const _riskColors = {
    'Faible': Color(0xFF2EAB7B),
    'Moyen': Color(0xFFE67E22),
    'Élevé': Color(0xFFC0392B),
  };

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 12, 16),
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
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── En-tête ───────────────────────────────────────────────
            Row(
              children: [
                _buildCaseChip(),
                const SizedBox(width: 8),
                if (report.riskLevel != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: _riskColors[report.riskLevel]!
                          .withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      report.riskLevel!,
                      style: GoogleFonts.manrope(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: _riskColors[report.riskLevel]!,
                      ),
                    ),
                  )
                else
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Non évalué',
                      style: GoogleFonts.manrope(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.40)
                            : AppColors.lightTextSecondary
                                .withValues(alpha: 0.70),
                      ),
                    ),
                  ),
                if (report.crisisDetected) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFC0392B).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.warning_rounded, size: 11, color: Color(0xFFC0392B)),
                        const SizedBox(width: 4),
                        Text(
                          'Urgence',
                          style: GoogleFonts.manrope(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFFC0392B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const Spacer(),
                if (trailing != null) trailing!,
                if (trailing == null)
                  Text(
                    _timeAgo(report.submittedAt),
                    style: GoogleFonts.manrope(
                      fontSize: 11,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.35)
                          : AppColors.lightTextSecondary
                              .withValues(alpha: 0.70),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 8),

            // ── Badge anonymat + identité ─────────────────────────────
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary
                        .withValues(alpha: isDark ? 0.18 : 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    report.anonLevel,
                    style: GoogleFonts.manrope(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                if (report.studentName != null && report.anonLevel != 'Anonyme')
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.10)
                          : Colors.black.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      report.studentName!,
                      style: GoogleFonts.manrope(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.70)
                            : AppColors.lightTextPrimary,
                      ),
                    ),
                  ),
                if (report.studentClass != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.10)
                          : Colors.black.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      report.studentClass!,
                      style: GoogleFonts.manrope(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.70)
                            : AppColors.lightTextPrimary,
                      ),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 10),

            // ── Texte ─────────────────────────────────────────────────
            Text(
              report.initialText,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.manrope(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.5,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.75)
                    : AppColors.lightTextPrimary.withValues(alpha: 0.85),
              ),
            ),

            const SizedBox(height: 14),

            // ── Barre de progression ──────────────────────────────────
            _ReferentMiniBar(
              isDark: isDark,
              progressStage: report.progressStage,
              riskLevel: report.riskLevel,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCaseChip() {
    if (isDark) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              report.caseNumber,
              style: AppTextStyles.badge(Colors.white.withValues(alpha: 0.85), fontSize: 11),
            ),
          ),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.warmWhite,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        report.caseNumber,
        style: AppTextStyles.badge(AppColors.lightTextSecondary, fontSize: 11),
      ),
    );
  }
}

// ─── Mini progress bar référent ───────────────────────────────────────────────

class _ReferentMiniBar extends StatelessWidget {
  final bool isDark;
  final int progressStage;
  final String? riskLevel;

  const _ReferentMiniBar({
    required this.isDark,
    required this.progressStage,
    this.riskLevel,
  });

  static const _riskColors = {
    'Faible': Color(0xFF2EAB7B),
    'Moyen': Color(0xFFE67E22),
    'Élevé': Color(0xFFC0392B),
  };

  Color get _activeColor => _riskColors[riskLevel] ?? AppColors.primary;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: List.generate(kProgressSteps.length * 2 - 1, (i) {
            if (i.isOdd) {
              final filled = (i ~/ 2) < progressStage;
              return Expanded(
                child: Container(
                  height: 2,
                  color: filled
                      ? _activeColor
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.12)
                          : Colors.black.withValues(alpha: 0.10)),
                ),
              );
            }
            final step = i ~/ 2;
            final isActive = step == progressStage;
            final isDone = step < progressStage;
            return Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: (isActive || isDone)
                    ? _activeColor
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.15)
                        : Colors.black.withValues(alpha: 0.12)),
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: _activeColor.withValues(alpha: 0.50),
                          blurRadius: 6,
                          spreadRadius: 1,
                        ),
                      ]
                    : null,
              ),
            );
          }),
        ),
        const SizedBox(height: 4),
        Row(
          children: List.generate(kProgressSteps.length * 2 - 1, (i) {
            if (i.isOdd) return const Expanded(child: SizedBox());
            final step = i ~/ 2;
            final isActive = step == progressStage;
            return Text(
              kProgressSteps[step],
              style: GoogleFonts.manrope(
                fontSize: 9,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive
                    ? _activeColor
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.30)
                        : AppColors.lightTextSecondary.withValues(alpha: 0.60)),
              ),
            );
          }),
        ),
      ],
    );
  }
}

// ─── Stat card référent ───────────────────────────────────────────────────────

class _ReferentStatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final bool isDark;
  final bool isFilled;
  final bool highlight;
  final VoidCallback? onTap;

  const _ReferentStatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.isDark,
    this.isFilled = false,
    this.highlight = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (isFilled) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.80)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.35),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.20),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 17, color: Colors.white),
              ),
              const SizedBox(height: 10),
              Text(
                value,
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.3,
                  height: 1.0,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: GoogleFonts.manrope(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withValues(alpha: 0.80),
                ),
              ),
            ],
          ),
        ),
      );
    }
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          border: isDark
              ? Border.all(color: Colors.white.withValues(alpha: 0.08))
              : null,
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: highlight
                    ? AppColors.primary.withValues(alpha: 0.18)
                    : AppColors.primary.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 17,
                color: highlight
                    ? AppColors.primary
                    : AppColors.primary.withValues(alpha: 0.75),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: AppTextStyles.statValueMD(isDark),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.45)
                    : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Page détail référent ─────────────────────────────────────────────────────

class _ReferentDetailPage extends StatefulWidget {
  final HavenReport report;
  final VoidCallback onToggleTheme;

  const _ReferentDetailPage({
    required this.report,
    required this.onToggleTheme,
  });

  @override
  State<_ReferentDetailPage> createState() => _ReferentDetailPageState();
}

class _ReferentDetailPageState extends State<_ReferentDetailPage> {
  static const _riskColors = {
    'Faible': Color(0xFF2EAB7B),
    'Moyen': Color(0xFFE67E22),
    'Élevé': Color(0xFFC0392B),
  };

  // Toujours chercher le rapport courant dans le store pour éviter les références périmées
  HavenReport get _currentReport => ReportStore.instance.reports.firstWhere(
        (r) => r.caseNumber == widget.report.caseNumber,
        orElse: () => widget.report,
      );

  void _rebuild() => setState(() {});

  @override
  void initState() {
    super.initState();
    ReportStore.instance.addListener(_rebuild);
  }

  @override
  void dispose() {
    ReportStore.instance.removeListener(_rebuild);
    super.dispose();
  }

  // ── Bottom sheet : ajouter un événement ──────────────────────────────────

  void _showAddEventSheet(BuildContext ctx, bool isDark) {
    String? selectedType;
    final commentCtrl = TextEditingController();

    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (_, setSheet) => Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(sheetCtx).viewInsets.bottom),
          child: _ReferentBottomSheet(
            isDark: isDark,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ajouter un événement',
                  style: AppTextStyles.dialogTitle(isDark),
                ),
                const SizedBox(height: 20),
                // Choix du type
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: kEventTypes.map((type) {
                    final isSelected = selectedType == type;
                    final color = kEventColors[type]!;
                    return GestureDetector(
                      onTap: () => setSheet(() => selectedType = type),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? color.withValues(alpha: 0.15)
                              : (isDark
                                  ? Colors.white.withValues(alpha: 0.07)
                                  : Colors.black.withValues(alpha: 0.04)),
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected
                              ? Border.all(
                                  color: color.withValues(alpha: 0.50), width: 1.5)
                              : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(kEventIcons[type]!, size: 14, color: isSelected ? color : (isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary)),
                            const SizedBox(width: 6),
                            Text(
                              type,
                              style: GoogleFonts.manrope(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isSelected
                                    ? color
                                    : (isDark
                                        ? Colors.white.withValues(alpha: 0.70)
                                        : AppColors.lightTextPrimary),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                // Commentaire optionnel
                Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.07)
                        : Colors.black.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: TextField(
                    controller: commentCtrl,
                    maxLines: 3,
                    style: GoogleFonts.manrope(
                      fontSize: 13,
                      color: isDark ? Colors.white : AppColors.lightTextPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Commentaire (optionnel)…',
                      hintStyle: GoogleFonts.manrope(
                        fontSize: 13,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.30)
                            : AppColors.lightTextSecondary,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(14),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Bouton valider
                GestureDetector(
                  onTap: selectedType == null
                      ? null
                      : () async {
                          final comment = commentCtrl.text.trim().isEmpty
                              ? null
                              : commentCtrl.text.trim();
                          ReportStore.instance.addEvent(
                            widget.report,
                            ReportEvent(
                              type: selectedType!,
                              comment: comment,
                              createdAt: DateTime.now(),
                            ),
                          );
                          Navigator.pop(sheetCtx);
                          ReportService.saveEvent(
                            widget.report.caseNumber,
                            selectedType!,
                            comment: comment,
                          ).catchError((_) {});
                        },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: selectedType != null
                          ? AppColors.primary
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.10)
                              : Colors.black.withValues(alpha: 0.06)),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Text(
                      'Enregistrer',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.manrope(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: selectedType != null
                            ? Colors.white
                            : (isDark
                                ? Colors.white.withValues(alpha: 0.30)
                                : AppColors.lightTextSecondary),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final report = _currentReport;
    // Peut modifier = être la personne assignée sur ce dossier (indépendant du rôle)
    final canEdit = report.assignedTo != null &&
        report.assignedTo == AuthService.currentUser?.fullName;
    final riskColor = _riskColors[report.riskLevel];

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
                  children: [
                    // ── Barre haut ────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 24, 0),
                      child: Row(
                        children: [
                          IconButton(
                            icon: Icon(
                              Icons.arrow_back_ios_rounded,
                              color: isDark
                                  ? Colors.white
                                  : AppColors.lightTextPrimary,
                              size: 20,
                            ),
                            onPressed: () => Navigator.pop(context),
                          ),
                          Expanded(
                            child: Text(
                              report.caseNumber,
                              style: AppTextStyles.dialogTitle(isDark),
                            ),
                          ),
                          // Badge niveau de risque (lecture seule)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: riskColor != null
                                  ? riskColor.withValues(alpha: 0.14)
                                  : (isDark
                                      ? Colors.white.withValues(alpha: 0.08)
                                      : Colors.black.withValues(alpha: 0.06)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              riskColor != null
                                  ? report.riskLevel!.toUpperCase()
                                  : 'NON ÉVALUÉ',
                              style: GoogleFonts.manrope(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: riskColor ??
                                    (isDark
                                        ? Colors.white.withValues(alpha: 0.40)
                                        : AppColors.lightTextSecondary),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: widget.onToggleTheme,
                            child: GlassCircleButton(
                              isDark: isDark,
                              size: 36,
                              darkAlpha: 0.10,
                              lightAlpha: 0.06,
                              child: Icon(
                                isDark
                                    ? Icons.light_mode_rounded
                                    : Icons.dark_mode_rounded,
                                size: 16,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.80)
                                    : AppColors.lightTextSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── Signalement initial ───────────────────
                            _sectionTitle('SIGNALEMENT INITIAL', isDark),
                            const SizedBox(height: 10),
                            _infoCard(isDark, [
                              // Anonymat
                              _infoRow(
                                icon: Icons.shield_outlined,
                                label: report.anonLevel,
                                color: AppColors.primary,
                                isDark: isDark,
                              ),
                              if (report.studentName != null || report.studentClass != null) ...[
                                const SizedBox(height: 8),
                                Row(children: [
                                  if (report.studentName != null) ...[
                                    Icon(Icons.person_outline_rounded, size: 14, color: isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary),
                                    const SizedBox(width: 4),
                                    Text(report.studentName!, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.70) : AppColors.lightTextPrimary)),
                                    const SizedBox(width: 12),
                                  ],
                                  if (report.studentClass != null) ...[
                                    Icon(Icons.school_outlined, size: 14, color: isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary),
                                    const SizedBox(width: 4),
                                    Text(report.studentClass!, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.70) : AppColors.lightTextPrimary)),
                                  ],
                                ]),
                              ],
                              const SizedBox(height: 12),
                              Text(
                                report.initialText,
                                style: GoogleFonts.manrope(
                                  fontSize: 13,
                                  height: 1.6,
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.80)
                                      : AppColors.lightTextPrimary
                                          .withValues(alpha: 0.85),
                                ),
                              ),
                            ]),

                            const SizedBox(height: 24),

                            // ── Progress bar interactive ───────────────
                            _sectionTitle('AVANCEMENT', isDark),
                            const SizedBox(height: 10),
                            _infoCard(isDark, [
                              _ReferentMiniBar(
                                isDark: isDark,
                                progressStage: report.progressStage,
                                riskLevel: report.riskLevel,
                              ),
                              if (canEdit && report.progressStage < 3) ...[
                                const SizedBox(height: 16),
                                GestureDetector(
                                  onTap: () =>
                                      ReportStore.instance.advanceStage(report),
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 13),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Passer à : ${kProgressSteps[report.progressStage + 1]}',
                                          style: AppTextStyles.button(fontSize: 13),
                                        ),
                                        const SizedBox(width: 6),
                                        const Icon(
                                            Icons.arrow_forward_rounded,
                                            size: 14,
                                            color: Colors.white),
                                      ],
                                    ),
                                  ),
                                ),
                              ] else if (report.progressStage >= 3) ...[
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.check_circle_rounded,
                                        size: 16,
                                        color: Color(0xFF2EAB7B)),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Signalement résolu',
                                      style: GoogleFonts.manrope(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF2EAB7B),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ]),

                            const SizedBox(height: 24),

                            // ── Événements ────────────────────────────
                            Row(
                              children: [
                                Expanded(
                                    child: _sectionTitle('ÉVÉNEMENTS', isDark)),
                                if (canEdit) GestureDetector(
                                  onTap: () =>
                                      _showAddEventSheet(context, isDark),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary
                                          .withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.add_rounded,
                                            size: 14,
                                            color: AppColors.primary),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Ajouter',
                                          style: GoogleFonts.manrope(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            if (report.events.isEmpty)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 16),
                                child: Center(
                                  child: Text(
                                    'Aucun événement enregistré',
                                    style: GoogleFonts.manrope(
                                      fontSize: 13,
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.30)
                                          : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                ),
                              )
                            else
                              _buildTimeline(isDark, report.events),
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

  Widget _sectionTitle(String title, bool isDark) => Text(
        title,
        style: GoogleFonts.manrope(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: isDark
              ? Colors.white.withValues(alpha: 0.35)
              : AppColors.lightTextSecondary,
        ),
      );

  Widget _infoCard(bool isDark, List<Widget> children) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          border: isDark
              ? Border.all(color: Colors.white.withValues(alpha: 0.08))
              : null,
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      );

  Widget _infoRow(
      {required IconData icon,
      required String label,
      required Color color,
      required bool isDark}) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 6),
        Text(
          label,
          style: GoogleFonts.manrope(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildTimeline(bool isDark, List<ReportEvent> events) {
    final sorted = [...events]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return Column(
      children: List.generate(sorted.length, (i) {
        final event = sorted[i];
        final isLast = i == sorted.length - 1;
        final riskColor = _riskColors[widget.report.riskLevel];
        final color = riskColor ?? kEventColors[event.type] ?? AppColors.primary;
        final icon = kEventIcons[event.type] ?? Icons.circle_outlined;
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icône + ligne verticale
              SizedBox(
                width: 36,
                child: Column(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.14),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(icon, size: 15, color: color),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.10)
                              : Colors.black.withValues(alpha: 0.08),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Contenu
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            event.type,
                            style: GoogleFonts.manrope(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? Colors.white
                                  : AppColors.lightTextPrimary,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            _fmtEventDate(event.createdAt),
                            style: GoogleFonts.manrope(
                              fontSize: 11,
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.35)
                                  : AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                      ),
                      if (event.comment != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          event.comment!,
                          style: GoogleFonts.manrope(
                            fontSize: 12,
                            height: 1.5,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.60)
                                : AppColors.lightTextPrimary
                                    .withValues(alpha: 0.70),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  String _fmtEventDate(DateTime dt) {
    const months = [
      'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
      'juil.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.'
    ];
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day} ${months[dt.month - 1]} $h:$m';
  }
}

// ─── Bottom sheet wrapper référent ───────────────────────────────────────────

class _ReferentBottomSheet extends StatelessWidget {
  final bool isDark;
  final Widget child;

  const _ReferentBottomSheet({required this.isDark, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A3832) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.20)
                    : Colors.black.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }
}
