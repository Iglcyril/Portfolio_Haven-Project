import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  const ApiException(this.message, this.statusCode);
  @override
  String toString() => message;
}

class ApiClient {
  static Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final token = await StorageService.getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final encoded = body != null ? jsonEncode(body) : null;

    const timeout = Duration(seconds: 10);

    final http.Response response;
    try {
      switch (method) {
        case 'POST':
          response = await http.post(uri, headers: headers, body: encoded).timeout(timeout);
        case 'PATCH':
          response = await http.patch(uri, headers: headers, body: encoded).timeout(timeout);
        case 'DELETE':
          response = await http.delete(uri, headers: headers).timeout(timeout);
        default:
          response = await http.get(uri, headers: headers).timeout(timeout);
      }
    } on TimeoutException {
      throw const ApiException('Le serveur ne répond pas. Vérifie ta connexion.', 408);
    } on SocketException {
      throw const ApiException('Impossible de joindre le serveur. Vérifie ta connexion.', 503);
    }

    final decoded = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    // Les erreurs sont toujours des objets JSON
    final err = decoded as Map<String, dynamic>;
    final msg = err['error'] ?? err['message'] ?? err['summary'] ?? 'Erreur ${response.statusCode}';
    throw ApiException(msg as String, response.statusCode);
  }

  static Future<dynamic> get(String path) => _request('GET', path);

  static Future<Map<String, dynamic>> post(
          String path, Map<String, dynamic> body) async =>
      (await _request('POST', path, body: body)) as Map<String, dynamic>;

  static Future<Map<String, dynamic>> patch(
          String path, Map<String, dynamic> body) async =>
      (await _request('PATCH', path, body: body)) as Map<String, dynamic>;

  static Future<Map<String, dynamic>> delete(String path) async =>
      (await _request('DELETE', path)) as Map<String, dynamic>;
}
