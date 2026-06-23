import 'dart:convert';
import 'api_client.dart';

// ─── Modèles API ──────────────────────────────────────────────────────────────

class ApiAssignee {
  final String id;
  final String? firstName;
  final String? lastName;
  final String email;

  const ApiAssignee({
    required this.id,
    this.firstName,
    this.lastName,
    required this.email,
  });

  String get fullName {
    final combined = '${firstName ?? ''} ${lastName ?? ''}'.trim();
    return combined.isNotEmpty ? combined : email;
  }

  factory ApiAssignee.fromJson(Map<String, dynamic> j) => ApiAssignee(
        id: j['id'] as String,
        firstName: j['firstName'] as String?,
        lastName: j['lastName'] as String?,
        email: j['email'] as String,
      );
}

class ApiStaffEvent {
  final String id;
  final String type;
  final String? comment;
  final DateTime createdAt;

  const ApiStaffEvent({
    required this.id,
    required this.type,
    this.comment,
    required this.createdAt,
  });
}

class ApiReport {
  final String id;
  final String trackingId;
  final String type;          // 'victime' | 'temoin'
  final String categorie;
  final String anonymatLevel; // 'total' | 'partiel' | 'pas_anonyme'
  final bool crisisDetected;
  final String status;        // 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'ARCHIVE'
  final String severity;      // 'BAS' | 'MOYEN' | 'ELEVE'
  final DateTime createdAt;
  final ApiAssignee? assignedTo;
  final String? deposition;
  final String? studentName;
  final String? studentClass;
  final List<ApiStaffEvent> staffEvents;

  const ApiReport({
    required this.id,
    required this.trackingId,
    required this.type,
    required this.categorie,
    required this.anonymatLevel,
    required this.crisisDetected,
    required this.status,
    required this.severity,
    required this.createdAt,
    this.assignedTo,
    this.deposition,
    this.studentName,
    this.studentClass,
    this.staffEvents = const [],
  });

  factory ApiReport.fromJson(Map<String, dynamic> j) {
    final msgs = j['messages'] as List?;
    String? deposition;
    final staffEvents = <ApiStaffEvent>[];

    if (msgs != null) {
      for (final raw in msgs) {
        final msg = raw as Map<String, dynamic>;
        final sender = msg['sender'] as String? ?? '';
        if (sender == 'USER' && deposition == null) {
          deposition = msg['content'] as String?;
        } else if (sender == 'STAFF') {
          try {
            final content = msg['content'] as String? ?? '';
            final parsed = jsonDecode(content) as Map<String, dynamic>;
            staffEvents.add(ApiStaffEvent(
              id:        msg['id'] as String,
              type:      parsed['type'] as String? ?? 'Autre',
              comment:   parsed['comment'] as String?,
              createdAt: DateTime.parse(msg['createdAt'] as String),
            ));
          } catch (_) { /* skip malformed */ }
        }
      }
    }

    final userMap = j['user'] as Map<String, dynamic>?;
    final firstName = userMap?['firstName'] as String?;
    final lastName  = userMap?['lastName']  as String?;
    final nameParts = [firstName, lastName].whereType<String>().where((s) => s.isNotEmpty).toList();
    final studentName = nameParts.isNotEmpty ? nameParts.join(' ') : null;

    final summaryMap = j['summary'] as Map<String, dynamic>?;
    final studentClass = summaryMap?['classLevel'] as String?;

    return ApiReport(
      id:            j['id'] as String,
      trackingId:    j['trackingId'] as String,
      type:          j['type'] as String,
      categorie:     j['categorie'] as String,
      anonymatLevel: j['anonymatLevel'] as String? ?? 'total',
      crisisDetected: j['crisisDetected'] as bool? ?? false,
      status:        j['status'] as String,
      severity:      j['severity'] as String? ?? 'BAS',
      createdAt:     DateTime.parse(j['createdAt'] as String),
      assignedTo:    j['assignedTo'] != null
          ? ApiAssignee.fromJson(j['assignedTo'] as Map<String, dynamic>)
          : null,
      deposition:    deposition,
      studentName:   studentName,
      studentClass:  studentClass,
      staffEvents:   staffEvents,
    );
  }
}

class ApiChild {
  final String id;
  final String? firstName;
  final String? lastName;
  final String email;
  final List<ApiReport> reports;

  const ApiChild({
    required this.id,
    this.firstName,
    this.lastName,
    required this.email,
    required this.reports,
  });

  String get displayName {
    final combined = '${firstName ?? ''} ${lastName ?? ''}'.trim();
    return combined.isNotEmpty ? combined : email;
  }

  factory ApiChild.fromJson(Map<String, dynamic> j) => ApiChild(
        id: j['id'] as String,
        firstName: j['firstName'] as String?,
        lastName: j['lastName'] as String?,
        email: j['email'] as String,
        reports: (j['reports'] as List? ?? [])
            .map((r) => ApiReport.fromJson(r as Map<String, dynamic>))
            .toList(),
      );
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ReportService {
  /// GET /reports — signalements de l'élève connecté (retourne un tableau JSON)
  static Future<List<ApiReport>> getStudentReports() async {
    final data = await ApiClient.get('/reports');
    return (data as List)
        .map((r) => ApiReport.fromJson(r as Map<String, dynamic>))
        .toList();
  }

  /// GET /admin/reports — tous les signalements (SUPERVISOR / ADMIN)
  /// Retourne { data: [...], total: n }
  static Future<List<ApiReport>> getAdminReports() async {
    final data = (await ApiClient.get('/admin/reports')) as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list
        .map((r) => ApiReport.fromJson(r as Map<String, dynamic>))
        .toList();
  }

  /// GET /parents/children/reports — signalements des enfants liés
  /// Retourne { total_children: n, children: [...] }
  static Future<List<ApiChild>> getChildrenReports() async {
    final data = (await ApiClient.get('/parents/children/reports')) as Map<String, dynamic>;
    final list = data['children'] as List? ?? [];
    return list
        .map((c) => ApiChild.fromJson(c as Map<String, dynamic>))
        .toList();
  }

  /// DELETE /reports/:code — annule un signalement dans les 5 minutes
  static Future<void> deleteReport(String trackingId) async {
    await ApiClient.delete('/reports/$trackingId');
  }

  /// PATCH /admin/reports/:code — met à jour la sévérité (SUPERVISOR / ADMIN)
  /// [severity] : 'BAS' | 'MOYEN' | 'ELEVE'
  static Future<void> updateSeverity(String trackingId, String severity) async {
    await ApiClient.patch('/admin/reports/$trackingId', {'level': severity});
  }

  /// PATCH /admin/reports/:code — met à jour le statut (SUPERVISOR / ADMIN)
  /// [status] : 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'ARCHIVE'
  static Future<void> updateStatus(String trackingId, String status) async {
    await ApiClient.patch('/admin/reports/$trackingId', {'status': status});
  }

  /// POST /admin/reports/:code/events — persiste une action de suivi
  static Future<void> saveEvent(String trackingId, String type, {String? comment}) async {
    await ApiClient.post('/admin/reports/$trackingId/events', {
      'type': type,
      if (comment != null && comment.isNotEmpty) 'comment': comment,
    });
  }
}
