import 'dart:io';

class ApiConfig {
  static const _envUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_envUrl.isNotEmpty) return _envUrl;
    if (Platform.isAndroid) return 'http://10.0.2.2:4000';
    return 'http://localhost:4000';
  }

  static String get wsUrl =>
      baseUrl.replaceFirst('https://', 'wss://').replaceFirst('http://', 'ws://');
}
