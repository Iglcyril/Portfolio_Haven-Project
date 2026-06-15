import 'dart:async';
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../report/confidential_choice_page.dart';
import 'report_detail_page.dart';

// ─── Modèles ──────────────────────────────────────────────────────────────────

enum ReportPriority { high, medium, low }

enum ReportStatus { filed, reviewed, inProgress, resolved }

class ReportAction {
  final DateTime date;
  final String actor;
  final String description;
  final IconData icon;

  const ReportAction({
    required this.date,
    required this.actor,
    required this.description,
    required this.icon,
  });
}

class ReportItem {
  final String caseNumber;
  final ReportPriority priority;
  final String title;
  final String date;
  final String counselor;
  final ReportStatus status;
  final String initialText;
  final DateTime submittedAt;
  final String anonLabel;
  final String? studentClass;
  final String? studentName;
  final List<ReportAction> actions;

  const ReportItem({
    required this.caseNumber,
    required this.priority,
    required this.title,
    required this.date,
    required this.counselor,
    required this.status,
    required this.initialText,
    required this.submittedAt,
    required this.anonLabel,
    required this.actions,
    this.studentClass,
    this.studentName,
  });
}

List<ReportItem> buildMockReports() => [
      ReportItem(
        caseNumber: '#HV-8829',
        priority: ReportPriority.high,
        title: "Messages répétés d'un camarade",
        date: '28 avr.',
        counselor: 'M. Reyes',
        status: ReportStatus.inProgress,
        anonLabel: 'Anonyme à 100%',
        initialText:
            "Depuis environ 3 semaines, un camarade de classe m'envoie des messages très déplaisants sur les réseaux sociaux. Il se moque de moi devant les autres et me menace de partager des photos embarrassantes si je le dénonce. Ça se passe principalement sur Instagram et aussi en classe.",
        submittedAt: DateTime.now().subtract(const Duration(minutes: 2, seconds: 18)),
        actions: [
          ReportAction(date: DateTime.utc(2026, 4, 28, 14, 32), actor: 'Système', description: 'Dossier ouvert et numéro de cas attribué.', icon: Icons.folder_open_rounded),
          ReportAction(date: DateTime.utc(2026, 4, 28, 15, 10), actor: 'M. Reyes', description: 'Dossier assigné à M. Reyes, conseiller principal.', icon: Icons.person_rounded),
          ReportAction(date: DateTime.utc(2026, 4, 29, 9, 0), actor: 'M. Reyes', description: 'Premier entretien planifié pour le 30 avril à 10h00.', icon: Icons.calendar_today_rounded),
          ReportAction(date: DateTime.utc(2026, 4, 30, 10, 25), actor: 'M. Reyes', description: 'Entretien réalisé. Éléments complémentaires recueillis. Enquête en cours auprès des témoins.', icon: Icons.chat_bubble_outline_rounded),
        ],
      ),
      ReportItem(
        caseNumber: '#HV-8714',
        priority: ReportPriority.medium,
        title: 'Commentaire inapproprié en classe',
        date: '12 avr.',
        counselor: 'J. Park',
        status: ReportStatus.inProgress,
        anonLabel: 'Anonyme à moitié',
        studentClass: '3ème B',
        initialText:
            "Lors d'un cours de français, un élève a fait un commentaire blessant sur mon apparence physique devant toute la classe. Le professeur n'a pas réagi. Ce n'est pas la première fois que cela arrive.",
        submittedAt: DateTime(2026, 4, 12, 10, 5),
        actions: [
          ReportAction(date: DateTime.utc(2026, 4, 12, 10, 5), actor: 'Système', description: 'Dossier ouvert et numéro de cas attribué.', icon: Icons.folder_open_rounded),
          ReportAction(date: DateTime.utc(2026, 4, 12, 11, 30), actor: 'J. Park', description: 'Dossier assigné à J. Park.', icon: Icons.person_rounded),
          ReportAction(date: DateTime.utc(2026, 4, 13, 14, 0), actor: 'J. Park', description: "Entretien avec l'enseignant concerné réalisé.", icon: Icons.chat_bubble_outline_rounded),
        ],
      ),
      ReportItem(
        caseNumber: '#HV-8602',
        priority: ReportPriority.low,
        title: 'Témoin de harcèlement verbal',
        date: '30 mars',
        counselor: 'Fermé',
        status: ReportStatus.resolved,
        anonLabel: 'Pas d\'anonymat',
        studentName: 'Lucas Bernard',
        studentClass: '2nde A',
        initialText:
            "J'ai été témoin d'une scène de harcèlement verbal dans la cour de récréation. Un groupe d'élèves s'en prenait à un camarade plus jeune. Je n'ai pas osé intervenir mais je voulais le signaler.",
        submittedAt: DateTime(2026, 3, 30, 8, 42),
        actions: [
          ReportAction(date: DateTime.utc(2026, 3, 30, 8, 42), actor: 'Système', description: 'Dossier ouvert et numéro de cas attribué.', icon: Icons.folder_open_rounded),
          ReportAction(date: DateTime.utc(2026, 3, 30, 9, 15), actor: 'M. Reyes', description: 'Dossier pris en charge.', icon: Icons.person_rounded),
          ReportAction(date: DateTime.utc(2026, 3, 31, 11, 0), actor: 'M. Reyes', description: 'Médiation réalisée entre les parties concernées.', icon: Icons.handshake_outlined),
          ReportAction(date: DateTime.utc(2026, 4, 2, 14, 0), actor: 'M. Reyes', description: 'Dossier clôturé. Situation résolue.', icon: Icons.check_circle_outline_rounded),
        ],
      ),
    ];

// ─── Page ─────────────────────────────────────────────────────────────────────

class DashboardPage extends StatefulWidget {
  final VoidCallback onToggleTheme;

  const DashboardPage({super.key, required this.onToggleTheme});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  static List<ReportItem>? _persistentReports;
  late List<ReportItem> _reports;

  @override
  void initState() {
    super.initState();
    _persistentReports ??= buildMockReports();
    _reports = _persistentReports!;
  }

  void _archiveReport(ReportItem report) {
    setState(() => _reports.remove(report));
  }

  void _deleteReport(ReportItem report) {
    setState(() => _reports.remove(report));
  }

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
                    _DashAppBar(isDark: isDark, onToggleTheme: widget.onToggleTheme),
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
                              activeCount: _reports.where((r) => r.status != ReportStatus.resolved).length,
                              resolvedCount: _reports.where((r) => r.status == ReportStatus.resolved).length,
                            ),
                            const SizedBox(height: 28),
                            _SectionHeader(
                              isDark: isDark,
                              onNewReport: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ConfidentialChoicePage(
                                    onToggleTheme: widget.onToggleTheme,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            ..._reports.map(
                              (r) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ReportCard(
                                  isDark: isDark,
                                  report: r,
                                  onToggleTheme: widget.onToggleTheme,
                                  onArchive: () => _archiveReport(r),
                                  onDelete: () => _deleteReport(r),
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

  const _StatCard({required this.value, required this.label, required this.isFilled, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final bg = isFilled
        ? AppColors.primary
        : (isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard);
    final valueColor =
        isFilled ? Colors.white : (isDark ? Colors.white : AppColors.lightTextPrimary);
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
          color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isDark ? null : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(Icons.self_improvement_rounded, color: AppColors.primary, size: 32),
            const SizedBox(height: 8),
            Text('Respirer', style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary)),
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

  const _SectionHeader({required this.isDark, required this.onNewReport});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'MES SIGNALEMENTS',
          style: GoogleFonts.manrope(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white.withValues(alpha: 0.45) : AppColors.lightTextSecondary,
            letterSpacing: 1.2,
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: onNewReport,
          child: Text('+ Nouveau', style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
        ),
      ],
    );
  }
}

// ─── Carte signalement ────────────────────────────────────────────────────────

class _ReportCard extends StatefulWidget {
  final bool isDark;
  final ReportItem report;
  final VoidCallback onToggleTheme;
  final VoidCallback onArchive;
  final VoidCallback onDelete;

  const _ReportCard({
    required this.isDark,
    required this.report,
    required this.onToggleTheme,
    required this.onArchive,
    required this.onDelete,
  });

  @override
  State<_ReportCard> createState() => _ReportCardState();
}

class _ReportCardState extends State<_ReportCard> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

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
  void initState() {
    super.initState();
    _updateRemaining();
    if (_remaining.inSeconds > 0) {
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        _updateRemaining();
        if (_remaining.inSeconds <= 0) _timer?.cancel();
      });
    }
  }

  void _updateRemaining() {
    final elapsed = DateTime.now().difference(widget.report.submittedAt);
    final r = const Duration(minutes: 5) - elapsed;
    setState(() => _remaining = r.isNegative ? Duration.zero : r);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _countdownLabel {
    final m = _remaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = _remaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  bool get _canDelete => _remaining.inSeconds > 0;

  void _showOptions(BuildContext context) {
    final isDark = widget.isDark;
    final canArchive = widget.report.status == ReportStatus.resolved;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return Container(
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
              _SheetOption(
                isDark: isDark,
                icon: Icons.open_in_new_rounded,
                label: 'Voir le détail',
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ReportDetailPage(
                      report: widget.report,
                      onToggleTheme: widget.onToggleTheme,
                      onDelete: widget.onDelete,
                    ),
                  ));
                },
              ),
              Divider(
                height: 1,
                indent: 20,
                endIndent: 20,
                color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.06),
              ),
              _SheetOption(
                isDark: isDark,
                icon: Icons.archive_outlined,
                label: 'Archiver',
                enabled: canArchive,
                onTap: canArchive
                    ? () {
                        Navigator.of(context).pop();
                        widget.onArchive();
                      }
                    : null,
                subtitle: canArchive ? null : 'Disponible uniquement si résolu',
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final color = _colors[widget.report.priority]!;
    final badge = _badges[widget.report.priority]!;
    final isDark = widget.isDark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
        borderRadius: BorderRadius.circular(24),
        border: isDark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
        boxShadow: isDark ? null : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
                        // Badge numéro de dossier
                        isDark
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: BackdropFilter(
                                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(8)),
                                    child: Text(widget.report.caseNumber, style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.70))),
                                  ),
                                ),
                              )
                            : Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: AppColors.warmWhite, borderRadius: BorderRadius.circular(8)),
                                child: Text(widget.report.caseNumber, style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.lightTextSecondary)),
                              ),
                        const SizedBox(width: 8),
                        // Badge priorité
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
                        // Badge countdown
                        if (_canDelete) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE53935).withValues(alpha: isDark ? 0.20 : 0.10),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.timer_outlined, size: 10, color: const Color(0xFFE53935).withValues(alpha: 0.85)),
                                const SizedBox(width: 3),
                                Text(_countdownLabel, style: GoogleFonts.manrope(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFFE53935).withValues(alpha: 0.85))),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.report.title,
                      style: GoogleFonts.manrope(fontSize: 15, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.lightTextPrimary, letterSpacing: -0.4, height: 1.2),
                    ),
                    const SizedBox(height: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        widget.report.anonLabel,
                        style: GoogleFonts.manrope(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Déposé le ${widget.report.date} · Responsable : ${widget.report.counselor}',
                      style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.45) : AppColors.lightTextSecondary),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => _showOptions(context),
                child: Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Icon(Icons.more_horiz_rounded, color: isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _ProgressTracker(isDark: isDark, status: widget.report.status, activeColor: color),
        ],
      ),
    );
  }
}

// ─── Option bottom sheet ──────────────────────────────────────────────────────

class _SheetOption extends StatelessWidget {
  final bool isDark;
  final IconData icon;
  final String label;
  final String? subtitle;
  final bool enabled;
  final VoidCallback? onTap;

  const _SheetOption({
    required this.isDark,
    required this.icon,
    required this.label,
    this.subtitle,
    this.enabled = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = enabled
        ? (isDark ? Colors.white : AppColors.lightTextPrimary)
        : (isDark ? Colors.white.withValues(alpha: 0.30) : Colors.black.withValues(alpha: 0.25));
    final iconColor = enabled
        ? AppColors.primary
        : (isDark ? Colors.white.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.20));

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: GoogleFonts.manrope(fontSize: 15, fontWeight: FontWeight.w600, color: textColor)),
                  if (subtitle != null)
                    Text(subtitle!, style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary)),
                ],
              ),
            ),
          ],
        ),
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
    final active = activeColor;
    final inactive = isDark ? Colors.white.withValues(alpha: 0.15) : Colors.black.withValues(alpha: 0.12);

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
                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                color: isCurrent ? active : (isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary.withValues(alpha: 0.70)),
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
      decoration: BoxDecoration(color: filled ? active : inactive, shape: BoxShape.circle),
    );
  }

  Widget _line(bool filled, Color active, Color inactive) {
    return Container(height: 2, decoration: BoxDecoration(color: filled ? active : inactive, borderRadius: BorderRadius.circular(1)));
  }
}
