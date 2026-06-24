import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
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
  String? _token;
  bool _disposed = false;

  final _alertController = StreamController<CrisisAlert>.broadcast();
  Stream<CrisisAlert> get alerts => _alertController.stream;

  static String get _wsBase {
    if (Platform.isAndroid) return 'ws://10.0.2.2:4000';
    return 'ws://localhost:4000';
  }

  Future<void> connect() async {
    if (_channel != null) return;
    _token = await StorageService.getToken();
    if (_token == null) return;
    _disposed = false;
    _doConnect();
  }

  void _doConnect() {
    if (_token == null || _disposed) return;
    try {
      final uri = Uri.parse('$_wsBase/ws?token=$_token');
      _channel = WebSocketChannel.connect(uri);
      _sub = _channel!.stream.listen(
        _onMessage,
        onDone: _onDisconnected,
        onError: (_) => _onDisconnected(),
        cancelOnError: false,
      );
    } catch (_) {
      _scheduleReconnect();
    }
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
    _token = null;
  }
}
