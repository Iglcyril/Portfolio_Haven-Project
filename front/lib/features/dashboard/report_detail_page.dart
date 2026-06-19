import 'dart:async';
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/data/report_store.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_constants.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/circle_back_button.dart';
import '../../core/widgets/glass_circle_button.dart';
import 'dashboard_page.dart';

class ReportDetailPage extends StatefulWidget {
  final ReportItem report;
  final VoidCallback onToggleTheme;
  final VoidCallback onDelete;
  final bool canAddInfo;
  final bool canDelete;
  final bool isManager;
  final List<ProMember> teamMembers;
  final String? initialRiskLevel;
  final String? initialAssignedTo;
  final void Function(String level)? onRiskLevelChanged;
  final void Function(String name)? onAssigned;
  final HavenReport? havenReport;

  const ReportDetailPage({
    super.key,
    required this.report,
    required this.onToggleTheme,
    required this.onDelete,
    this.canAddInfo = true,
    this.canDelete = true,
    this.isManager = false,
    this.teamMembers = const [],
    this.initialRiskLevel,
    this.initialAssignedTo,
    this.onRiskLevelChanged,
    this.onAssigned,
    this.havenReport,
  });

  @override
  State<ReportDetailPage> createState() => _ReportDetailPageState();
}

class ProMember {
  final String name;
  final String role;
  final String initials;
  const ProMember({required this.name, required this.role, required this.initials});
}

class _AddedInfo {
  final String text;
  final DateTime date;
  _AddedInfo({required this.text, required this.date});
}

class _ReportDetailPageState extends State<ReportDetailPage> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  bool _showAddInfo = false;
  final _addInfoController = TextEditingController();
  final List<_AddedInfo> _addedInfos = [];

  static const _riskColors = AppConstants.riskColors;

  String? _riskLevel;
  String? _assignedTo;

  static const Map<ReportStatus, String> _statusLabels = {
    ReportStatus.filed: 'DÉPOSÉ',
    ReportStatus.reviewed: 'EXAMINÉ',
    ReportStatus.inProgress: 'EN COURS',
    ReportStatus.resolved: 'RÉSOLU',
  };

  @override
  void initState() {
    super.initState();
    _riskLevel = widget.initialRiskLevel;
    _assignedTo = widget.initialAssignedTo;
    if (widget.havenReport != null) ReportStore.instance.addListener(_rebuild);
    _updateRemaining();
    if (_remaining.inSeconds > 0) {
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        _updateRemaining();
        if (_remaining.inSeconds <= 0) _timer?.cancel();
      });
    }
  }

  void _rebuild() => setState(() {});

  void _updateRemaining() {
    final elapsed = DateTime.now().difference(widget.report.submittedAt);
    final r = const Duration(minutes: 5) - elapsed;
    setState(() => _remaining = r.isNegative ? Duration.zero : r);
  }

  @override
  void dispose() {
    if (widget.havenReport != null) ReportStore.instance.removeListener(_rebuild);
    _timer?.cancel();
    _addInfoController.dispose();
    super.dispose();
  }

  String get _countdownLabel {
    final m = _remaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = _remaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  bool get _canDelete => _remaining.inSeconds > 0;

  void _submitInfo() {
    final text = _addInfoController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _addedInfos.add(_AddedInfo(text: text, date: DateTime.now()));
      _showAddInfo = false;
      _addInfoController.clear();
    });
  }

  void _showAssignSheet(BuildContext ctx, bool isDark) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A3832) : Colors.white,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.20) : Colors.black.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Attribuer à…',
                    style: AppTextStyles.sheetTitle(isDark),
                  ),
                  const SizedBox(height: 16),
                  ...widget.teamMembers.map((member) {
                    final isSelected = _assignedTo == member.name;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: GestureDetector(
                        onTap: () {
                          _assignedTo = member.name;
                          Navigator.pop(sheetCtx);
                          setState(() {});
                          widget.onAssigned?.call(member.name);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary.withValues(alpha: 0.10) : (isDark ? Colors.white.withValues(alpha: 0.07) : const Color(0xFFF5F5F5)),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? AppColors.primary : (isDark ? Colors.white.withValues(alpha: 0.10) : Colors.transparent)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(color: isDark ? AppColors.primary.withValues(alpha: 0.35) : AppColors.primary, shape: BoxShape.circle),
                                child: Center(child: Text(member.initials, style: AppTextStyles.initials(fontSize: 13))),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(member.name, style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.90) : AppColors.lightTextPrimary)),
                                    Text(member.role, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.primary)),
                                  ],
                                ),
                              ),
                              if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 18),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRiskSheet(BuildContext ctx, bool isDark) {
    const levels = ['Faible', 'Moyen', 'Élevé'];
    const levelIcons = [Icons.check_circle_outline_rounded, Icons.warning_amber_rounded, Icons.dangerous_outlined];
    const descriptions = [
      'Situation à surveiller, sans urgence immédiate.',
      'Situation préoccupante nécessitant un suivi actif.',
      'Situation grave nécessitant une action immédiate.',
    ];

    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A3832) : Colors.white,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.20) : Colors.black.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Niveau de risque', style: AppTextStyles.sheetTitle(isDark)),
                  const SizedBox(height: 4),
                  Text('Évaluez la gravité du signalement', style: AppTextStyles.subtitle(isDark)),
                  const SizedBox(height: 20),
                  ...List.generate(levels.length, (i) {
                    final level = levels[i];
                    final color = _riskColors[level]!;
                    final isSelected = _riskLevel == level;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GestureDetector(
                        onTap: () {
                          _riskLevel = level;
                          Navigator.pop(sheetCtx);
                          setState(() {});
                          widget.onRiskLevelChanged?.call(level);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: isSelected ? color.withValues(alpha: isDark ? 0.18 : 0.08) : (isDark ? Colors.white.withValues(alpha: 0.07) : const Color(0xFFF5F5F5)),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: isSelected ? color : (isDark ? Colors.white.withValues(alpha: 0.10) : Colors.transparent), width: isSelected ? 1.5 : 1.0),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(color: color.withValues(alpha: isSelected ? 0.20 : 0.10), borderRadius: BorderRadius.circular(11)),
                                child: Icon(levelIcons[i], color: color, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(level, style: GoogleFonts.fraunces(fontSize: 16, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.lightTextPrimary, letterSpacing: -0.1)),
                                    Text(descriptions[i], style: GoogleFonts.manrope(fontSize: 11, color: isDark ? Colors.white.withValues(alpha: 0.50) : AppColors.lightTextSecondary)),
                                  ],
                                ),
                              ),
                              if (isSelected) Icon(Icons.check_rounded, color: color, size: 18),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, bool isDark) {
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
                  color: const Color(0xFFE53935).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFE53935), size: 24),
              ),
              const SizedBox(height: 16),
              Text(
                'Supprimer le signalement ?',
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
                'Cette action est irréversible. Ton signalement sera définitivement supprimé.',
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
                  widget.onDelete();
                  Navigator.of(context).pop();
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE53935),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: const Color(0xFFE53935).withValues(alpha: 0.30), blurRadius: 12, offset: const Offset(0, 4))],
                  ),
                  child: Text(
                    'Oui, supprimer',
                    style: AppTextStyles.button(),
                    textAlign: TextAlign.center,
                  ),
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
                    style: GoogleFonts.manrope(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary,
                    ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    const Color _unratedColor = Color(0xFF9E9E9E);
    final Color color = widget.isManager
        ? (_riskLevel != null ? _riskColors[_riskLevel]! : _unratedColor)
        : ReportPriority.colors[widget.report.priority]!;
    final String priorityLabel = widget.isManager
        ? (_riskLevel?.toUpperCase() ?? 'NON ÉVALUÉ')
        : ReportPriority.labels[widget.report.priority]!;
    final statusLabel = _statusLabels[widget.report.status]!;

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
                    // App bar
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                      child: Row(
                        children: [
                          CircleBackButton(
                            isDark: isDark,
                            onTap: () => Navigator.of(context).pop(),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: widget.onToggleTheme,
                            child: GlassCircleButton(
                              isDark: isDark,
                              child: Icon(isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined, color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black, size: 20),
                            ),
                          ),
                        ],
                      ),
                    ),

                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 8),

                            // ── En-tête du dossier ────────────────────────
                            Row(
                              children: [
                                // Badge numéro dossier
                                isDark
                                    ? ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: BackdropFilter(
                                          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(8)),
                                            child: Text(widget.report.caseNumber, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.70))),
                                          ),
                                        ),
                                      )
                                    : Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(color: AppColors.lightCard, borderRadius: BorderRadius.circular(8), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6)]),
                                        child: Text(widget.report.caseNumber, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.lightTextSecondary)),
                                      ),
                                const SizedBox(width: 8),
                                // Badge priorité
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: color.withValues(alpha: isDark ? 0.20 : 0.12), borderRadius: BorderRadius.circular(8)),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                                      const SizedBox(width: 4),
                                      Text(priorityLabel, style: AppTextStyles.badge(color)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                // Badge statut
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(statusLabel, style: AppTextStyles.badge(isDark ? Colors.white.withValues(alpha: 0.60) : AppColors.lightTextSecondary)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Titre
                            Text(
                              widget.report.title,
                              style: AppTextStyles.pageTitle(isDark).copyWith(height: 1.15),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Responsable : ${widget.report.counselor}',
                              style: AppTextStyles.subtitle(isDark, fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(height: 20),

                            // Barre de progression
                            _DetailProgressTracker(
                              isDark: isDark,
                              status: widget.report.status,
                              activeColor: color,
                              overrideStep: widget.havenReport?.progressStage,
                            ),

                            const SizedBox(height: 28),

                            // ── Signalement initial ───────────────────────
                            _SectionLabel(isDark: isDark, label: 'SIGNALEMENT INITIAL'),
                            const SizedBox(height: 10),

                            Container(
                              decoration: BoxDecoration(
                                color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
                                borderRadius: BorderRadius.circular(20),
                                border: Border(left: BorderSide(color: color, width: 3)),
                                boxShadow: isDark ? null : AppShadows.cardLight,
                              ),
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Méta : date + anonymat
                                  Row(
                                    children: [
                                      Icon(Icons.access_time_rounded, size: 12, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Déposé le ${widget.report.date}',
                                        style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
                                      ),
                                      const SizedBox(width: 10),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(widget.report.anonLabel, style: GoogleFonts.manrope(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                      ),
                                    ],
                                  ),
                                  // Classe et/ou nom si anonymat partiel ou absent
                                  if (widget.report.studentClass != null || widget.report.studentName != null) ...[
                                    const SizedBox(height: 7),
                                    Row(
                                      children: [
                                        if (widget.report.studentName != null) ...[
                                          Icon(Icons.person_outline_rounded, size: 12, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
                                          const SizedBox(width: 4),
                                          Text(
                                            widget.report.studentName!,
                                            style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.70) : AppColors.lightTextPrimary),
                                          ),
                                          const SizedBox(width: 10),
                                        ],
                                        if (widget.report.studentClass != null) ...[
                                          Icon(Icons.school_outlined, size: 12, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
                                          const SizedBox(width: 4),
                                          Text(
                                            widget.report.studentClass!,
                                            style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                  const SizedBox(height: 10),
                                  // Texte du signalement
                                  Text(
                                    widget.report.initialText,
                                    style: GoogleFonts.manrope(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400,
                                      color: isDark ? Colors.white.withValues(alpha: 0.85) : AppColors.lightTextPrimary,
                                      height: 1.6,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // ── Informations ajoutées ─────────────────────
                            ..._addedInfos.map((info) => Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: _AddedInfoBubble(isDark: isDark, info: info),
                            )),

                            if (widget.canAddInfo) ...[
                              const SizedBox(height: 12),
                              if (!_showAddInfo)
                                GestureDetector(
                                  onTap: () => setState(() => _showAddInfo = true),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.add_circle_outline_rounded, size: 16, color: AppColors.primary),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Ajouter des informations',
                                        style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                                      ),
                                    ],
                                  ),
                                )
                              else
                                _AddInfoField(
                                  isDark: isDark,
                                  controller: _addInfoController,
                                  onSend: _submitInfo,
                                  onCancel: () => setState(() {
                                    _showAddInfo = false;
                                    _addInfoController.clear();
                                  }),
                                ),
                            ],

                            const SizedBox(height: 28),

                            // ── Gestion (manager uniquement) ──────────────
                            if (widget.isManager) ...[
                              _SectionLabel(isDark: isDark, label: 'GESTION'),
                              const SizedBox(height: 10),
                              // Tile attribution
                              GestureDetector(
                                onTap: () => _showAssignSheet(context, isDark),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
                                    borderRadius: BorderRadius.circular(18),
                                    border: isDark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
                                    boxShadow: isDark ? null : AppShadows.cardLight,
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10), borderRadius: BorderRadius.circular(10)),
                                        child: const Icon(Icons.person_add_outlined, color: AppColors.primary, size: 18),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text('Attribuer à', style: AppTextStyles.caption(isDark, fontWeight: FontWeight.w500)),
                                            Text(
                                              _assignedTo ?? 'Non attribué',
                                              style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: _assignedTo != null ? AppColors.primary : (isDark ? Colors.white.withValues(alpha: 0.70) : AppColors.lightTextPrimary)),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Icon(Icons.chevron_right_rounded, size: 18, color: isDark ? Colors.white.withValues(alpha: 0.30) : AppColors.lightTextSecondary),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              // Tile niveau de risque
                              GestureDetector(
                                onTap: () => _showRiskSheet(context, isDark),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
                                    borderRadius: BorderRadius.circular(18),
                                    border: isDark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
                                    boxShadow: isDark ? null : AppShadows.cardLight,
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: (_riskLevel != null ? _riskColors[_riskLevel]! : AppColors.primary).withValues(alpha: isDark ? 0.20 : 0.10),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(Icons.flag_outlined, color: _riskLevel != null ? _riskColors[_riskLevel]! : AppColors.primary, size: 18),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text('Niveau de risque', style: AppTextStyles.caption(isDark, fontWeight: FontWeight.w500)),
                                            Row(
                                              children: [
                                                if (_riskLevel != null) ...[
                                                  Container(width: 7, height: 7, decoration: BoxDecoration(color: _riskColors[_riskLevel]!, shape: BoxShape.circle)),
                                                  const SizedBox(width: 5),
                                                ],
                                                Text(
                                                  _riskLevel ?? 'Non évalué',
                                                  style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: _riskLevel != null ? _riskColors[_riskLevel]! : (isDark ? Colors.white.withValues(alpha: 0.70) : AppColors.lightTextPrimary)),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      Icon(Icons.chevron_right_rounded, size: 18, color: isDark ? Colors.white.withValues(alpha: 0.30) : AppColors.lightTextSecondary),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 28),
                            ],

                            // ── Historique ────────────────────────────────
                            _SectionLabel(isDark: isDark, label: 'HISTORIQUE'),
                            const SizedBox(height: 14),

                            _Timeline(
                              isDark: isDark,
                              color: color,
                              actions: [
                                ...widget.report.actions,
                                ..._addedInfos.map((info) {
                                  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
                                  final d = info.date;
                                  final label = '${d.day} ${months[d.month - 1]} à ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
                                  return ReportAction(
                                    date: d,
                                    actor: 'Alex',
                                    description: 'Précision ajoutée le $label.',
                                    icon: Icons.edit_note_rounded,
                                  );
                                }),
                                if (widget.havenReport != null)
                                  ...widget.havenReport!.events.map((e) => ReportAction(
                                    date: e.createdAt,
                                    actor: widget.havenReport!.assignedTo ?? 'Référent',
                                    description: e.comment != null
                                        ? '${e.type} — ${e.comment}'
                                        : e.type,
                                    icon: kEventIcons[e.type] ?? Icons.circle_outlined,
                                  )),
                              ]..sort((a, b) => a.date.compareTo(b.date)),
                            ),

                            const SizedBox(height: 28),

                            // ── Bouton suppression countdown ──────────────
                            if (widget.canDelete && _canDelete)
                              GestureDetector(
                                onTap: () => _confirmDelete(context, isDark),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE53935).withValues(alpha: isDark ? 0.15 : 0.08),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFE53935).withValues(alpha: 0.30)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.delete_outline_rounded, size: 18, color: const Color(0xFFE53935)),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Supprimer le signalement',
                                        style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFFE53935)),
                                      ),
                                      const Spacer(),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE53935).withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(_countdownLabel, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFFE53935))),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

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

// ─── Section label ────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final bool isDark;
  final String label;
  const _SectionLabel({required this.isDark, required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: AppTextStyles.sectionLabel(isDark),
    );
  }
}

// ─── Progress tracker (version détail, plus grand) ───────────────────────────

class _DetailProgressTracker extends StatelessWidget {
  final bool isDark;
  final ReportStatus status;
  final Color activeColor;
  final int? overrideStep;

  const _DetailProgressTracker({
    required this.isDark,
    required this.status,
    required this.activeColor,
    this.overrideStep,
  });

  static const List<String> _labels = ['REÇU', 'PRISE EN CHARGE', 'SUIVI EN COURS', 'RÉSOLU'];

  int get _ci {
    if (overrideStep != null) return overrideStep!;
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

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.06) : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        boxShadow: isDark ? null : AppShadows.cardLight,
      ),
      child: Column(
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
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(4, (i) {
              final isCurrent = i == ci;
              final isPast = i < ci;
              return Text(
                _labels[i],
                style: GoogleFonts.manrope(
                  fontSize: 9,
                  fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                  color: isCurrent
                      ? activeColor
                      : (isPast
                          ? activeColor.withValues(alpha: 0.60)
                          : (isDark ? Colors.white.withValues(alpha: 0.30) : AppColors.lightTextSecondary.withValues(alpha: 0.60))),
                  letterSpacing: 0.3,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _dot(int i, int ci, Color inactive) {
    final filled = i <= ci;
    final isCurrent = i == ci;
    return Container(
      width: isCurrent ? 12 : 8,
      height: isCurrent ? 12 : 8,
      decoration: BoxDecoration(
        color: filled ? activeColor : inactive,
        shape: BoxShape.circle,
        boxShadow: isCurrent ? [BoxShadow(color: activeColor.withValues(alpha: 0.40), blurRadius: 6)] : null,
      ),
    );
  }

  Widget _line(bool filled, Color inactive) {
    return Container(height: 2, decoration: BoxDecoration(color: filled ? activeColor : inactive, borderRadius: BorderRadius.circular(1)));
  }
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

class _Timeline extends StatelessWidget {
  final bool isDark;
  final List<ReportAction> actions;
  final Color color;

  const _Timeline({required this.isDark, required this.actions, required this.color});

  String _formatDate(DateTime d) {
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    final h = d.hour.toString().padLeft(2, '0');
    final m = d.minute.toString().padLeft(2, '0');
    return '${d.day} ${months[d.month - 1]} · $h:$m';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(actions.length, (i) {
        final action = actions[i];
        final isLast = i == actions.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Colonne gauche : dot + ligne
              SizedBox(
                width: 28,
                child: Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: isDark ? 0.20 : 0.10),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(action.icon, size: 13, color: color),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Center(
                          child: Container(
                            width: 1.5,
                            color: isDark ? Colors.white.withValues(alpha: 0.10) : Colors.black.withValues(alpha: 0.08),
                          ),
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
                            action.actor,
                            style: GoogleFonts.manrope(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? Colors.white.withValues(alpha: 0.85) : AppColors.lightTextPrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatDate(action.date),
                            style: GoogleFonts.manrope(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.white.withValues(alpha: 0.35) : AppColors.lightTextSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        action.description,
                        style: GoogleFonts.manrope(
                          fontSize: 13,
                          fontWeight: FontWeight.w400,
                          color: isDark ? Colors.white.withValues(alpha: 0.65) : AppColors.lightTextSecondary,
                          height: 1.5,
                        ),
                      ),
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
}

// ─── Champ ajout d'informations ───────────────────────────────────────────────

// ─── Bulle information ajoutée ────────────────────────────────────────────────

class _AddedInfoBubble extends StatelessWidget {
  final bool isDark;
  final _AddedInfo info;

  const _AddedInfoBubble({required this.isDark, required this.info});

  String _formatDate(DateTime d) {
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    final h = d.hour.toString().padLeft(2, '0');
    final m = d.minute.toString().padLeft(2, '0');
    return '${d.day} ${months[d.month - 1]} · $h:$m';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        border: Border(left: BorderSide(color: AppColors.primary, width: 3)),
        boxShadow: isDark ? null : AppShadows.cardLight,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.access_time_rounded, size: 12, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
              const SizedBox(width: 4),
              Text(
                _formatDate(info.date),
                style: GoogleFonts.manrope(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white.withValues(alpha: 0.40) : AppColors.lightTextSecondary),
              ),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('Précision ajoutée', style: GoogleFonts.manrope(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            info.text,
            style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w400, color: isDark ? Colors.white.withValues(alpha: 0.85) : AppColors.lightTextPrimary, height: 1.6),
          ),
        ],
      ),
    );
  }
}

// ─── Champ ajout d'informations ───────────────────────────────────────────────

class _AddInfoField extends StatelessWidget {
  final bool isDark;
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onCancel;

  const _AddInfoField({required this.isDark, required this.controller, required this.onSend, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.07) : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        border: isDark ? Border.all(color: Colors.white.withValues(alpha: 0.08)) : null,
        boxShadow: isDark ? null : AppShadows.cardLight,
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: controller,
            maxLines: 4,
            minLines: 3,
            autofocus: true,
            style: GoogleFonts.manrope(
              fontSize: 14,
              color: isDark ? Colors.white : AppColors.lightTextPrimary,
              height: 1.5,
            ),
            decoration: InputDecoration(
              hintText: 'Ajoute des précisions à ton signalement…',
              hintStyle: GoogleFonts.manrope(
                fontSize: 14,
                color: isDark ? Colors.white.withValues(alpha: 0.30) : AppColors.lightTextSecondary.withValues(alpha: 0.60),
              ),
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              // Bouton pièce jointe
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.attach_file_rounded, size: 18, color: isDark ? Colors.white.withValues(alpha: 0.55) : AppColors.lightTextSecondary),
                ),
              ),
              const Spacer(),
              // Annuler
              GestureDetector(
                onTap: onCancel,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('Annuler', style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? Colors.white.withValues(alpha: 0.45) : AppColors.lightTextSecondary)),
                ),
              ),
              // Envoyer
              GestureDetector(
                onTap: onSend,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.30), blurRadius: 8, offset: const Offset(0, 3))],
                  ),
                  child: Text('Envoyer', style: AppTextStyles.button(fontSize: 13)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
