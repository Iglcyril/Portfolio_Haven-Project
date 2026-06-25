import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';
import 'api_config.dart';
import 'storage_service.dart';

class CrisisAlert {
  final String trackingCode;
  final String category;
  const CrisisAlert({required this.trackingCode, required this.category});
}

class WebSocketService {
  WebSocketService._();
  static final WebSocketService instance = WebSocketService._();

  WebSocketChannel? _channel;
  StreamSubscription? _sub;
  bool _disposed = false;

  final _alertController = StreamController<CrisisAlert>.broadcast();
  Stream<CrisisAlert> get alerts => _alertController.stream;

  Future<void> connect() async {
    if (_channel != null) return;
    _disposed = false;
    _doConnect();
  }

  void _doConnect() {
    _doConnectAsync().catchError((_) => _scheduleReconnect());
  }

  Future<void> _doConnectAsync() async {
    if (_disposed) return;

    final jwt = await StorageService.getToken();
    if (jwt == null) return;

    // Obtenir un token éphémère (30s, usage unique) pour ne pas exposer le JWT dans l'URL
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/ws/token'),
      headers: {'Authorization': 'Bearer $jwt'},
    );

    if (res.statusCode != 200 || _disposed) {
      _scheduleReconnect();
      return;
    }

    final wsToken = (jsonDecode(res.body) as Map<String, dynamic>)['token'] as String;
    final uri = Uri.parse('${ApiConfig.wsUrl}/ws?token=$wsToken');

    _channel = WebSocketChannel.connect(uri);
    _sub = _channel!.stream.listen(
      _onMessage,
      onDone: _onDisconnected,
      onError: (_) => _onDisconnected(),
      cancelOnError: false,
    );
  }

  void _onMessage(dynamic raw) {
    try {
      final data = jsonDecode(raw as String) as Map<String, dynamic>;
      if (data['type'] == 'crisis_alert') {
        _alertController.add(CrisisAlert(
          trackingCode: data['trackingCode'] as String? ?? '',
          category: data['category'] as String? ?? 'Urgence',
        ));
      }
    } catch (_) {}
  }

  void _onDisconnected() {
    _channel = null;
    _sub?.cancel();
    _sub = null;
    if (!_disposed) _scheduleReconnect();
  }

  void _scheduleReconnect() {
    Future.delayed(const Duration(seconds: 5), _doConnect);
  }

  void disconnect() {
    _disposed = true;
    _sub?.cancel();
    _channel?.sink.close();
    _channel = null;
  }
}
