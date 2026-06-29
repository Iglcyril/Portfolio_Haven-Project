import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class PrivacyPage extends StatelessWidget {
  const PrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkGradientTop : AppColors.warmWhite;
    final textPrimary = isDark ? Colors.white : AppColors.lightTextPrimary;
    final textMuted = isDark
        ? Colors.white.withValues(alpha: 0.60)
        : AppColors.lightTextSecondary;
    final cardBg = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : AppColors.lightCard;

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
          'Confidentialité',
          style: TextStyle(fontFamily: 'Manrope', fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 4, 24, 56),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Politique de confidentialité',
              style: TextStyle(fontFamily: 'Fraunces', 
                fontSize: 26,
                fontWeight: FontWeight.w600,
                color: textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Application Haven — Version 1.0 — Juin 2026',
              style: TextStyle(fontFamily: 'Manrope', fontSize: 12, color: textMuted, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 32),

            _Section(
              number: '1',
              title: 'Responsable du traitement',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Le responsable du traitement des données collectées via l\'application Haven est l\'établissement scolaire qui déploie l\'application auprès de ses utilisateurs. À ce titre, l\'établissement détermine les finalités et les moyens du traitement conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée (loi Informatique et Libertés).', textMuted),
              ],
            ),

            _Section(
              number: '2',
              title: 'Données collectées',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Selon le niveau d\'anonymat choisi par l\'utilisateur lors d\'un signalement, Haven collecte tout ou partie des données suivantes :', textMuted),
                const SizedBox(height: 10),
                _SubSection('Données d\'identification', textPrimary),
                const SizedBox(height: 6),
                _Bullet('Adresse e-mail (pour les comptes professionnels)', textMuted),
                _Bullet('Nom et prénom (uniquement en mode « Identité visible »)', textMuted),
                _Bullet('Classe de l\'élève (en mode « Semi-anonyme » ou « Identité visible »)', textMuted),
                const SizedBox(height: 10),
                _SubSection('Données liées au signalement', textPrimary),
                const SizedBox(height: 6),
                _Bullet('Contenu textuel du signalement', textMuted),
                _Bullet('Niveau d\'anonymat choisi', textMuted),
                _Bullet('Date et heure de soumission', textMuted),
                _Bullet('Pièces jointes transmises le cas échéant', textMuted),
                const SizedBox(height: 10),
                _SubSection('Données de suivi', textPrimary),
                const SizedBox(height: 6),
                _Bullet('Historique des actions menées sur le dossier par les personnels habilités', textMuted),
                _Bullet('Niveau de risque évalué', textMuted),
                _Bullet('Progression du traitement du dossier', textMuted),
                const SizedBox(height: 10),
                _SubSection('Données techniques', textPrimary),
                const SizedBox(height: 6),
                _Bullet('Logs de connexion (date, heure, identifiant de session)', textMuted),
                const SizedBox(height: 8),
                _Body('Aucun cookie tiers n\'est utilisé. Haven ne recourt à aucun outil de tracking publicitaire.', textMuted),
              ],
            ),

            _Section(
              number: '3',
              title: 'Base légale du traitement',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Le traitement des données repose sur les bases légales suivantes :', textMuted),
                const SizedBox(height: 8),
                _Bullet('Mission d\'intérêt public (art. 6.1.e RGPD) : le traitement s\'inscrit dans les missions légales de l\'établissement en matière de protection des élèves, conformément aux articles L511-3-1 et L421-3 du Code de l\'éducation et à la loi n°2022-299 du 2 mars 2022 visant à combattre le harcèlement scolaire.', textMuted),
                _Bullet('Obligation légale (art. 6.1.c RGPD) : certains traitements découlent d\'obligations légales imposées à l\'établissement, notamment l\'article 40 du Code de procédure pénale et l\'article L226-2-1 du Code de l\'action sociale et des familles.', textMuted),
                _Bullet('Consentement (art. 6.1.a RGPD) pour les traitements non couverts par les bases précédentes.', textMuted),
              ],
            ),

            _Section(
              number: '4',
              title: 'Durée de conservation',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Les données sont conservées pour les durées suivantes, après quoi elles sont supprimées ou anonymisées de manière irréversible :', textMuted),
                const SizedBox(height: 12),
                _RetentionRow('Dossiers de signalement actifs', 'Durée de traitement + 1 an', cardBg, textPrimary, textMuted, isDark),
                const SizedBox(height: 6),
                _RetentionRow('Dossiers archivés', '5 ans à compter de la clôture', cardBg, textPrimary, textMuted, isDark),
                const SizedBox(height: 6),
                _RetentionRow('Logs de connexion', '12 mois glissants', cardBg, textPrimary, textMuted, isDark),
                const SizedBox(height: 6),
                _RetentionRow('Données compte professionnel', 'Durée d\'activité + 3 mois', cardBg, textPrimary, textMuted, isDark),
                const SizedBox(height: 10),
                _Body('Note : les durées indiquées pour les dossiers et les comptes professionnels sont des durées recommandées fondées sur les délais de prescription civile (art. 2224 Code civil) et les bonnes pratiques. La durée de 12 mois pour les logs de connexion est fondée sur le décret n°2011-219 du 25 février 2011.', textMuted),
              ],
            ),

            _Section(
              number: '5',
              title: 'Destinataires des données',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Les données collectées via Haven sont accessibles aux seules personnes habilitées au sein de l\'établissement :', textMuted),
                _Bullet('La direction et les co-responsables désignés', textMuted),
                _Bullet('Les référents assignés au dossier concerné', textMuted),
                const SizedBox(height: 8),
                _Body('Aucune donnée n\'est transmise à des tiers à des fins commerciales ou publicitaires.', textMuted),
                const SizedBox(height: 8),
                _Body('Les données peuvent être communiquées aux autorités compétentes (autorité judiciaire, services de protection de l\'enfance) dans les cas prévus à l\'article 4 des Conditions Générales d\'Utilisation (levée de l\'anonymat).', textMuted),
              ],
            ),

            _Section(
              number: '6',
              title: 'Protection des données des mineurs',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Haven est destinée en partie à des utilisateurs mineurs. À ce titre :', textMuted),
                _Bullet('Les données des mineurs bénéficient d\'une protection renforcée conformément à l\'article 8 du RGPD', textMuted),
                _Bullet('Le niveau d\'anonymat choisi est respecté dans le traitement courant du dossier', textMuted),
                _Bullet('Aucune donnée de mineur n\'est utilisée à des fins de profilage ou de traitement automatisé produisant des effets juridiques', textMuted),
              ],
            ),

            _Section(
              number: '7',
              title: 'Sécurité des données',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('L\'éditeur de Haven met en œuvre les mesures techniques et organisationnelles appropriées pour protéger les données contre tout accès non autorisé, toute divulgation, altération ou destruction. Les accès à l\'application sont authentifiés et les données transmises via des protocoles sécurisés (HTTPS/TLS).', textMuted),
                const SizedBox(height: 8),
                _Body('En cas de violation de données susceptible d\'engendrer un risque pour les droits et libertés des personnes, l\'établissement s\'engage à notifier la CNIL dans un délai de 72 heures conformément à l\'article 33 du RGPD, et les utilisateurs concernés si le risque est élevé (article 34 RGPD).', textMuted),
              ],
            ),

            _Section(
              number: '8',
              title: 'Droits des utilisateurs',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('Conformément aux articles 15 à 22 du RGPD, tout utilisateur dispose des droits suivants :', textMuted),
                _Bullet('Droit d\'accès : obtenir une copie des données le concernant', textMuted),
                _Bullet('Droit de rectification : faire corriger des données inexactes', textMuted),
                _Bullet('Droit à l\'effacement : demander la suppression de ses données, sous réserve des obligations légales de conservation', textMuted),
                _Bullet('Droit à la limitation : demander la suspension temporaire du traitement', textMuted),
                _Bullet('Droit d\'opposition : s\'opposer au traitement pour des raisons tenant à sa situation particulière', textMuted),
                _Bullet('Droit à la portabilité : recevoir ses données dans un format structuré et lisible', textMuted),
                const SizedBox(height: 8),
                _Body('Ces droits s\'exercent auprès du Délégué à la Protection des Données (DPO) de l\'établissement ou directement auprès de la direction.', textMuted),
                const SizedBox(height: 8),
                _Body('En cas de litige, l\'utilisateur peut introduire une réclamation auprès de la Commission Nationale de l\'Informatique et des Libertés (CNIL) — www.cnil.fr', textMuted),
              ],
            ),

            _Section(
              number: '9',
              title: 'Modifications',
              isDark: isDark,
              textPrimary: textPrimary,
              children: [
                _Body('La présente politique de confidentialité peut être mise à jour. Toute modification substantielle sera notifiée aux utilisateurs. La date de mise à jour figure en en-tête du document.', textMuted),
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
            style: TextStyle(fontFamily: 'Manrope', fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
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
    return Text(text, style: TextStyle(fontFamily: 'Manrope', fontSize: 13.5, color: color, height: 1.7));
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
      style: TextStyle(fontFamily: 'Manrope', fontSize: 13, fontWeight: FontWeight.w700, color: color),
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
          Expanded(child: Text(text, style: TextStyle(fontFamily: 'Manrope', fontSize: 13.5, color: color, height: 1.7))),
        ],
      ),
    );
  }
}

class _RetentionRow extends StatelessWidget {
  final String category, duration;
  final Color cardBg, textPrimary, textMuted;
  final bool isDark;

  const _RetentionRow(this.category, this.duration, this.cardBg, this.textPrimary, this.textMuted, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(category,
              style: TextStyle(fontFamily: 'Manrope', fontSize: 12.5, color: textPrimary, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: Text(duration,
              style: TextStyle(fontFamily: 'Manrope', fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w700),
              textAlign: TextAlign.right),
          ),
        ],
      ),
    );
  }
}
