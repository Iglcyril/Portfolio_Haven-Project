import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../dashboard/dashboard_page.dart';
import '../dashboard/report_detail_page.dart';

// ─── Modèles ──────────────────────────────────────────────────────────────────

class _TeamMember {
  final String firstName;
  final String lastName;
  final String role;
  const _TeamMember(this.firstName, this.lastName, this.role);
  String get fullName => '$firstName $lastName';
  String get initials =>
      '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'
          .toUpperCase();
}

class _ProReport {
  final String caseNumber;
  final DateTime submittedAt;
  final String initialText;
  final String anonLevel; // 'Anonyme' | 'Semi-anonyme' | 'Identité visible'
  final String? studentClass;
  final String? studentName;
  String? riskLevel; // null | 'Faible' | 'Moyen' | 'Élevé'
  bool isAssigned = false;
  String? assignedTo;
  bool isResolved = false;

  _ProReport({
    required this.caseNumber,
    required this.submittedAt,
    required this.initialText,
    required this.anonLevel,
    this.studentClass,
    this.studentName,
  });

  ReportItem toReportItem() => ReportItem(
        caseNumber: caseNumber,
        priority: riskLevel == 'Élevé'
            ? ReportPriority.high
            : riskLevel == 'Moyen'
                ? ReportPriority.medium
                : ReportPriority.low,
        title: 'Signalement anonyme',
        date: _fmtDate(submittedAt),
        counselor: assignedTo ?? 'Non attribué',
        status: isResolved ? ReportStatus.resolved : ReportStatus.filed,
        initialText: initialText,
        submittedAt: submittedAt,
        anonLabel: anonLevel,
        studentClass: studentClass,
        studentName: studentName,
        actions: [
          ReportAction(
            date: submittedAt,
            actor: 'Système',
            description: 'Signalement déposé et enregistré dans Haven.',
            icon: Icons.inbox_rounded,
          ),
        ],
      );

  static String _fmtDate(DateTime dt) {
    const m = [
      'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
      'juil.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.'
    ];
    return '${dt.day} ${m[dt.month - 1]}';
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

List<_ProReport> _buildMockProReports() => [
      _ProReport(
        caseNumber: '#HV-9102',
        submittedAt: DateTime.now().subtract(const Duration(hours: 1)),
        initialText:
            'Moqueries répétées signalées dans une classe de 4ème. Plusieurs élèves semblent impliqués dans des comportements d\'exclusion quotidiens.',
        anonLevel: 'Anonyme',
      ),
      _ProReport(
        caseNumber: '#HV-9098',
        submittedAt: DateTime.now().subtract(const Duration(hours: 5)),
        initialText:
            'Comportement d\'intimidation dans les couloirs. L\'élève concerné refuse de s\'alimenter à la cantine depuis plusieurs jours.',
        anonLevel: 'Semi-anonyme',
        studentClass: '4ème A',
      ),
      _ProReport(
        caseNumber: '#HV-9091',
        submittedAt: DateTime.now().subtract(const Duration(days: 1)),
        initialText:
            'Cyberharcèlement via Instagram entre plusieurs élèves de 3ème B. Des captures d\'écran ont été jointes au dossier.',
        anonLevel: 'Identité visible',
        studentName: 'Lucie Fontaine',
        studentClass: '3ème B',
      ),
      _ProReport(
        caseNumber: '#HV-9088',
        submittedAt: DateTime.now().subtract(const Duration(days: 2)),
        initialText:
            'Violences verbales quotidiennes signalées par un élève de 6ème de la part d\'un groupe de camarades.',
        anonLevel: 'Anonyme',
      ),
    ];

// ─── Page ─────────────────────────────────────────────────────────────────────

class ProfessionalDashboardPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isManager;
  final String? currentUserName;

  const ProfessionalDashboardPage({
    super.key,
    required this.onToggleTheme,
    required this.isManager,
    this.currentUserName,
  });

  @override
  State<ProfessionalDashboardPage> createState() =>
      _ProfessionalDashboardPageState();
}

class _ProfessionalDashboardPageState
    extends State<ProfessionalDashboardPage> {
  static List<_ProReport>? _persistentReports;
  static final List<_ProReport> _archivedReports = [];
  late List<_ProReport> _reports;

  static const _teamMembers = [
    _TeamMember('Sophie', 'Martin', 'CPE'),
    _TeamMember('Jean', 'Dupont', 'Infirmier·ère'),
    _TeamMember('Marie', 'Leblanc', 'AED'),
    _TeamMember('Pierre', 'Bernard', 'Professeur·e'),
    _TeamMember('Claire', 'Rousseau', 'Assistant·e Social·e'),
  ];

  static const _riskColors = {
    'Faible': Color(0xFF2EAB7B),
    'Moyen': Color(0xFFE67E22),
    'Élevé': Color(0xFFC0392B),
  };

  List<_ProReport> get _unassigned =>
      _reports.where((r) => !r.isAssigned).toList();

  @override
  void initState() {
    super.initState();
    _persistentReports ??= _buildMockProReports();
    _reports = _persistentReports!;
  }

  // ── Bottom sheet : actions ────────────────────────────────────────────────

  void _showActionsSheet(
      BuildContext ctx, _ProReport report, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) {
        return _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                report.caseNumber,
                style: GoogleFonts.fraunces(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 16),
              _SheetTile(
                icon: Icons.open_in_new_rounded,
                label: 'Voir le détail',
                isDark: isDark,
                onTap: () {
                  Navigator.pop(sheetCtx);
                  Navigator.of(ctx).push(MaterialPageRoute(
                    builder: (_) => ReportDetailPage(
                      report: report.toReportItem(),
                      onToggleTheme: widget.onToggleTheme,
                      onDelete: () {},
                      canAddInfo: false,
                      canDelete: false,
                      isManager: widget.isManager,
                      teamMembers: _teamMembers
                          .map((m) => ProMember(name: m.fullName, role: m.role, initials: m.initials))
                          .toList(),
                      initialRiskLevel: report.riskLevel,
                      initialAssignedTo: report.assignedTo,
                      onRiskLevelChanged: (level) {
                        report.riskLevel = level;
                        setState(() {});
                      },
                      onAssigned: (name) {
                        setState(() {
                          report.isAssigned = true;
                          report.assignedTo = name;
                        });
                      },
                    ),
                  ));
                },
              ),
              if (widget.isManager) ...[
                const SizedBox(height: 8),
                _SheetTile(
                  icon: Icons.person_add_outlined,
                  label: 'Attribuer à…',
                  isDark: isDark,
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    _showAssignSheet(ctx, report, isDark);
                  },
                ),
                const SizedBox(height: 8),
                _SheetTile(
                  icon: Icons.flag_outlined,
                  label: 'Définir le niveau de risque',
                  isDark: isDark,
                  onTap: () {
                    Navigator.pop(sheetCtx);
                    _showRiskSheet(ctx, report, isDark);
                  },
                ),
              ],
              const SizedBox(height: 12),
              Divider(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.10)
                    : Colors.black.withValues(alpha: 0.08),
              ),
              const SizedBox(height: 4),
              _SheetTile(
                icon: Icons.archive_outlined,
                label: 'Archiver le signalement',
                isDark: isDark,
                disabled: !report.isResolved,
                onTap: report.isResolved
                    ? () {
                        Navigator.pop(sheetCtx);
                        _showArchiveSheet(ctx, report, isDark);
                      }
                    : null,
              ),
            ],
          ),
        );
      },
    );
  }

  // ── Bottom sheet : attribution ────────────────────────────────────────────

  void _showAssignSheet(
      BuildContext ctx, _ProReport report, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) {
        return _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Attribuer à…',
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Choisissez un membre de l\'équipe',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.50)
                      : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 20),
              ..._teamMembers.map((member) {
                final isSelected = report.assignedTo == member.fullName;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        report.isAssigned = true;
                        report.assignedTo = member.fullName;
                      });
                      Navigator.pop(sheetCtx);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary.withValues(alpha: 0.10)
                            : (isDark
                                ? Colors.white.withValues(alpha: 0.07)
                                : AppColors.lightCard),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : (isDark
                                  ? Colors.white.withValues(alpha: 0.10)
                                  : Colors.transparent),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.primary.withValues(alpha: 0.35)
                                  : AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                member.initials,
                                style: GoogleFonts.manrope(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  member.fullName,
                                  style: GoogleFonts.manrope(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.90)
                                        : AppColors.lightTextPrimary,
                                  ),
                                ),
                                Text(
                                  member.role,
                                  style: GoogleFonts.manrope(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(Icons.check_circle_rounded,
                                color: AppColors.primary, size: 18),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  // ── Bottom sheet : niveau de risque ──────────────────────────────────────

  void _showRiskSheet(
      BuildContext ctx, _ProReport report, bool isDark) {
    const levels = ['Faible', 'Moyen', 'Élevé'];
    const levelIcons = [
      Icons.check_circle_outline_rounded,
      Icons.warning_amber_rounded,
      Icons.dangerous_outlined,
    ];
    const descriptions = [
      'Situation à surveiller, sans urgence immédiate.',
      'Situation préoccupante nécessitant un suivi actif.',
      'Situation grave nécessitant une action immédiate.',
    ];

    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) {
        return _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Niveau de risque',
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Évaluez la gravité du signalement',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.50)
                      : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 20),
              ...List.generate(levels.length, (i) {
                final level = levels[i];
                final color = _riskColors[level]!;
                final isSelected = report.riskLevel == level;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GestureDetector(
                    onTap: () {
                      report.riskLevel = level;
                      Navigator.pop(sheetCtx);
                      setState(() {});
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? color.withValues(alpha: isDark ? 0.18 : 0.08)
                            : (isDark
                                ? Colors.white.withValues(alpha: 0.07)
                                : AppColors.lightCard),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isSelected
                              ? color
                              : (isDark
                                  ? Colors.white.withValues(alpha: 0.10)
                                  : Colors.transparent),
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: color.withValues(
                                  alpha: isSelected ? 0.20 : 0.10),
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child:
                                Icon(levelIcons[i], color: color, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  level,
                                  style: GoogleFonts.fraunces(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: isDark
                                        ? Colors.white
                                        : AppColors.lightTextPrimary,
                                    letterSpacing: -0.1,
                                  ),
                                ),
                                Text(
                                  descriptions[i],
                                  style: GoogleFonts.manrope(
                                    fontSize: 11,
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.50)
                                        : AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            Icon(Icons.check_rounded, color: color, size: 18),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  // ── Bottom sheet : archivage ──────────────────────────────────────────────

  void _showArchiveSheet(
      BuildContext ctx, _ProReport report, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) {
        return _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Archiver ce signalement ?',
                style: GoogleFonts.fraunces(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Le signalement sera retiré de votre tableau de bord. Les données restent conservées dans le système.',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  height: 1.55,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.55)
                      : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () {
                  setState(() {
                    _reports.remove(report);
                    _archivedReports.add(report);
                  });
                  Navigator.pop(sheetCtx);
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Confirmer l\'archivage',
                      style: GoogleFonts.manrope(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () => Navigator.pop(sheetCtx),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      'Annuler',
                      style: GoogleFonts.manrope(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.50)
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ── Bottom sheet : liste des archivés ────────────────────────────────────

  void _showArchivedSheet(BuildContext ctx, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) {
        return _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Signalements archivés',
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _archivedReports.isEmpty
                    ? 'Aucun signalement archivé pour le moment'
                    : '${_archivedReports.length} signalement${_archivedReports.length > 1 ? 's' : ''} résolu${_archivedReports.length > 1 ? 's' : ''} et archivé${_archivedReports.length > 1 ? 's' : ''}',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.50)
                      : AppColors.lightTextSecondary,
                ),
              ),
              if (_archivedReports.isNotEmpty) ...[
              const SizedBox(height: 20),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(ctx).size.height * 0.45,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    children: _archivedReports.map((report) {
                      final riskColor = _riskColors[report.riskLevel];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.07)
                                : const Color(0xFFF5F5F5),
                            borderRadius: BorderRadius.circular(18),
                            border: isDark
                                ? Border.all(color: Colors.white.withValues(alpha: 0.08))
                                : null,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.12)
                                          : Colors.black.withValues(alpha: 0.06),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      report.caseNumber,
                                      style: GoogleFonts.manrope(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: isDark
                                            ? Colors.white.withValues(alpha: 0.80)
                                            : AppColors.lightTextSecondary,
                                      ),
                                    ),
                                  ),
                                  if (riskColor != null) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: riskColor.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        report.riskLevel!,
                                        style: GoogleFonts.manrope(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: riskColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                  const Spacer(),
                                  Text(
                                    _ProReportCard._timeAgo(report.submittedAt),
                                    style: GoogleFonts.manrope(
                                      fontSize: 11,
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.35)
                                          : AppColors.lightTextSecondary.withValues(alpha: 0.70),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                report.initialText,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.manrope(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  height: 1.5,
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.55)
                                      : AppColors.lightTextPrimary.withValues(alpha: 0.70),
                                ),
                              ),
                              if (report.assignedTo != null) ...[
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Icon(Icons.person_outline_rounded, size: 12,
                                        color: isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary),
                                    const SizedBox(width: 4),
                                    Text(
                                      report.assignedTo!,
                                      style: GoogleFonts.manrope(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: isDark
                                            ? Colors.white.withValues(alpha: 0.40)
                                            : AppColors.lightTextSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              ],
            ],
          ),
        );
      },
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final unassigned = _unassigned;

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
                    // ── App bar (theme toggle uniquement) ─────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: widget.onToggleTheme,
                          child: ClipOval(
                            child: BackdropFilter(
                              filter:
                                  ImageFilter.blur(sigmaX: 16, sigmaY: 16),
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
                      ),
                    ),

                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 20),

                            // ── Greeting ──────────────────────────────────
                            Text(
                              'Bienvenue sur le',
                              style: GoogleFonts.fraunces(
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.lightTextPrimary,
                                letterSpacing: -0.5,
                                height: 1.1,
                              ),
                            ),
                            Text(
                              'portail de pilotage.',
                              style: GoogleFonts.fraunces(
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                                letterSpacing: -0.5,
                                height: 1.15,
                              ),
                            ),

                            const SizedBox(height: 28),

                            // ── Stats ─────────────────────────────────────
                            IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment:
                                    CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: _StatCard(
                                      value: '${_reports.where((r) => r.isAssigned).length}',
                                      label: 'Actifs',
                                      icon: Icons.folder_open_outlined,
                                      isDark: isDark,
                                      isFilled: true,
                                      onTap: () => Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => _ActiveReportsPage(
                                            reports: _reports,
                                            isManager: widget.isManager,
                                            currentUserName: widget.currentUserName,
                                            teamMembers: _teamMembers
                                                .map((m) => ProMember(name: m.fullName, role: m.role, initials: m.initials))
                                                .toList(),
                                            onToggleTheme: widget.onToggleTheme,
                                            onChanged: () => setState(() {}),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _StatCard(
                                      value: '${unassigned.length}',
                                      label: 'Non attribués',
                                      icon: Icons.inbox_outlined,
                                      isDark: isDark,
                                      highlight: unassigned.isNotEmpty,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _StatCard(
                                      value: '${_archivedReports.length}',
                                      label: 'Archivés',
                                      icon: Icons.archive_outlined,
                                      isDark: isDark,
                                      onTap: () => _showArchivedSheet(context, isDark),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 32),

                            // ── Section label ─────────────────────────────
                            Row(
                              children: [
                                Text(
                                  'SIGNALEMENTS NON ATTRIBUÉS',
                                  style: GoogleFonts.manrope(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.9,
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.45)
                                        : AppColors.lightTextSecondary
                                            .withValues(alpha: 0.70),
                                  ),
                                ),
                                if (unassigned.isNotEmpty) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary
                                          .withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '${unassigned.length}',
                                      style: GoogleFonts.manrope(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),

                            const SizedBox(height: 12),

                            // ── Liste des signalements ────────────────────
                            if (unassigned.isEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 32),
                                child: Center(
                                  child: Text(
                                    'Aucun signalement en attente d\'attribution.',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.manrope(
                                      fontSize: 14,
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.38)
                                          : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                ),
                              )
                            else
                              ...unassigned.map((report) => Padding(
                                    padding:
                                        const EdgeInsets.only(bottom: 12),
                                    child: _ProReportCard(
                                      report: report,
                                      isDark: isDark,
                                      onThreeDots: () => _showActionsSheet(
                                          context, report, isDark),
                                    ),
                                  )),

                            const SizedBox(height: 32),
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

// ─── Carte de stat ────────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final bool isDark;
  final bool isFilled;
  final bool highlight;
  final VoidCallback? onTap;

  const _StatCard({
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
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.30),
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
            child: Icon(icon,
                size: 17,
                color: highlight
                    ? AppColors.primary
                    : AppColors.primary.withValues(alpha: 0.75)),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: GoogleFonts.fraunces(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : AppColors.lightTextPrimary,
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


class _ProReportCard extends StatelessWidget {
  final _ProReport report;
  final bool isDark;
  final VoidCallback onThreeDots;

  const _ProReportCard({
    required this.report,
    required this.isDark,
    required this.onThreeDots,
  });

  static String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return 'il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'il y a ${diff.inHours} h';
    return 'il y a ${diff.inDays} j';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
          // ── En-tête : badges + trois points ────────────────────────────
          Row(
            children: [
              // Badge numéro de dossier
              _CaseNumberBadge(
                  caseNumber: report.caseNumber, isDark: isDark),
              const SizedBox(width: 8),
              // Badge niveau de risque
              _RiskBadge(riskLevel: report.riskLevel, isDark: isDark),
              const Spacer(),
              // Horodatage
              Text(
                _timeAgo(report.submittedAt),
                style: GoogleFonts.manrope(
                  fontSize: 11,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.35)
                      : AppColors.lightTextSecondary.withValues(alpha: 0.70),
                ),
              ),
              const SizedBox(width: 4),
              // Trois points
              GestureDetector(
                onTap: onThreeDots,
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.black.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.more_horiz_rounded,
                    size: 17,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.60)
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // ── Badge anonymat ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.08),
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

          const SizedBox(height: 10),

          // ── Texte du signalement ────────────────────────────────────────
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

          // ── Barre de progression (figée à "Déposé") ─────────────────────
          _MiniProgressBar(isDark: isDark, riskLevel: report.riskLevel),
        ],
      ),
    );
  }
}

// ─── Badge numéro de dossier ──────────────────────────────────────────────────

class _CaseNumberBadge extends StatelessWidget {
  final String caseNumber;
  final bool isDark;

  const _CaseNumberBadge({required this.caseNumber, required this.isDark});

  @override
  Widget build(BuildContext context) {
    if (isDark) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              caseNumber,
              style: GoogleFonts.manrope(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Colors.white.withValues(alpha: 0.85),
                letterSpacing: 0.3,
              ),
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
        caseNumber,
        style: GoogleFonts.manrope(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.lightTextSecondary,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

// ─── Badge de risque ──────────────────────────────────────────────────────────

class _RiskBadge extends StatelessWidget {
  final String? riskLevel;
  final bool isDark;

  const _RiskBadge({required this.riskLevel, required this.isDark});

  static const _colors = {
    'Faible': Color(0xFF2EAB7B),
    'Moyen': Color(0xFFE67E22),
    'Élevé': Color(0xFFC0392B),
  };

  @override
  Widget build(BuildContext context) {
    if (riskLevel == null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
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
                : AppColors.lightTextSecondary.withValues(alpha: 0.70),
          ),
        ),
      );
    }
    final color = _colors[riskLevel]!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        riskLevel!,
        style: GoogleFonts.manrope(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

// ─── Barre de progression mini ────────────────────────────────────────────────

class _MiniProgressBar extends StatelessWidget {
  final bool isDark;
  final String? riskLevel;

  const _MiniProgressBar({required this.isDark, this.riskLevel});

  static const _steps = ['Déposé', 'Analysé', 'En cours', 'Résolu'];

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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Dots + connecteurs ─────────────────────────────────────────────
        Row(
          children: List.generate(_steps.length * 2 - 1, (i) {
            if (i.isOdd) {
              final filled = i < 1;
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
            final isActive = step == 0;
            return Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive
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
        // ── Labels ────────────────────────────────────────────────────────
        Row(
          children: List.generate(_steps.length * 2 - 1, (i) {
            if (i.isOdd) return const Expanded(child: SizedBox());
            final step = i ~/ 2;
            final isActive = step == 0;
            return Text(
              _steps[step],
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

// ─── Tile de bottom sheet ─────────────────────────────────────────────────────

class _SheetTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDark;
  final bool disabled;
  final VoidCallback? onTap;

  const _SheetTile({
    required this.icon,
    required this.label,
    required this.isDark,
    this.disabled = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = disabled
        ? (isDark
            ? Colors.white.withValues(alpha: 0.22)
            : AppColors.lightTextSecondary.withValues(alpha: 0.40))
        : (isDark ? Colors.white.withValues(alpha: 0.90) : AppColors.lightTextPrimary);

    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.black.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 12),
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Wrapper bottom sheet ─────────────────────────────────────────────────────

class _BottomSheetWrapper extends StatelessWidget {
  final bool isDark;
  final Widget child;

  const _BottomSheetWrapper({required this.isDark, required this.child});

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

// ─── Page signalements actifs ──────────────────────────────────────────────────

class _ActiveReportsPage extends StatefulWidget {
  final List<_ProReport> reports;
  final bool isManager;
  final String? currentUserName;
  final List<ProMember> teamMembers;
  final VoidCallback onToggleTheme;
  final VoidCallback onChanged;

  const _ActiveReportsPage({
    required this.reports,
    required this.isManager,
    this.currentUserName,
    required this.teamMembers,
    required this.onToggleTheme,
    required this.onChanged,
  });

  @override
  State<_ActiveReportsPage> createState() => _ActiveReportsPageState();
}

class _ActiveReportsPageState extends State<_ActiveReportsPage> {
  Widget _sheetTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required bool isDark,
    Color? color,
  }) {
    final c = color ?? (isDark ? Colors.white : AppColors.lightTextPrimary);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: c),
            const SizedBox(width: 12),
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: c,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showThreeDotsSheet(BuildContext ctx, _ProReport report, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (_, setSheetState) => _BottomSheetWrapper(
          isDark: isDark,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                report.caseNumber,
                style: GoogleFonts.fraunces(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.lightTextPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 20),
              _sheetTile(
                icon: Icons.open_in_new_rounded,
                label: 'Voir le détail',
                isDark: isDark,
                onTap: () {
                  Navigator.pop(sheetCtx);
                  Navigator.push(
                    ctx,
                    MaterialPageRoute(
                      builder: (_) => ReportDetailPage(
                        report: report.toReportItem(),
                        onToggleTheme: widget.onToggleTheme,
                        onDelete: () {},
                        canAddInfo: false,
                        canDelete: false,
                        isManager: widget.isManager,
                        teamMembers: widget.teamMembers,
                        initialRiskLevel: report.riskLevel,
                        initialAssignedTo: report.assignedTo,
                        onRiskLevelChanged: (level) {
                          report.riskLevel = level;
                          setState(() {});
                          widget.onChanged();
                        },
                        onAssigned: (name) {
                          setState(() {
                            report.isAssigned = true;
                            report.assignedTo = name;
                          });
                          widget.onChanged();
                        },
                      ),
                    ),
                  );
                },
              ),
              if (!report.isResolved &&
                  widget.currentUserName != null &&
                  report.assignedTo == widget.currentUserName) ...[
                const SizedBox(height: 10),
                _sheetTile(
                  icon: Icons.check_circle_outline_rounded,
                  label: 'Marquer comme résolu',
                  isDark: isDark,
                  color: const Color(0xFF2EAB7B),
                  onTap: () {
                    setSheetState(() => report.isResolved = true);
                    setState(() {});
                    widget.onChanged();
                  },
                ),
              ],
              const SizedBox(height: 10),
              Opacity(
                opacity: report.isResolved ? 1.0 : 0.35,
                child: _sheetTile(
                  icon: Icons.archive_outlined,
                  label: 'Archiver le signalement',
                  isDark: isDark,
                  onTap: report.isResolved
                      ? () {
                          widget.reports.remove(report);
                          _ProfessionalDashboardPageState._archivedReports.add(report);
                          Navigator.pop(sheetCtx);
                          setState(() {});
                          widget.onChanged();
                        }
                      : () {},
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final active = widget.reports.where((r) => r.isAssigned).toList();

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_rounded,
            color: isDark ? Colors.white : AppColors.lightTextPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Signalements actifs',
          style: GoogleFonts.fraunces(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.lightTextPrimary,
            letterSpacing: -0.3,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${active.length}',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
      body: active.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.folder_open_outlined,
                    size: 52,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.15)
                        : AppColors.lightTextSecondary.withValues(alpha: 0.30),
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
                    'Les signalements attribués apparaîtront ici',
                    style: GoogleFonts.manrope(
                      fontSize: 12,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.20)
                          : AppColors.lightTextSecondary.withValues(alpha: 0.60),
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
              itemCount: active.length,
              itemBuilder: (ctx, i) {
                final report = active[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ReportDetailPage(
                          report: report.toReportItem(),
                          onToggleTheme: widget.onToggleTheme,
                          onDelete: () {},
                          canAddInfo: false,
                          canDelete: false,
                          isManager: widget.isManager,
                          teamMembers: widget.teamMembers,
                          initialRiskLevel: report.riskLevel,
                          initialAssignedTo: report.assignedTo,
                          onRiskLevelChanged: (level) {
                            report.riskLevel = level;
                            setState(() {});
                            widget.onChanged();
                          },
                          onAssigned: (name) {
                            setState(() {
                              report.isAssigned = true;
                              report.assignedTo = name;
                            });
                            widget.onChanged();
                          },
                        ),
                      ),
                    ),
                    child: _ProReportCard(
                      report: report,
                      isDark: isDark,
                      onThreeDots: () =>
                          _showThreeDotsSheet(context, report, isDark),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
