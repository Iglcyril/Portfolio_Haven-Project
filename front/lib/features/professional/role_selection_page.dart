import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/glass_circle_button.dart';
import 'director_designation_page.dart';
import 'referent_dashboard_page.dart';

// ─── Rôles professionnels ─────────────────────────────────────────────────────

enum ProfessionalRole {
  director,
  cpe,
  nurse,
  aed,
  teacher,
  socialWorker,
  other,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

class ProfessionalRoleSelectionPage extends StatefulWidget {
  final VoidCallback onToggleTheme;

  const ProfessionalRoleSelectionPage({
    super.key,
    required this.onToggleTheme,
  });

  @override
  State<ProfessionalRoleSelectionPage> createState() =>
      _ProfessionalRoleSelectionPageState();
}

class _ProfessionalRoleSelectionPageState
    extends State<ProfessionalRoleSelectionPage> {
  ProfessionalRole? _selected;
  final _otherCtrl = TextEditingController();

  bool get _canContinue {
    if (_selected == null) return false;
    if (_selected == ProfessionalRole.other) {
      return _otherCtrl.text.trim().isNotEmpty;
    }
    return true;
  }

  @override
  void dispose() {
    _otherCtrl.dispose();
    super.dispose();
  }

  void _onContinue() {
    if (!_canContinue) return;
    if (_selected == ProfessionalRole.director) {
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => DirectorDesignationPage(
          onToggleTheme: widget.onToggleTheme,
        ),
      ));
    } else {
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ReferentDashboardPage(
          onToggleTheme: widget.onToggleTheme,
          // currentUserName sera fourni par le backend à la connexion
        ),
      ));
    }
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
                    // ── App bar ─────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: GlassCircleButton(
                              isDark: isDark,
                              child: Icon(
                                Icons.arrow_back_ios_new_rounded,
                                size: 16,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.lightTextPrimary,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: widget.onToggleTheme,
                            child: GlassCircleButton(
                              isDark: isDark,
                              child: Icon(
                                isDark
                                    ? Icons.light_mode_outlined
                                    : Icons.dark_mode_outlined,
                                size: 20,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.90)
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // ── Contenu ─────────────────────────────────────────
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 20),

                            Text(
                              'Bienvenue sur Haven !',
                              style: TextStyle(fontFamily: 'Fraunces', 
                                fontSize: 34,
                                fontWeight: FontWeight.w800,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.lightTextPrimary,
                                letterSpacing: -0.5,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Quel est votre poste ?',
                              style: TextStyle(fontFamily: 'Fraunces', 
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                                letterSpacing: -0.3,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 28),

                            _RoleCard(
                              title: 'Directeur·rice',
                              subtitle: "Direction de l'établissement",
                              icon: Icons.manage_accounts_outlined,
                              selected: _selected == ProfessionalRole.director,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.director),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'CPE',
                              subtitle:
                                  "Conseiller·ère Principal·e d'Éducation",
                              icon: Icons.school_outlined,
                              selected: _selected == ProfessionalRole.cpe,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.cpe),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'Infirmier·ère',
                              subtitle: 'Personnel de santé scolaire',
                              icon: Icons.medical_services_outlined,
                              selected: _selected == ProfessionalRole.nurse,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.nurse),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'AED',
                              subtitle: "Assistant·e d'Éducation",
                              icon: Icons.support_agent_outlined,
                              selected: _selected == ProfessionalRole.aed,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.aed),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'Professeur·e',
                              subtitle: "Enseignant·e de l'établissement",
                              icon: Icons.menu_book_outlined,
                              selected: _selected == ProfessionalRole.teacher,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.teacher),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'Assistant·e Social·e',
                              subtitle: 'Accompagnement social des élèves',
                              icon: Icons.diversity_3_outlined,
                              selected:
                                  _selected == ProfessionalRole.socialWorker,
                              isDark: isDark,
                              onTap: () => setState(() =>
                                  _selected = ProfessionalRole.socialWorker),
                            ),
                            const SizedBox(height: 10),
                            _RoleCard(
                              title: 'Autre',
                              subtitle: 'Précisez votre poste',
                              icon: Icons.edit_note_outlined,
                              selected: _selected == ProfessionalRole.other,
                              isDark: isDark,
                              onTap: () => setState(
                                  () => _selected = ProfessionalRole.other),
                              isOther: true,
                              otherController: _otherCtrl,
                              onOtherChanged: (_) => setState(() {}),
                            ),

                            const SizedBox(height: 40),
                          ],
                        ),
                      ),
                    ),

                    // ── Bouton Continuer ────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: _canContinue ? _onContinue : null,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 28,
                              vertical: 16,
                            ),
                            decoration: BoxDecoration(
                              color: _canContinue
                                  ? AppColors.primary
                                  : (isDark
                                      ? Colors.white.withValues(alpha: 0.08)
                                      : Colors.black.withValues(alpha: 0.07)),
                              borderRadius: BorderRadius.circular(28),
                              boxShadow: _canContinue
                                  ? [
                                      BoxShadow(
                                        color: AppColors.primary
                                            .withValues(alpha: 0.35),
                                        blurRadius: 14,
                                        offset: const Offset(0, 5),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Continuer',
                                  style: TextStyle(fontFamily: 'Manrope', 
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: _canContinue
                                        ? Colors.white
                                        : (isDark
                                            ? Colors.white
                                                .withValues(alpha: 0.25)
                                            : Colors.black
                                                .withValues(alpha: 0.22)),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 18,
                                  color: _canContinue
                                      ? Colors.white
                                      : (isDark
                                          ? Colors.white.withValues(alpha: 0.25)
                                          : Colors.black
                                              .withValues(alpha: 0.22)),
                                ),
                              ],
                            ),
                          ),
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

// ─── Card de rôle ─────────────────────────────────────────────────────────────

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;
  final bool isOther;
  final TextEditingController? otherController;
  final ValueChanged<String>? onOtherChanged;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.isDark,
    required this.onTap,
    this.isOther = false,
    this.otherController,
    this.onOtherChanged,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = isDark
        ? Colors.white.withValues(alpha: selected ? 0.12 : 0.07)
        : (selected
            ? AppColors.primary.withValues(alpha: 0.07)
            : AppColors.lightCard);

    final borderColor = selected
        ? AppColors.primary
        : (isDark
            ? Colors.white.withValues(alpha: 0.10)
            : Colors.transparent);

    final iconBgColor = isDark
        ? AppColors.primary.withValues(alpha: selected ? 0.30 : 0.15)
        : AppColors.primary.withValues(alpha: selected ? 0.15 : 0.10);

    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDark
        ? Colors.white.withValues(alpha: 0.55)
        : AppColors.lightTextSecondary;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: borderColor,
            width: selected ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Ligne principale ──────────────────────────────────────
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(fontFamily: 'Fraunces', 
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: textColor,
                          letterSpacing: -0.1,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        subtitle,
                        style: TextStyle(fontFamily: 'Manrope', 
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: selected ? AppColors.primary : Colors.transparent,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: selected
                          ? AppColors.primary
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.25)
                              : Colors.black.withValues(alpha: 0.18)),
                      width: 1.5,
                    ),
                  ),
                  child: selected
                      ? const Icon(Icons.check_rounded,
                          color: Colors.white, size: 14)
                      : null,
                ),
              ],
            ),

            // ── Champ texte libre (Autre uniquement) ─────────────────
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              child: isOther && selected
                  ? Padding(
                      padding: const EdgeInsets.only(top: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Divider(
                            height: 1,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.10)
                                : Colors.black.withValues(alpha: 0.08),
                          ),
                          const SizedBox(height: 14),
                          GestureDetector(
                            onTap: () {},
                            child: Container(
                              decoration: BoxDecoration(
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.07)
                                    : Colors.black.withValues(alpha: 0.04),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: TextField(
                                controller: otherController,
                                onChanged: onOtherChanged,
                                textCapitalization:
                                    TextCapitalization.sentences,
                                style: TextStyle(fontFamily: 'Manrope', 
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: isDark
                                      ? Colors.white
                                      : AppColors.lightTextPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Saisissez votre poste…',
                                  hintStyle: TextStyle(fontFamily: 'Manrope', 
                                    fontSize: 14,
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.30)
                                        : AppColors.lightTextSecondary
                                            .withValues(alpha: 0.55),
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 12,
                                  ),
                                  isDense: true,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}
