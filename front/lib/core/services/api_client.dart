import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  const ApiException(this.message, this.statusCode);
  @override
  String toString() => message;
}

class ApiClient {
  static String get _baseUrl {
    if (Platform.isAndroid) return 'http://10.0.2.2:4000';
    return 'http://localhost:4000';
  }

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

    final uri = Uri.parse('$_baseUrl$path');
    final encoded = body != null ? jsonEncode(body) : null;

    final http.Response response;
    switch (method) {
      case 'POST':
        response = await http.post(uri, headers: headers, body: encoded);
      case 'PATCH':
        response = await http.patch(uri, headers: headers, body: encoded);
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
      default:
        response = await http.get(uri, headers: headers);
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
