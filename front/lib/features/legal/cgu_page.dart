import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

class CguPage extends StatelessWidget {
  const CguPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkGradientTop : AppColors.warmWhite;
    final textPrimary = isDark ? Colors.white : AppColors.lightTextPrimary;
    final textMuted = isDark
        ? Colors.white.withValues(alpha: 0.60)
        : AppColors.lightTextSecondary;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'CGU',
          style: GoogleFonts.manrope(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 4, 24, 56),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Conditions Générales d\'Utilisation',
              style: GoogleFonts.fraunces(
                fontSize: 26,
                fontWeight: FontWeight.w600,
                color: textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Application Haven — Version 1.0 — Juin 2026',
              style: GoogleFonts.manrope(fontSize: 12, color: textMuted, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 4),
            Text(
              'Plateforme de signalement du harcèlement scolaire',
              style: GoogleFonts.manrope(fontSize: 12, color: textMuted),
            ),
            const SizedBox(height: 32),

            _Section(
              number: '1',
              title: 'Objet',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Haven est une application mobile mise à disposition des élèves, parents d\'élèves et personnels de l\'éducation nationale permettant le signalement, le suivi et la gestion de situations de harcèlement ou de violence scolaire au sein d\'un établissement.', textMuted),
                const SizedBox(height: 8),
                _Body('L\'utilisation de Haven implique l\'acceptation sans réserve des présentes CGU.', textMuted),
              ],
            ),

            _Section(
              number: '2',
              title: 'Accès et utilisateurs',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Haven est accessible aux catégories suivantes d\'utilisateurs :', textMuted),
                _Bullet('Élèves de l\'établissement', textMuted),
                _Bullet('Parents ou responsables légaux d\'un élève de l\'établissement', textMuted),
                _Bullet('Personnels de l\'éducation nationale (direction, référents, CPE, etc.) habilités par l\'établissement', textMuted),
                const SizedBox(height: 8),
                _Body('L\'accès est subordonné à une authentification sécurisée fournie par l\'établissement. Tout accès non autorisé est interdit.', textMuted),
              ],
            ),

            _Section(
              number: '3',
              title: 'Données personnelles et anonymat',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Haven permet à l\'utilisateur de choisir, lors d\'un signalement, un niveau d\'anonymat parmi :', textMuted),
                _Bullet('Anonymat complet', textMuted),
                _Bullet('Semi-anonymat (classe communiquée, identité masquée)', textMuted),
                _Bullet('Identité visible', textMuted),
                const SizedBox(height: 8),
                _Body('Ce choix détermine les informations transmises aux personnels de l\'établissement dans le cadre du traitement ordinaire du dossier.', textMuted),
                const SizedBox(height: 8),
                _Body('Les données collectées sont traitées conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée (loi Informatique et Libertés). L\'établissement agit en qualité de responsable de traitement. Les données ne sont en aucun cas cédées à des tiers à des fins commerciales.', textMuted),
                const SizedBox(height: 8),
                _Body('Les utilisateurs mineurs bénéficient de protections renforcées conformément à l\'article 8 du RGPD.', textMuted),
              ],
            ),

            _Section(
              number: '4',
              title: 'Levée de l\'anonymat',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Le choix d\'anonymat exercé par l\'utilisateur est respecté dans le cadre du traitement courant des signalements. Il ne constitue cependant pas un droit absolu et peut être levé dans les cas suivants, sans que le consentement préalable de l\'utilisateur soit requis :', textMuted),
                const SizedBox(height: 14),
                _SubSection('4.1 — Obligation légale de signalement', textPrimary),
                const SizedBox(height: 6),
                _Body('Conformément à l\'article 40 du Code de procédure pénale, tout fonctionnaire ou agent public qui, dans l\'exercice de ses fonctions, a connaissance d\'un crime ou d\'un délit est tenu d\'en informer sans délai le Procureur de la République. Les personnels de l\'établissement utilisant Haven sont soumis à cette obligation.', textMuted),
                const SizedBox(height: 8),
                _Body('Conformément à l\'article L226-2-1 du Code de l\'action sociale et des familles (CASF), tout professionnel qui intervient auprès de mineurs et qui estime qu\'un enfant est en danger ou risque de l\'être est tenu de transmettre une information préoccupante à la cellule départementale de recueil, de traitement et d\'évaluation (CRIP).', textMuted),
                const SizedBox(height: 8),
                _Body('Dans ces hypothèses, les données permettant l\'identification de la victime, du ou des auteurs et des témoins pourront être transmises aux autorités compétentes (autorité judiciaire, services de protection de l\'enfance, forces de l\'ordre).', textMuted),
                const SizedBox(height: 14),
                _SubSection('4.2 — Réquisition judiciaire', textPrimary),
                const SizedBox(height: 6),
                _Body('En application du Code de procédure pénale, Haven et l\'établissement sont tenus de déférer à toute réquisition judiciaire émanant d\'une autorité judiciaire compétente ordonnant la communication de données nominatives dans le cadre d\'une enquête pénale ou d\'une instruction.', textMuted),
                const SizedBox(height: 14),
                _SubSection('4.3 — Danger grave et imminent', textPrimary),
                const SizedBox(height: 6),
                _Body('Lorsqu\'une situation signalée via Haven révèle un danger grave et imminent pour l\'intégrité physique ou psychique d\'un élève (tentative de suicide, violences graves, infractions pénales caractérisées au sens des articles 222-33-2-3 et suivants du Code pénal relatifs au harcèlement scolaire), l\'établissement se réserve le droit de lever l\'anonymat dans la stricte mesure nécessaire à la protection de la personne concernée.', textMuted),
                const SizedBox(height: 14),
                _Body('En utilisant Haven, l\'utilisateur reconnaît avoir été informé de ces exceptions légales et y consent expressément.', textMuted),
              ],
            ),

            _Section(
              number: '5',
              title: 'Obligations des utilisateurs',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('L\'utilisateur s\'engage à :', textMuted),
                _Bullet('Utiliser Haven exclusivement pour des signalements sincères et de bonne foi', textMuted),
                _Bullet('Ne pas effectuer de faux signalements ou de signalements malveillants', textMuted),
                _Bullet('Ne pas tenter d\'accéder aux données d\'autres utilisateurs', textMuted),
                _Bullet('Respecter la confidentialité des informations auxquelles il aurait accès dans le cadre de l\'application', textMuted),
                const SizedBox(height: 8),
                _Body('Tout usage abusif ou frauduleux est susceptible d\'engager la responsabilité civile et/ou pénale de son auteur, notamment au titre de l\'article 226-10 du Code pénal (dénonciation calomnieuse).', textMuted),
              ],
            ),

            _Section(
              number: '6',
              title: 'Obligations de l\'établissement',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('L\'établissement s\'engage à :', textMuted),
                _Bullet('Traiter chaque signalement avec diligence et confidentialité', textMuted),
                _Bullet('Former les personnels habilités à l\'utilisation de Haven et aux obligations légales afférentes', textMuted),
                _Bullet('Désigner un Délégué à la Protection des Données (DPO) conformément au RGPD', textMuted),
                _Bullet('Informer les utilisateurs en cas de violation de données (article 33 RGPD)', textMuted),
              ],
            ),

            _Section(
              number: '7',
              title: 'Responsabilité',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Haven est un outil d\'aide au signalement. Il ne se substitue pas aux procédures légales et réglementaires en vigueur dans l\'Éducation nationale. L\'éditeur de l\'application ne saurait être tenu responsable des décisions prises par l\'établissement dans le traitement des signalements.', textMuted),
              ],
            ),

            _Section(
              number: '8',
              title: 'Modification des CGU',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront notifiés de toute modification substantielle. La poursuite de l\'utilisation de Haven après notification vaut acceptation des nouvelles CGU.', textMuted),
              ],
            ),

            _Section(
              number: '9',
              title: 'Contact et DPO',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Pour toute question relative aux présentes CGU ou à l\'exercice de vos droits (accès, rectification, suppression, portabilité — articles 15 à 22 du RGPD), vous pouvez contacter :', textMuted),
                _Bullet('La direction de votre établissement', textMuted),
                _Bullet('Le Délégué à la Protection des Données de l\'établissement', textMuted),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Sub-widgets ─────────────────────────────────────────────────────────────

class _Section extends StatelessWidget {
  final String number, title;
  final bool isDark;
  final Color textPrimary;
  final List<Widget> children;

  const _Section({
    required this.number,
    required this.title,
    required this.isDark,
    required this.textPrimary,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.08),
            borderRadius: BorderRadius.circular(9),
            border: const Border(left: BorderSide(color: AppColors.primary, width: 3)),
          ),
          child: Text(
            'Article $number — $title',
            style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
          ),
        ),
        const SizedBox(height: 12),
        ...children,
        const SizedBox(height: 28),
      ],
    );
  }
}

class _Body extends StatelessWidget {
  final String text;
  final Color color;
  const _Body(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: GoogleFonts.manrope(fontSize: 13.5, color: color, height: 1.7));
  }
}

class _SubSection extends StatelessWidget {
  final String text;
  final Color color;
  const _SubSection(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w700, color: color),
    );
  }
}

class _Bullet extends StatelessWidget {
  final String text;
  final Color color;
  const _Bullet(this.text, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 9),
            child: Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: GoogleFonts.manrope(fontSize: 13.5, color: color, height: 1.7))),
        ],
      ),
    );
  }
}
