import 'package:flutter/material.dart';

// ─── Types d'événements ───────────────────────────────────────────────────────

const List<String> kEventTypes = [
  'Entretien élève',
  'Contact parents',
  'Réunion d\'équipe',
  'Orientation médicale',
  'Note de suivi',
  'Appel téléphonique',
];

const Map<String, IconData> kEventIcons = {
  'Entretien élève': Icons.person_rounded,
  'Contact parents': Icons.family_restroom_rounded,
  'Réunion d\'équipe': Icons.groups_rounded,
  'Orientation médicale': Icons.medical_services_outlined,
  'Note de suivi': Icons.edit_note_rounded,
  'Appel téléphonique': Icons.phone_rounded,
};

const Map<String, Color> kEventColors = {
  'Entretien élève': Color(0xFF2EAB7B),
  'Contact parents': Color(0xFFE67E22),
  'Réunion d\'équipe': Color(0xFF7C5CBF),
  'Orientation médicale': Color(0xFFC0392B),
  'Note de suivi': Color(0xFF4A90D9),
  'Appel téléphonique': Color(0xFF27AE60),
};

// ─── Étapes de la progress bar ────────────────────────────────────────────────

const List<String> kProgressSteps = [
  'Reçu',
  'Prise en charge',
  'Suivi en cours',
  'Résolu',
];

// ─── Modèles ──────────────────────────────────────────────────────────────────

class ReportEvent {
  final String type;
  final String? comment;
  final DateTime createdAt;

  const ReportEvent({
    required this.type,
    this.comment,
    required this.createdAt,
  });
}

class HavenReport {
  final String caseNumber;
  final String anonLevel;
  final String? studentClass;
  final String? studentName;
  final String initialText;
  final DateTime submittedAt;

  String? riskLevel;
  bool isAssigned;
  String? assignedTo;
  bool isResolved;
  bool isArchivedByDirector;
  bool isArchivedByReferent;
  int progressStage; // 0 = Reçu, 1 = Prise en charge, 2 = Suivi en cours, 3 = Résolu
  final List<ReportEvent> events;

  HavenReport({
    required this.caseNumber,
    required this.anonLevel,
    this.studentClass,
    this.studentName,
    required this.initialText,
    required this.submittedAt,
    this.riskLevel,
    this.isAssigned = false,
    this.assignedTo,
    this.isResolved = false,
    this.isArchivedByDirector = false,
    this.isArchivedByReferent = false,
    this.progressStage = 0,
    List<ReportEvent>? events,
  }) : events = events ?? [];
}

// ─── Singleton store ──────────────────────────────────────────────────────────

class ReportStore extends ChangeNotifier {
  static final ReportStore instance = ReportStore._();
  ReportStore._();

  final List<HavenReport> reports = _buildMockReports();

  void notify() => notifyListeners();

  void archiveByDirector(HavenReport r) {
    r.isArchivedByDirector = true;
    notifyListeners();
  }

  void archiveByReferent(HavenReport r) {
    r.isArchivedByReferent = true;
    notifyListeners();
  }

  void advanceStage(HavenReport r) {
    if (r.progressStage < 3) {
      r.progressStage++;
      if (r.progressStage == 3) r.isResolved = true;
      notifyListeners();
    }
  }

  void addEvent(HavenReport r, ReportEvent event) {
    r.events.add(event);
    notifyListeners();
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

List<HavenReport> _buildMockReports() => [
      HavenReport(
        caseNumber: '#HVN-9102',
        anonLevel: 'Anonyme',
        initialText:
            'Moqueries répétées signalées dans une classe de 4ème. Plusieurs élèves semblent impliqués dans des comportements d\'exclusion quotidiens.',
        submittedAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
      HavenReport(
        caseNumber: '#HVN-9098',
        anonLevel: 'Semi-anonyme',
        studentClass: '4ème A',
        initialText:
            'Comportement d\'intimidation dans les couloirs. L\'élève concerné refuse de s\'alimenter à la cantine depuis plusieurs jours.',
        submittedAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      HavenReport(
        caseNumber: '#HVN-9091',
        anonLevel: 'Identité visible',
        studentName: 'Lucie Fontaine',
        studentClass: '3ème B',
        initialText:
            'Cyberharcèlement via Instagram entre plusieurs élèves de 3ème B. Des captures d\'écran ont été jointes au dossier.',
        submittedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      HavenReport(
        caseNumber: '#HVN-9088',
        anonLevel: 'Anonyme',
        initialText:
            'Violences verbales quotidiennes signalées par un élève de 6ème de la part d\'un groupe de camarades.',
        submittedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      // Attribués à Sophie Martin — permet de tester le dashboard référent
      HavenReport(
        caseNumber: '#HVN-9085',
        anonLevel: 'Semi-anonyme',
        studentClass: '5ème C',
        initialText:
            'Un élève signale des brimades lors des cours de sport. L\'enseignant d\'EPS a également été alerté par un autre élève.',
        submittedAt: DateTime.now().subtract(const Duration(days: 3)),
        isAssigned: true,
        assignedTo: 'Sophie Martin',
        riskLevel: 'Moyen',
        progressStage: 1,
        events: [
          ReportEvent(
            type: 'Entretien élève',
            comment: 'Premier contact établi. L\'élève a accepté de parler.',
            createdAt: DateTime.now().subtract(const Duration(days: 2, hours: 4)),
          ),
        ],
      ),
      HavenReport(
        caseNumber: '#HVN-9079',
        anonLevel: 'Identité visible',
        studentName: 'Thomas Leroy',
        studentClass: '2nde A',
        initialText:
            'Mise à l\'écart systématique d\'un élève par son groupe de classe. La situation dure depuis le début du trimestre.',
        submittedAt: DateTime.now().subtract(const Duration(days: 5)),
        isAssigned: true,
        assignedTo: 'Sophie Martin',
        riskLevel: 'Faible',
        progressStage: 0,
      ),
    ];
