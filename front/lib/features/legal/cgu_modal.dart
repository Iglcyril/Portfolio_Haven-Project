import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_colors.dart';
import 'cgu_page.dart';
import 'privacy_page.dart';

Future<void> showCguModalIfNeeded(BuildContext context) async {
  final prefs = await SharedPreferences.getInstance();
  if (prefs.getBool('cgu_accepted') ?? false) return;
  if (!context.mounted) return;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    isDismissible: false,
    enableDrag: false,
    backgroundColor: Colors.transparent,
    builder: (ctx) => SizedBox(
      height: MediaQuery.of(ctx).size.height * 0.92,
      child: _CguSheet(
        onAccepted: () => prefs.setBool('cgu_accepted', true),
      ),
    ),
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

class _CguSheet extends StatefulWidget {
  final Future<void> Function() onAccepted;
  const _CguSheet({required this.onAccepted});

  @override
  State<_CguSheet> createState() => _CguSheetState();
}

class _CguSheetState extends State<_CguSheet> {
  final _scrollCtrl = ScrollController();
  bool _canAccept = false;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_canAccept &&
        _scrollCtrl.position.pixels >=
            _scrollCtrl.position.maxScrollExtent - 32) {
      setState(() => _canAccept = true);
    }
  }

  Future<void> _accept() async {
    await widget.onAccepted();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkGradientTop : AppColors.warmWhite;
    final cardBg = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : AppColors.lightCard;
    final textPrimary = isDark ? Colors.white : AppColors.lightTextPrimary;
    final textMuted = isDark
        ? Colors.white.withValues(alpha: 0.55)
        : AppColors.lightTextSecondary;
    final dividerColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.07);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 4),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.20)
                  : Colors.black.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 14),
            child: Column(
              children: [
                Image.asset('assets/logo.PNG', width: 44, height: 44),
                const SizedBox(height: 8),
                Text(
                  'Conditions Générales d\'Utilisation',
                  style: GoogleFonts.fraunces(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 3),
                Text(
                  'Version 1.0 — Juin 2026',
                  style: GoogleFonts.manrope(fontSize: 11.5, color: textMuted),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: dividerColor),
          // Scroll hint
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 300),
            crossFadeState:
                _canAccept ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            firstChild: Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.expand_more_rounded,
                      size: 14, color: AppColors.primary.withValues(alpha: 0.8)),
                  const SizedBox(width: 4),
                  Text(
                    'Faites défiler jusqu\'en bas pour accepter',
                    style: GoogleFonts.manrope(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            secondChild: const SizedBox(height: 0),
          ),
          // Scrollable content
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollCtrl,
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Text(
                    'Bienvenue sur Haven. En utilisant cette application, vous acceptez les conditions ci-dessous. Veuillez les lire attentivement avant de continuer.',
                    style: GoogleFonts.manrope(fontSize: 13, color: textMuted, height: 1.65),
                  ),
                  const SizedBox(height: 20),

                  // Key points
                  _keyPoint(Icons.lock_outline_rounded, 'Confidentialité',
                      'Vos données restent au sein de l\'établissement et ne sont jamais transmises à des tiers à des fins commerciales.',
                      cardBg, textPrimary, textMuted),
                  const SizedBox(height: 10),
                  _keyPoint(Icons.manage_accounts_outlined, 'Niveaux d\'anonymat',
                      'Vous choisissez votre niveau d\'anonymat (complet, semi-anonyme, identité visible) lors de chaque signalement.',
                      cardBg, textPrimary, textMuted),
                  const SizedBox(height: 10),
                  _keyPoint(Icons.shield_outlined, 'Données des mineurs',
                      'Les données des utilisateurs mineurs bénéficient d\'une protection renforcée (RGPD, art. 8). Aucune utilisation commerciale ni profilage.',
                      cardBg, textPrimary, textMuted),
                  const SizedBox(height: 10),
                  _keyPoint(Icons.gavel_rounded, 'Signalements sincères',
                      'L\'application est réservée aux signalements de bonne foi. Tout abus peut engager la responsabilité pénale (art. 226-10 Code pénal — dénonciation calomnieuse).',
                      cardBg, textPrimary, textMuted),
                  const SizedBox(height: 24),

                  // Article 4 — Anonymity lifting (crucial)
                  _anonymityBox(textPrimary, textMuted, isDark),
                  const SizedBox(height: 24),

                  // Links to full documents
                  Text(
                    'DOCUMENTS COMPLETS',
                    style: GoogleFonts.manrope(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _docLink(
                    context,
                    Icons.article_outlined,
                    'Conditions Générales d\'Utilisation',
                    () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const CguPage())),
                    cardBg,
                    textPrimary,
                  ),
                  const SizedBox(height: 8),
                  _docLink(
                    context,
                    Icons.privacy_tip_outlined,
                    'Politique de confidentialité',
                    () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PrivacyPage())),
                    cardBg,
                    textPrimary,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'En appuyant sur « J\'accepte et continuer », vous reconnaissez avoir pris connaissance des Conditions Générales d\'Utilisation et de la Politique de confidentialité de Haven, y compris les dispositions relatives à la levée de l\'anonymat prévues par la loi.',
                    style: GoogleFonts.manrope(
                      fontSize: 11,
                      color: textMuted,
                      height: 1.65,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          // Fixed accept button
          Container(
            padding: EdgeInsets.fromLTRB(
                20, 12, 20, MediaQuery.of(context).padding.bottom + 16),
            decoration: BoxDecoration(
              color: bg,
              border: Border(top: BorderSide(color: dividerColor)),
            ),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: AnimatedOpacity(
                opacity: _canAccept ? 1.0 : 0.45,
                duration: const Duration(milliseconds: 300),
                child: ElevatedButton(
                  onPressed: _canAccept ? _accept : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: AppColors.primary,
                    disabledForegroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    _canAccept ? 'J\'accepte et continuer' : 'Faites défiler pour accepter',
                    style: GoogleFonts.manrope(
                        fontSize: 15, fontWeight: FontWeight.w700, letterSpacing: 0.1),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _keyPoint(IconData icon, String title, String body, Color cardBg,
      Color textPrimary, Color textMuted) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, color: AppColors.primary, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.manrope(
                        fontSize: 13, fontWeight: FontWeight.w700, color: textPrimary)),
                const SizedBox(height: 3),
                Text(body,
                    style: GoogleFonts.manrope(fontSize: 12, color: textMuted, height: 1.55)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _anonymityBox(Color textPrimary, Color textMuted, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.07),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 16),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Point important — Levée de l\'anonymat',
                  style: GoogleFonts.manrope(
                      fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'L\'anonymat choisi n\'est pas un droit absolu et peut être levé sans consentement préalable dans les cas suivants :',
            style: GoogleFonts.manrope(fontSize: 12.5, color: textPrimary, height: 1.6),
          ),
          const SizedBox(height: 10),
          _bulletItem(
              'Obligation légale de signalement (art. 40 CPP — fonctionnaires ; art. L226-2-1 CASF — enfant en danger)',
              textPrimary),
          const SizedBox(height: 6),
          _bulletItem(
              'Réquisition judiciaire dans le cadre d\'une enquête pénale ou d\'une instruction',
              textPrimary),
          const SizedBox(height: 6),
          _bulletItem(
              'Danger grave et imminent pour l\'intégrité d\'un élève (art. 222-33-2-3 Code pénal — harcèlement scolaire)',
              textPrimary),
        ],
      ),
    );
  }

  Widget _bulletItem(String text, Color textPrimary) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 7),
          child: Container(
            width: 5,
            height: 5,
            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text,
              style: GoogleFonts.manrope(fontSize: 12, color: textPrimary, height: 1.6)),
        ),
      ],
    );
  }

  Widget _docLink(BuildContext context, IconData icon, String label,
      VoidCallback onTap, Color cardBg, Color textPrimary) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(label,
                  style: GoogleFonts.manrope(
                      fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                size: 13, color: AppColors.primary.withValues(alpha: 0.6)),
          ],
        ),
      ),
    );
  }
}
