import 'api_client.dart';
import 'storage_service.dart';

class AuthUser {
  final String id;
  final String email;
  final String role;
  final String? firstName;
  final String? lastName;

  const AuthUser({
    required this.id,
    required this.email,
    required this.role,
    this.firstName,
    this.lastName,
  });

  String get fullName {
    final first = firstName ?? '';
    final last = lastName ?? '';
    final combined = '$first $last'.trim();
    return combined.isNotEmpty ? combined : 'Utilisateur';
  }

  factory AuthUser._fromMap(Map<String, dynamic> map) => AuthUser(
        id: map['id'] as String,
        email: map['email'] as String,
        role: map['role'] as String,
        firstName: map['firstName'] as String?,
        lastName: map['lastName'] as String?,
      );
}

class AuthService {
  static AuthUser? _currentUser;
  static AuthUser? get currentUser => _currentUser;

  static Future<AuthUser> login(String email, String password) async {
    final data = await ApiClient.post('/auth/login', {
      'email': email,
      'password': password,
    });
    final token = data['token'] as String;
    await StorageService.saveToken(token);
    // login ne retourne pas firstName/lastName — on récupère le profil complet
    final profile = await ApiClient.get('/auth/profile');
    _currentUser = AuthUser._fromMap(profile as Map<String, dynamic>);
    return _currentUser!;
  }

  static Future<AuthUser> register({
    required String email,
    required String password,
    required String role,
    String? firstName,
    String? lastName,
    String? birthDate,
  }) async {
    final body = <String, dynamic>{
      'email': email,
      'password': password,
      'role': role,
      if (firstName != null) 'firstName': firstName,
      if (lastName != null) 'lastName': lastName,
      if (birthDate != null) 'birthDate': birthDate,
    };
    final data = await ApiClient.post('/auth/register', body);
    final token = data['token'] as String;
    await StorageService.saveToken(token);
    _currentUser = AuthUser._fromMap(data['user'] as Map<String, dynamic>);
    return _currentUser!;
  }

  static Future<void> logout() async {
    await StorageService.clearToken();
    _currentUser = null;
  }

  static Future<AuthUser?> restoreSession() async {
    final token = await StorageService.getToken();
    if (token == null) return null;
    try {
      final data = await ApiClient.get('/auth/profile');
      _currentUser = AuthUser._fromMap(data);
      return _currentUser;
    } catch (_) {
      await StorageService.clearToken();
      return null;
    }
  }
}
