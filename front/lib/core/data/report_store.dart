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
  bool crisisDetected;
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
    this.crisisDetected = false,
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

  final List<HavenReport> reports = [];

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

