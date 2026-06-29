import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/glass_circle_button.dart';
import '../tutorial/tutorial_page.dart';
import '../user/user_home_page.dart';
import '../parent/child_registration_page.dart';
import '../parent/parent_dashboard_page.dart';
import '../professional/referent_dashboard_page.dart';
import '../professional/professional_dashboard_page.dart';
import '../legal/cgu_page.dart';
import '../legal/privacy_page.dart';
import '../../core/services/auth_service.dart';

enum PortalType { student, parent, professional }

enum _AuthTab { signIn, register }

class AuthPage extends StatefulWidget {
  final PortalType portal;
  final VoidCallback onToggleTheme;
  const AuthPage({super.key, required this.portal, required this.onToggleTheme});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  _AuthTab _tab = _AuthTab.signIn;
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isLoading = false;
  String? _error;

  final _nameCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Veuillez remplir tous les champs');
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    try {
      final user = await AuthService.login(email, password);
      if (!mounted) return;
      _navigateByRole(user.role, user.fullName);
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _handleRegister() async {
    if (widget.portal == PortalType.professional) {
      setState(() => _error = 'Contactez votre administrateur pour créer un compte professionnel');
      return;
    }
    if (widget.portal == PortalType.student) {
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => TutorialPage(onToggleTheme: widget.onToggleTheme),
      ));
      return;
    }
    // Parent registration
    final name = _nameCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Veuillez remplir tous les champs');
      return;
    }
    final parts = name.split(' ');
    final firstName = parts.first;
    final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : parts.first;
    setState(() { _isLoading = true; _error = null; });
    try {
      await AuthService.register(
        email: email,
        password: password,
        role: 'PARENT',
        firstName: firstName,
        lastName: lastName,
      );
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => ChildRegistrationPage(onToggleTheme: widget.onToggleTheme),
      ));
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _navigateByRole(String role, String name) {
    switch (role) {
      case 'SUPERVISOR':
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (_) => ReferentDashboardPage(
            onToggleTheme: widget.onToggleTheme,
            currentUserName: name,
          ),
        ));
      case 'ADMIN':
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (_) => ProfessionalDashboardPage(
            onToggleTheme: widget.onToggleTheme,
            isManager: true,
            currentUserName: name,
          ),
        ));
      case 'PARENT':
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (_) => ParentDashboardPage(onToggleTheme: widget.onToggleTheme),
        ));
      default:
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (_) => UserHomePage(onToggleTheme: widget.onToggleTheme),
        ));
    }
  }

  String get _badgeLabel {
    switch (widget.portal) {
      case PortalType.student:      return 'PORTAIL ÉTUDIANTS';
      case PortalType.parent:       return 'PORTAIL PARENTS';
      case PortalType.professional: return 'PORTAIL PROFESSIONNELS';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
        ),
        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          behavior: HitTestBehavior.opaque,
          child: Scaffold(
            backgroundColor: Colors.transparent,
            resizeToAvoidBottomInset: true,
            body: Stack(
              clipBehavior: Clip.none,
              children: [
                Positioned(
                  right: -310,
                  bottom: -420,
                  child: IgnorePointer(
                    child: Transform.rotate(
                      angle: 0.8,
                      child: Opacity(
                        opacity: isDark ? 0.04 : 0.5,
                        child: Image.asset(
                          isDark ? 'assets/anchor.png' : 'assets/anchorwhitemode.png',
                          width: 950,
                        ),
                      ),
                    ),
                  ),
                ),
                SafeArea(
              child: SingleChildScrollView(
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 8),
                    _TopBar(
                      isDark: isDark,
                      onToggleTheme: widget.onToggleTheme,
                    ),
                    const SizedBox(height: 16),
                    _PortalBadge(label: _badgeLabel, isDark: isDark),
                    const SizedBox(height: 28),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 240),
                      transitionBuilder: (child, anim) => FadeTransition(
                        opacity: anim,
                        child: SlideTransition(
                          position: Tween(
                            begin: const Offset(0, 0.05),
                            end: Offset.zero,
                          ).animate(CurvedAnimation(
                            parent: anim,
                            curve: Curves.easeOut,
                          )),
                          child: child,
                        ),
                      ),
                      child: Align(
                        key: ValueKey(_tab),
                        alignment: Alignment.topLeft,
                        child: _Header(tab: _tab, isDark: isDark),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _TabToggle(
                      tab: _tab,
                      isDark: isDark,
                      onChanged: (t) => setState(() => _tab = t),
                    ),
                    const SizedBox(height: 20),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      transitionBuilder: (child, anim) =>
                          FadeTransition(opacity: anim, child: child),
                      child: _FormFields(
                        key: ValueKey(_tab),
                        tab: _tab,
                        isDark: isDark,
                        nameCtrl: _nameCtrl,
                        emailCtrl: _emailCtrl,
                        passwordCtrl: _passwordCtrl,
                        obscurePassword: _obscurePassword,
                        rememberMe: _rememberMe,
                        onToggleObscure: () =>
                            setState(() => _obscurePassword = !_obscurePassword),
                        onToggleRemember: (v) =>
                            setState(() => _rememberMe = v ?? false),
                      ),
                    ),
                    const SizedBox(height: 28),
                    if (_error != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.error_outline_rounded, size: 16, color: Colors.red.shade400),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _error!,
                                style: TextStyle(fontFamily: 'Manrope', 
                                  fontSize: 13,
                                  color: Colors.red.shade400,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    _CtaButton(
                      tab: _tab,
                      loading: _isLoading,
                      onTap: _tab == _AuthTab.register ? _handleRegister : _handleSignIn,
                    ),
                    const SizedBox(height: 20),
                    _Footer(isDark: isDark),
                    const SizedBox(height: 32),
                  ],
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
}

// ─── Top bar (back + theme toggle) ───────────────────────────────────────────

class _TopBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;
  const _TopBar({required this.isDark, required this.onToggleTheme});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: GlassCircleButton(
            isDark: isDark,
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 16,
              color: isDark ? Colors.white : AppColors.lightTextPrimary,
            ),
          ),
        ),
        GestureDetector(
          onTap: onToggleTheme,
          child: GlassCircleButton(
            isDark: isDark,
            child: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              size: 20,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.9)
                  : AppColors.lightTextPrimary,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Portal badge ─────────────────────────────────────────────────────────────

class _PortalBadge extends StatelessWidget {
  final String label;
  final bool isDark;
  const _PortalBadge({required this.label, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final color = isDark ? AppColors.darkGradientBottom : AppColors.primary;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: isDark ? 0.12 : 0.08),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.add_rounded, size: 13, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: AppTextStyles.overline(color),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  final _AuthTab tab;
  final bool isDark;
  const _Header({required this.tab, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final isRegister = tab == _AuthTab.register;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isRegister ? 'Créez votre compte.' : 'Bon retour.',
          style: TextStyle(fontFamily: 'Fraunces', 
            fontSize: isRegister ? 33 : 38,
            fontWeight: FontWeight.w700,
            height: 1.1,
            letterSpacing: -1.0,
            color: isDark ? Colors.white : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          isRegister
              ? "C'est rapide, moins d'une minute."
              : 'Connectez-vous à votre espace Haven.',
          style: TextStyle(fontFamily: 'Manrope', 
            fontSize: 14,
            height: 1.5,
            color: isDark
                ? Colors.white.withValues(alpha: 0.55)
                : AppColors.lightTextSecondary,
          ),
        ),
      ],
    );
  }
}

// ─── Tab toggle ───────────────────────────────────────────────────────────────

class _TabToggle extends StatelessWidget {
  final _AuthTab tab;
  final bool isDark;
  final ValueChanged<_AuthTab> onChanged;
  const _TabToggle({
    required this.tab,
    required this.isDark,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.08)
            : Colors.black.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: [
          _TabChip(
            label: 'Se connecter',
            active: tab == _AuthTab.signIn,
            isDark: isDark,
            onTap: () => onChanged(_AuthTab.signIn),
          ),
          _TabChip(
            label: "S'inscrire",
            active: tab == _AuthTab.register,
            isDark: isDark,
            onTap: () => onChanged(_AuthTab.register),
          ),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final bool active;
  final bool isDark;
  final VoidCallback onTap;
  const _TabChip({
    required this.label,
    required this.active,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 13),
          decoration: BoxDecoration(
            color: active
                ? (isDark ? AppColors.darkGradientTop : Colors.white)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(26),
            boxShadow: active && !isDark
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.09),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: AppTextStyles.tabChip(isDark, active: active),
          ),
        ),
      ),
    );
  }
}

// ─── Form fields ──────────────────────────────────────────────────────────────

class _FormFields extends StatelessWidget {
  final _AuthTab tab;
  final bool isDark;
  final TextEditingController nameCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;
  final bool obscurePassword;
  final bool rememberMe;
  final VoidCallback onToggleObscure;
  final ValueChanged<bool?> onToggleRemember;

  const _FormFields({
    super.key,
    required this.tab,
    required this.isDark,
    required this.nameCtrl,
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.obscurePassword,
    required this.rememberMe,
    required this.onToggleObscure,
    required this.onToggleRemember,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (tab == _AuthTab.register) ...[
          _HavenField(
            label: 'NOM COMPLET',
            hint: 'Votre nom',
            controller: nameCtrl,
            icon: Icons.person_outline_rounded,
            isDark: isDark,
            keyboardType: TextInputType.name,
            textCapitalization: TextCapitalization.words,
          ),
          const SizedBox(height: 12),
        ],
        _HavenField(
          label: 'EMAIL',
          hint: 'votre@email.com',
          controller: emailCtrl,
          icon: Icons.mail_outline_rounded,
          isDark: isDark,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),
        _HavenField(
          label: 'MOT DE PASSE',
          hint: '••••••••••',
          controller: passwordCtrl,
          icon: Icons.lock_outline_rounded,
          isDark: isDark,
          obscureText: obscurePassword,
          suffix: GestureDetector(
            onTap: onToggleObscure,
            child: Padding(
              padding: const EdgeInsets.only(left: 8),
              child: Icon(
                obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.38)
                    : AppColors.lightTextSecondary.withValues(alpha: 0.6),
              ),
            ),
          ),
        ),
        if (tab == _AuthTab.signIn) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              _RememberMe(
                value: rememberMe,
                isDark: isDark,
                onChanged: onToggleRemember,
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {}, // placeholder — flux mot de passe oublié à brancher
                child: const Text(
                  'Mot de passe oublié ?',
                  style: TextStyle(fontFamily: 'Manrope', 
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

// ─── Text field ───────────────────────────────────────────────────────────────

class _HavenField extends StatelessWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final IconData icon;
  final bool isDark;
  final bool obscureText;
  final Widget? suffix;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;

  const _HavenField({
    required this.label,
    required this.hint,
    required this.controller,
    required this.icon,
    required this.isDark,
    this.obscureText = false,
    this.suffix,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.black.withValues(alpha: 0.08);
    final hintColor = isDark
        ? Colors.white.withValues(alpha: 0.40)
        : AppColors.lightTextSecondary.withValues(alpha: 0.55);
    final iconColor = isDark
        ? Colors.white.withValues(alpha: 0.55)
        : AppColors.lightTextSecondary.withValues(alpha: 0.75);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: AppTextStyles.fieldLabel(isDark),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              Icon(icon, size: 18, color: iconColor),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  obscureText: obscureText,
                  keyboardType: keyboardType,
                  textCapitalization: textCapitalization,
                  style: AppTextStyles.fieldInput(isDark),
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: AppTextStyles.fieldInput(isDark).copyWith(color: hintColor),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (suffix != null) suffix!,
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Remember me ─────────────────────────────────────────────────────────────

class _RememberMe extends StatelessWidget {
  final bool value;
  final bool isDark;
  final ValueChanged<bool?> onChanged;
  const _RememberMe({
    required this.value,
    required this.isDark,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: value ? AppColors.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
              border: Border.all(
                color: value
                    ? AppColors.primary
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.28)
                        : Colors.black.withValues(alpha: 0.20)),
                width: 1.5,
              ),
            ),
            child: value
                ? const Icon(Icons.check_rounded, size: 13, color: Colors.white)
                : null,
          ),
          const SizedBox(width: 8),
          Text(
            'Se souvenir de moi',
            style: TextStyle(fontFamily: 'Manrope', 
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.65)
                  : AppColors.lightTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── CTA button ───────────────────────────────────────────────────────────────

class _CtaButton extends StatelessWidget {
  final _AuthTab tab;
  final VoidCallback onTap;
  final bool loading;
  const _CtaButton({required this.tab, required this.onTap, this.loading = false});

  @override
  Widget build(BuildContext context) {
    final label =
        tab == _AuthTab.register ? 'Créer mon compte' : 'Se connecter';

    return GestureDetector(
      onTap: loading ? null : onTap,
      child: AnimatedOpacity(
        opacity: loading ? 0.7 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 18),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(30),
          ),
          child: loading
              ? const Center(
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2.5,
                    ),
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(fontFamily: 'Manrope', 
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.white,
                      size: 18,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

// ─── Footer ───────────────────────────────────────────────────────────────────

class _Footer extends StatefulWidget {
  final bool isDark;
  const _Footer({required this.isDark});

  @override
  State<_Footer> createState() => _FooterState();
}

class _FooterState extends State<_Footer> {
  late final TapGestureRecognizer _cguTap;
  late final TapGestureRecognizer _privacyTap;

  @override
  void initState() {
    super.initState();
    _cguTap = TapGestureRecognizer()
      ..onTap = () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CguPage()),
          );
    _privacyTap = TapGestureRecognizer()
      ..onTap = () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const PrivacyPage()),
          );
  }

  @override
  void dispose() {
    _cguTap.dispose();
    _privacyTap.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final muted = widget.isDark
        ? Colors.white.withValues(alpha: 0.38)
        : AppColors.lightTextSecondary.withValues(alpha: 0.65);
    final emphasis = widget.isDark
        ? Colors.white.withValues(alpha: 0.60)
        : AppColors.lightTextPrimary;

    return Text.rich(
      TextSpan(
        style: TextStyle(fontFamily: 'Manrope', fontSize: 12, color: muted, height: 1.5),
        children: [
          const TextSpan(text: 'En continuant, vous acceptez les '),
          TextSpan(
            text: 'CGU',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: emphasis,
              decoration: TextDecoration.underline,
              decorationColor: emphasis,
            ),
            recognizer: _cguTap,
          ),
          const TextSpan(text: ' et la '),
          TextSpan(
            text: 'Politique de confidentialité',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: emphasis,
              decoration: TextDecoration.underline,
              decorationColor: emphasis,
            ),
            recognizer: _privacyTap,
          ),
          const TextSpan(text: ' de Haven.'),
        ],
      ),
      textAlign: TextAlign.center,
    );
  }
}
