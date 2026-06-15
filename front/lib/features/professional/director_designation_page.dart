import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import 'professional_dashboard_page.dart';

// ─── Modèle ───────────────────────────────────────────────────────────────────

class _DesignatedPerson {
  final String firstName;
  final String lastName;
  final String role;

  const _DesignatedPerson({
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  String get initials =>
      '${firstName.isNotEmpty ? firstName[0].toUpperCase() : ''}'
      '${lastName.isNotEmpty ? lastName[0].toUpperCase() : ''}';

  String get fullName => '$firstName $lastName'.trim();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

class DirectorDesignationPage extends StatefulWidget {
  final VoidCallback onToggleTheme;

  const DirectorDesignationPage({super.key, required this.onToggleTheme});

  @override
  State<DirectorDesignationPage> createState() =>
      _DirectorDesignationPageState();
}

class _DirectorDesignationPageState extends State<DirectorDesignationPage> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _otherCtrl = TextEditingController();
  String? _selectedRole;
  final List<_DesignatedPerson> _persons = [];

  static const List<String> _roles = [
    'CPE',
    'Infirmier·ère',
    'AED',
    'Professeur·e',
    'Assistant·e Social·e',
    'Autre',
  ];

  static const int _maxPersons = 2;

  bool get _canAdd {
    if (_persons.length >= _maxPersons) return false;
    final hasName = _firstNameCtrl.text.trim().isNotEmpty &&
        _lastNameCtrl.text.trim().isNotEmpty;
    if (!hasName || _selectedRole == null) return false;
    if (_selectedRole == 'Autre') return _otherCtrl.text.trim().isNotEmpty;
    return true;
  }

  bool get _canValidate => _persons.isNotEmpty;

  bool get _hasFormContent =>
      _firstNameCtrl.text.trim().isNotEmpty ||
      _lastNameCtrl.text.trim().isNotEmpty;

  void _onFieldChanged() => setState(() {});

  void _addPerson() {
    if (!_canAdd) return;
    final role = _selectedRole == 'Autre'
        ? _otherCtrl.text.trim()
        : _selectedRole!;
    setState(() {
      _persons.add(_DesignatedPerson(
        firstName: _firstNameCtrl.text.trim(),
        lastName: _lastNameCtrl.text.trim(),
        role: role,
      ));
      _firstNameCtrl.clear();
      _lastNameCtrl.clear();
      _otherCtrl.clear();
      _selectedRole = null;
    });
  }

  void _removePerson(int index) => setState(() => _persons.removeAt(index));

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _otherCtrl.dispose();
    super.dispose();
  }

  void _onValidate() {
    if (!_canValidate) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (_) => ProfessionalDashboardPage(
        onToggleTheme: widget.onToggleTheme,
        isManager: true,
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        behavior: HitTestBehavior.opaque,
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
                              child: _GlassBtn(
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
                              child: _GlassBtn(
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
                          keyboardDismissBehavior:
                              ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const SizedBox(height: 20),

                              // ── Titre ────────────────────────────────────
                              Text(
                                'Désignation',
                                style: GoogleFonts.fraunces(
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  color: isDark
                                      ? Colors.white
                                      : AppColors.lightTextPrimary,
                                  letterSpacing: -0.5,
                                  height: 1.05,
                                ),
                              ),
                              Text(
                                'du co-responsable.',
                                style: GoogleFonts.fraunces(
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primary,
                                  letterSpacing: -0.5,
                                  height: 1.1,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Désignez le·s membre·s de votre équipe qui co-géreront Haven avec vous. Ces personnes pourront assigner des signalements aux membres de votre équipe.',
                                style: GoogleFonts.manrope(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  height: 1.6,
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.52)
                                      : AppColors.lightTextSecondary,
                                ),
                              ),

                              const SizedBox(height: 36),

                              // ── Section : nom ─────────────────────────────
                              _SectionLabel(
                                label: 'NOM DU CO-RESPONSABLE',
                                isDark: isDark,
                              ),
                              const SizedBox(height: 10),

                              // ── Formulaire Prénom + Nom ───────────────────
                              Container(
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.07)
                                      : AppColors.lightCard,
                                  borderRadius: BorderRadius.circular(24),
                                  border: isDark
                                      ? Border.all(
                                          color: Colors.white
                                              .withValues(alpha: 0.08))
                                      : null,
                                  boxShadow: isDark
                                      ? null
                                      : [
                                          BoxShadow(
                                            color: Colors.black
                                                .withValues(alpha: 0.05),
                                            blurRadius: 10,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                ),
                                child: Column(
                                  children: [
                                    _InputField(
                                      controller: _firstNameCtrl,
                                      hint: 'Prénom',
                                      isDark: isDark,
                                      onChanged: (_) => _onFieldChanged(),
                                      isFirst: true,
                                    ),
                                    _FieldDivider(isDark: isDark),
                                    _InputField(
                                      controller: _lastNameCtrl,
                                      hint: 'Nom',
                                      isDark: isDark,
                                      onChanged: (_) => _onFieldChanged(),
                                      isLast: true,
                                    ),
                                  ],
                                ),
                              ),

                              // ── Aperçu live ───────────────────────────────
                              AnimatedSize(
                                duration: const Duration(milliseconds: 220),
                                curve: Curves.easeInOut,
                                child: _hasFormContent
                                    ? Padding(
                                        padding: const EdgeInsets.only(top: 12),
                                        child: _PersonPreview(
                                          firstName:
                                              _firstNameCtrl.text.trim(),
                                          lastName: _lastNameCtrl.text.trim(),
                                          role: _selectedRole == 'Autre'
                                              ? _otherCtrl.text.trim()
                                              : _selectedRole,
                                          isDark: isDark,
                                        ),
                                      )
                                    : const SizedBox.shrink(),
                              ),

                              const SizedBox(height: 24),

                              // ── Section : poste ───────────────────────────
                              _SectionLabel(
                                label: 'POSTE OCCUPÉ',
                                isDark: isDark,
                              ),
                              const SizedBox(height: 12),

                              // ── Chips de rôle ─────────────────────────────
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _roles.map((role) {
                                  final isSelected = _selectedRole == role;
                                  return GestureDetector(
                                    onTap: () => setState(() {
                                      _selectedRole = role;
                                      if (role != 'Autre') _otherCtrl.clear();
                                    }),
                                    child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 180),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 10,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? AppColors.primary
                                                .withValues(alpha: 0.12)
                                            : (isDark
                                                ? Colors.white
                                                    .withValues(alpha: 0.07)
                                                : AppColors.lightCard),
                                        borderRadius:
                                            BorderRadius.circular(20),
                                        border: Border.all(
                                          color: isSelected
                                              ? AppColors.primary
                                              : (isDark
                                                  ? Colors.white
                                                      .withValues(alpha: 0.12)
                                                  : Colors.black
                                                      .withValues(alpha: 0.08)),
                                          width: isSelected ? 1.5 : 1.0,
                                        ),
                                        boxShadow: isSelected
                                            ? [
                                                BoxShadow(
                                                  color: AppColors.primary
                                                      .withValues(alpha: 0.15),
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ]
                                            : null,
                                      ),
                                      child: Text(
                                        role,
                                        style: GoogleFonts.manrope(
                                          fontSize: 13,
                                          fontWeight: isSelected
                                              ? FontWeight.w700
                                              : FontWeight.w500,
                                          color: isSelected
                                              ? AppColors.primary
                                              : (isDark
                                                  ? Colors.white
                                                      .withValues(alpha: 0.70)
                                                  : AppColors
                                                      .lightTextSecondary),
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),

                              // ── Champ texte "Autre" ───────────────────────
                              AnimatedSize(
                                duration: const Duration(milliseconds: 220),
                                curve: Curves.easeInOut,
                                child: _selectedRole == 'Autre'
                                    ? Padding(
                                        padding:
                                            const EdgeInsets.only(top: 12),
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: isDark
                                                ? Colors.white
                                                    .withValues(alpha: 0.07)
                                                : AppColors.lightCard,
                                            borderRadius:
                                                BorderRadius.circular(20),
                                            border: isDark
                                                ? Border.all(
                                                    color: Colors.white
                                                        .withValues(alpha: 0.08))
                                                : null,
                                            boxShadow: isDark
                                                ? null
                                                : [
                                                    BoxShadow(
                                                      color: Colors.black
                                                          .withValues(
                                                              alpha: 0.05),
                                                      blurRadius: 8,
                                                      offset:
                                                          const Offset(0, 2),
                                                    ),
                                                  ],
                                          ),
                                          child: TextField(
                                            controller: _otherCtrl,
                                            onChanged: (_) => _onFieldChanged(),
                                            textCapitalization:
                                                TextCapitalization.sentences,
                                            style: GoogleFonts.manrope(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                              color: isDark
                                                  ? Colors.white
                                                  : AppColors.lightTextPrimary,
                                            ),
                                            decoration: InputDecoration(
                                              hintText: 'Saisissez le poste…',
                                              hintStyle: GoogleFonts.manrope(
                                                fontSize: 14,
                                                color: isDark
                                                    ? Colors.white.withValues(
                                                        alpha: 0.30)
                                                    : AppColors.lightTextSecondary
                                                        .withValues(alpha: 0.55),
                                              ),
                                              border: InputBorder.none,
                                              contentPadding:
                                                  const EdgeInsets.symmetric(
                                                horizontal: 18,
                                                vertical: 14,
                                              ),
                                              isDense: true,
                                            ),
                                          ),
                                        ),
                                      )
                                    : const SizedBox.shrink(),
                              ),

                              // ── Limite atteinte ───────────────────────────
                              AnimatedSize(
                                duration: const Duration(milliseconds: 200),
                                curve: Curves.easeInOut,
                                child: _persons.length >= _maxPersons
                                    ? Padding(
                                        padding:
                                            const EdgeInsets.only(top: 14),
                                        child: Row(
                                          children: [
                                            Icon(
                                              Icons.info_outline_rounded,
                                              size: 14,
                                              color: AppColors.primary
                                                  .withValues(alpha: 0.65),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Limite de $_maxPersons co-responsables atteinte.',
                                              style: GoogleFonts.manrope(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                                color: AppColors.primary
                                                    .withValues(alpha: 0.65),
                                              ),
                                            ),
                                          ],
                                        ),
                                      )
                                    : const SizedBox.shrink(),
                              ),

                              // ── Bouton Ajouter ────────────────────────────
                              const SizedBox(height: 14),
                              Align(
                                alignment: Alignment.centerRight,
                                child: GestureDetector(
                                  onTap: _canAdd ? _addPerson : null,
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 11),
                                    decoration: BoxDecoration(
                                      color: _canAdd
                                          ? AppColors.primary
                                          : (isDark
                                              ? Colors.white
                                                  .withValues(alpha: 0.08)
                                              : Colors.black
                                                  .withValues(alpha: 0.06)),
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: _canAdd
                                          ? [
                                              BoxShadow(
                                                color: AppColors.primary
                                                    .withValues(alpha: 0.35),
                                                blurRadius: 10,
                                                offset: const Offset(0, 4),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.add_rounded,
                                          size: 18,
                                          color: _canAdd
                                              ? Colors.white
                                              : (isDark
                                                  ? Colors.white
                                                      .withValues(alpha: 0.25)
                                                  : Colors.black
                                                      .withValues(alpha: 0.22)),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Ajouter',
                                          style: GoogleFonts.manrope(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: _canAdd
                                                ? Colors.white
                                                : (isDark
                                                    ? Colors.white
                                                        .withValues(alpha: 0.25)
                                                    : Colors.black
                                                        .withValues(
                                                            alpha: 0.22)),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),

                              // ── Liste des personnes ajoutées ──────────────
                              if (_persons.isNotEmpty) ...[
                                const SizedBox(height: 24),
                                _SectionLabel(
                                  label: 'CO-RESPONSABLES DÉSIGNÉ·E·S',
                                  isDark: isDark,
                                ),
                                const SizedBox(height: 10),
                                ..._persons.asMap().entries.map((e) => Padding(
                                      padding:
                                          const EdgeInsets.only(bottom: 10),
                                      child: _PersonChip(
                                        person: e.value,
                                        isDark: isDark,
                                        onRemove: () =>
                                            _removePerson(e.key),
                                      ),
                                    )),
                              ],

                              const SizedBox(height: 40),
                            ],
                          ),
                        ),
                      ),

                      // ── Bouton Valider ────────────────────────────────────
                      Padding(
                        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: _canValidate ? _onValidate : null,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 28,
                                vertical: 16,
                              ),
                              decoration: BoxDecoration(
                                color: _canValidate
                                    ? AppColors.primary
                                    : (isDark
                                        ? Colors.white.withValues(alpha: 0.08)
                                        : Colors.black.withValues(alpha: 0.07)),
                                borderRadius: BorderRadius.circular(28),
                                boxShadow: _canValidate
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
                                    'Valider',
                                    style: GoogleFonts.manrope(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: _canValidate
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
                                    Icons.check_rounded,
                                    size: 18,
                                    color: _canValidate
                                        ? Colors.white
                                        : (isDark
                                            ? Colors.white
                                                .withValues(alpha: 0.25)
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
      ),
    );
  }
}

// ─── Aperçu live (pendant la saisie) ─────────────────────────────────────────

class _PersonPreview extends StatelessWidget {
  final String firstName;
  final String lastName;
  final String? role;
  final bool isDark;

  const _PersonPreview({
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isDark,
  });

  String get _initials {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }

  String get _fullName {
    final parts = [firstName, lastName].where((s) => s.isNotEmpty).join(' ');
    return parts.isEmpty ? '—' : parts;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.primary.withValues(alpha: 0.10)
            : AppColors.primary.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.25 : 0.18),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.primary.withValues(alpha: 0.40)
                  : AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                _initials.isEmpty ? '?' : _initials,
                style: GoogleFonts.manrope(
                  fontSize: 15,
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
                Text(
                  _fullName,
                  style: GoogleFonts.fraunces(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color:
                        isDark ? Colors.white : AppColors.lightTextPrimary,
                    letterSpacing: -0.1,
                  ),
                ),
                if (role != null && role!.isNotEmpty)
                  Text(
                    role!,
                    style: GoogleFonts.manrope(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primary,
                    ),
                  ),
              ],
            ),
          ),
          Icon(
            Icons.edit_outlined,
            size: 18,
            color: AppColors.primary.withValues(alpha: 0.45),
          ),
        ],
      ),
    );
  }
}

// ─── Chip personne ajoutée ────────────────────────────────────────────────────

class _PersonChip extends StatelessWidget {
  final _DesignatedPerson person;
  final bool isDark;
  final VoidCallback onRemove;

  const _PersonChip({
    required this.person,
    required this.isDark,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : AppColors.lightCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.28 : 0.18),
        ),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.primary.withValues(alpha: 0.35)
                  : AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                person.initials.isEmpty ? '?' : person.initials,
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
                  person.fullName,
                  style: GoogleFonts.manrope(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.90)
                        : AppColors.lightTextPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  person.role,
                  style: GoogleFonts.manrope(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.close_rounded,
                size: 15,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.50)
                    : AppColors.lightTextSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Label de section ─────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  final bool isDark;
  const _SectionLabel({required this.label, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: GoogleFonts.manrope(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.9,
        color: isDark
            ? Colors.white.withValues(alpha: 0.45)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70),
      ),
    );
  }
}

// ─── Champ de saisie ─────────────────────────────────────────────────────────

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool isDark;
  final ValueChanged<String> onChanged;
  final bool isFirst;
  final bool isLast;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.isDark,
    required this.onChanged,
    this.isFirst = false,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.vertical(
        top: isFirst ? const Radius.circular(24) : Radius.zero,
        bottom: isLast ? const Radius.circular(24) : Radius.zero,
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        textCapitalization: TextCapitalization.words,
        style: GoogleFonts.manrope(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDark ? Colors.white : AppColors.lightTextPrimary,
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.manrope(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: isDark
                ? Colors.white.withValues(alpha: 0.30)
                : AppColors.lightTextSecondary.withValues(alpha: 0.60),
          ),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          isDense: true,
        ),
      ),
    );
  }
}

// ─── Séparateur de champ ──────────────────────────────────────────────────────

class _FieldDivider extends StatelessWidget {
  final bool isDark;
  const _FieldDivider({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      indent: 18,
      endIndent: 18,
      color: isDark
          ? Colors.white.withValues(alpha: 0.07)
          : Colors.black.withValues(alpha: 0.07),
    );
  }
}

// ─── Bouton glass ─────────────────────────────────────────────────────────────

class _GlassBtn extends StatelessWidget {
  final bool isDark;
  final Widget child;
  const _GlassBtn({required this.isDark, required this.child});

  @override
  Widget build(BuildContext context) {
    return ClipOval(
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
          child: Center(child: child),
        ),
      ),
    );
  }
}
