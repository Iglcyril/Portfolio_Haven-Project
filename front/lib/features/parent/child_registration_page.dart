import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/widgets/glass_circle_button.dart';
import '../../core/services/api_client.dart';
import 'parent_dashboard_page.dart';

// ─── Modèle ───────────────────────────────────────────────────────────────────

class ChildEntry {
  final String firstName;
  final String lastName;
  final String birthDate; // format JJ/MM/AAAA (display), converti YYYY-MM-DD pour l'API

  const ChildEntry({
    required this.firstName,
    required this.lastName,
    required this.birthDate,
  });

  // Convertit JJ/MM/AAAA → YYYY-MM-DD pour l'API
  String get birthDateForApi {
    final parts = birthDate.split('/');
    return '${parts[2]}-${parts[1]}-${parts[0]}';
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

class ChildRegistrationPage extends StatefulWidget {
  final VoidCallback onToggleTheme;

  const ChildRegistrationPage({super.key, required this.onToggleTheme});

  @override
  State<ChildRegistrationPage> createState() => _ChildRegistrationPageState();
}

class _ChildRegistrationPageState extends State<ChildRegistrationPage> {
  final _firstNameController = TextEditingController();
  final _lastNameController  = TextEditingController();
  final _birthDateController = TextEditingController();
  final List<ChildEntry> _children = [];

  bool _isLoading = false;
  String? _error;

  bool get _canAdd =>
      _firstNameController.text.trim().isNotEmpty &&
      _lastNameController.text.trim().isNotEmpty &&
      _birthDateController.text.trim().length == 10; // JJ/MM/AAAA

  bool get _canStart => _children.isNotEmpty && !_isLoading;

  bool _isValidDate(String raw) {
    final parts = raw.split('/');
    if (parts.length != 3) return false;
    if (parts[0].length != 2 || parts[1].length != 2 || parts[2].length != 4) return false;
    return true;
  }

  void _addChild() {
    if (!_canAdd) return;
    final birthDate = _birthDateController.text.trim();
    if (!_isValidDate(birthDate)) {
      setState(() => _error = 'Format de date invalide (JJ/MM/AAAA)');
      return;
    }
    setState(() {
      _error = null;
      _children.add(ChildEntry(
        firstName: _firstNameController.text.trim(),
        lastName:  _lastNameController.text.trim(),
        birthDate: birthDate,
      ));
      _firstNameController.clear();
      _lastNameController.clear();
      _birthDateController.clear();
    });
  }

  void _removeChild(int index) {
    setState(() => _children.removeAt(index));
  }

  void _onFieldChanged() => setState(() {});

  Future<void> _onStart() async {
    if (!_canStart) return;
    setState(() { _isLoading = true; _error = null; });
    try {
      for (final child in _children) {
        await ApiClient.post('/parents/link-child', {
          'firstName': child.firstName,
          'lastName':  child.lastName,
          'birthDate': child.birthDateForApi,
        });
      }
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ParentDashboardPage(onToggleTheme: widget.onToggleTheme),
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.statusCode == 404
            ? 'Aucun élève trouvé avec ces informations. Vérifiez prénom, nom et date de naissance.'
            : e.message;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _isLoading = false; _error = e.toString(); });
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _birthDateController.dispose();
    super.dispose();
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
                    // ── App bar ───────────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: widget.onToggleTheme,
                          child: GlassCircleButton(
                            isDark: isDark,
                            child: Icon(
                              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                              color: isDark ? Colors.white.withValues(alpha: 0.90) : Colors.black,
                              size: 20,
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
                            const SizedBox(height: 12),

                            // ── Titre ─────────────────────────────────────
                            Text(
                              'Bienvenue sur Haven !',
                              style: TextStyle(fontFamily: 'Fraunces',
                                fontSize: 34,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : AppColors.lightTextPrimary,
                                letterSpacing: -0.5,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Application de lutte contre le harcèlement.',
                              style: TextStyle(fontFamily: 'Fraunces',
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                                letterSpacing: -0.2,
                                height: 1.2,
                              ),
                            ),

                            const SizedBox(height: 36),

                            // ── Sous-titre ────────────────────────────────
                            Text(
                              'Veuillez nommer votre ou vos enfant(s) :',
                              style: TextStyle(fontFamily: 'Manrope',
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.white : AppColors.lightTextPrimary,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Entrez le prénom, nom et date de naissance de l\'élève tels qu\'il les a renseignés lors de son inscription.',
                              style: TextStyle(fontFamily: 'Manrope',
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.50)
                                    : AppColors.lightTextSecondary,
                                height: 1.4,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // ── Formulaire d'ajout ────────────────────────
                            Container(
                              decoration: BoxDecoration(
                                color: isDark
                                    ? Colors.white.withValues(alpha: 0.07)
                                    : AppColors.lightCard,
                                borderRadius: BorderRadius.circular(24),
                                border: isDark
                                    ? Border.all(color: Colors.white.withValues(alpha: 0.08))
                                    : null,
                                boxShadow: isDark ? null : AppShadows.cardMedium,
                              ),
                              child: Column(
                                children: [
                                  _InputField(
                                    controller: _firstNameController,
                                    hint: 'Prénom',
                                    isDark: isDark,
                                    onChanged: (_) => _onFieldChanged(),
                                    isFirst: true,
                                  ),
                                  _Divider(isDark: isDark),
                                  _InputField(
                                    controller: _lastNameController,
                                    hint: 'Nom',
                                    isDark: isDark,
                                    onChanged: (_) => _onFieldChanged(),
                                  ),
                                  _Divider(isDark: isDark),
                                  _InputField(
                                    controller: _birthDateController,
                                    hint: 'Date de naissance (JJ/MM/AAAA)',
                                    isDark: isDark,
                                    onChanged: (_) => _onFieldChanged(),
                                    keyboardType: TextInputType.number,
                                    inputFormatters: [_DateInputFormatter()],
                                    isLast: true,
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 12),

                            // ── Bouton + ──────────────────────────────────
                            Align(
                              alignment: Alignment.centerRight,
                              child: GestureDetector(
                                onTap: _canAdd ? _addChild : null,
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
                                  decoration: BoxDecoration(
                                    color: _canAdd
                                        ? AppColors.primary
                                        : (isDark
                                            ? Colors.white.withValues(alpha: 0.08)
                                            : Colors.black.withValues(alpha: 0.06)),
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: _canAdd
                                        ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 4))]
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
                                                ? Colors.white.withValues(alpha: 0.25)
                                                : Colors.black.withValues(alpha: 0.22)),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Ajouter',
                                        style: TextStyle(fontFamily: 'Manrope',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: _canAdd
                                              ? Colors.white
                                              : (isDark
                                                  ? Colors.white.withValues(alpha: 0.25)
                                                  : Colors.black.withValues(alpha: 0.22)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),

                            // ── Message d'erreur ──────────────────────────
                            if (_error != null) ...[
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.10),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: Colors.red.withValues(alpha: 0.25)),
                                ),
                                child: Text(
                                  _error!,
                                  style: const TextStyle(fontFamily: 'Manrope',
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.red,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],

                            // ── Liste des enfants ajoutés ─────────────────
                            if (_children.isNotEmpty) ...[
                              const SizedBox(height: 24),
                              ..._children.asMap().entries.map((e) => Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: _ChildChip(
                                  child: e.value,
                                  isDark: isDark,
                                  onRemove: () => _removeChild(e.key),
                                ),
                              )),
                            ],

                            const SizedBox(height: 40),
                          ],
                        ),
                      ),
                    ),

                    // ── Bouton Commencer ──────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: _canStart ? _onStart : null,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                            decoration: BoxDecoration(
                              color: _canStart
                                  ? AppColors.primary
                                  : (isDark
                                      ? Colors.white.withValues(alpha: 0.08)
                                      : Colors.black.withValues(alpha: 0.07)),
                              borderRadius: BorderRadius.circular(28),
                              boxShadow: _canStart
                                  ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.35), blurRadius: 14, offset: const Offset(0, 5))]
                                  : null,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (_isLoading)
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                else
                                  Text(
                                    'Commencer',
                                    style: TextStyle(fontFamily: 'Manrope',
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: _canStart
                                          ? Colors.white
                                          : (isDark
                                              ? Colors.white.withValues(alpha: 0.25)
                                              : Colors.black.withValues(alpha: 0.22)),
                                    ),
                                  ),
                                if (!_isLoading) ...[
                                  const SizedBox(width: 8),
                                  Icon(
                                    Icons.arrow_forward_rounded,
                                    size: 18,
                                    color: _canStart
                                        ? Colors.white
                                        : (isDark
                                            ? Colors.white.withValues(alpha: 0.25)
                                            : Colors.black.withValues(alpha: 0.22)),
                                  ),
                                ],
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

// ─── Formatter date JJ/MM/AAAA ────────────────────────────────────────────────

class _DateInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return newValue.copyWith(text: '');

    final buffer = StringBuffer();
    for (int i = 0; i < digits.length && i < 8; i++) {
      if (i == 2 || i == 4) buffer.write('/');
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();
    return newValue.copyWith(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

// ─── Champ de saisie ──────────────────────────────────────────────────────────

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool isDark;
  final ValueChanged<String> onChanged;
  final bool isFirst;
  final bool isLast;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.isDark,
    required this.onChanged,
    this.isFirst = false,
    this.isLast = false,
    this.keyboardType,
    this.inputFormatters,
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
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        style: TextStyle(fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDark ? Colors.white : AppColors.lightTextPrimary,
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(fontFamily: 'Manrope',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: isDark
                ? Colors.white.withValues(alpha: 0.30)
                : AppColors.lightTextSecondary.withValues(alpha: 0.60),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          isDense: true,
        ),
      ),
    );
  }
}

// ─── Séparateur ───────────────────────────────────────────────────────────────

class _Divider extends StatelessWidget {
  final bool isDark;
  const _Divider({required this.isDark});

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

// ─── Chip enfant ──────────────────────────────────────────────────────────────

class _ChildChip extends StatelessWidget {
  final ChildEntry child;
  final bool isDark;
  final VoidCallback onRemove;

  const _ChildChip({
    required this.child,
    required this.isDark,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : AppColors.lightCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.30 : 0.20),
        ),
        boxShadow: isDark
            ? null
            : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${child.firstName} ${child.lastName}',
                  style: TextStyle(fontFamily: 'Manrope',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white.withValues(alpha: 0.90) : AppColors.lightTextPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  'Né(e) le ${child.birthDate}',
                  style: TextStyle(fontFamily: 'Manrope',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.45)
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.close_rounded,
                size: 14,
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
