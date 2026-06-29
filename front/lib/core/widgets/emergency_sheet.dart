import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';

// ─── Données ──────────────────────────────────────────────────────────────────

class _Contact {
  final String number;
  final String label;
  final String description;
  final Color color;
  const _Contact({
    required this.number,
    required this.label,
    required this.description,
    required this.color,
  });
}

const _contacts = [
  _Contact(number: '3020', label: 'Non au harcèlement', description: 'Harcèlement scolaire',     color: AppColors.primary),
  _Contact(number: '3114', label: 'Prévention suicide',  description: 'Numéro national',          color: Color(0xFF8ED4BF)),
  _Contact(number: '119',  label: 'Enfance en danger',   description: 'Allô enfance en danger',   color: Color(0xFF00A176)),
  _Contact(number: '15',   label: 'SAMU',                description: 'Urgence médicale',         color: Color(0xFFFF6B6B)),
  _Contact(number: '17',   label: 'Police',              description: 'Urgence sécurité',         color: Color(0xFF4A90D9)),
  _Contact(number: '18',   label: 'Pompiers',            description: 'Urgence incendie',         color: Color(0xFFFF8C42)),
];

// ─── Point d'entrée public ────────────────────────────────────────────────────

void showEmergencySheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _EmergencySheetContent(),
  );
}

// ─── Contenu de la feuille ────────────────────────────────────────────────────

class _EmergencySheetContent extends StatelessWidget {
  const _EmergencySheetContent();

  Future<void> _call(String number) async {
    final uri = Uri(scheme: 'tel', path: number);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF1A3832) : Colors.white;
    final textPrimary  = isDark ? Colors.white : AppColors.lightTextPrimary;
    final textSecondary = isDark
        ? Colors.white.withValues(alpha: 0.50)
        : AppColors.lightTextSecondary;

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Indicateur de glissement
          const SizedBox(height: 10),
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.20)
                  : Colors.black.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          // Titre
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE53935).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.phone_outlined,
                    color: Color(0xFFE53935),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Numéros d'urgence",
                      style: TextStyle(fontFamily: 'Fraunces', 
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      'Appuie sur un numéro pour composer',
                      style: TextStyle(fontFamily: 'Manrope', 
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Liste des numéros
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Column(
              children: _contacts.map((c) => _ContactTile(
                contact: c,
                isDark: isDark,
                onTap: () => _call(c.number),
              )).toList(),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// ─── Tuile d'un numéro ────────────────────────────────────────────────────────

class _ContactTile extends StatelessWidget {
  final _Contact contact;
  final bool isDark;
  final VoidCallback onTap;

  const _ContactTile({
    required this.contact,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final textPrimary = isDark ? Colors.white : AppColors.lightTextPrimary;
    final textSecondary = isDark
        ? Colors.white.withValues(alpha: 0.50)
        : AppColors.lightTextSecondary;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.06)
                : contact.color.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: contact.color.withValues(alpha: isDark ? 0.20 : 0.18),
            ),
          ),
          child: Row(
            children: [
              // Badge numéro
              Container(
                width: 52,
                height: 36,
                decoration: BoxDecoration(
                  color: contact.color.withValues(alpha: isDark ? 0.20 : 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  contact.number,
                  style: TextStyle(fontFamily: 'Manrope', 
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: contact.color,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Label + description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contact.label,
                      style: TextStyle(fontFamily: 'Manrope', 
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    Text(
                      contact.description,
                      style: TextStyle(fontFamily: 'Manrope', 
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.phone_rounded,
                size: 16,
                color: contact.color.withValues(alpha: 0.70),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
