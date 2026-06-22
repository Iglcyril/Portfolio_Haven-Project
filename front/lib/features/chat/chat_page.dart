import 'dart:convert';
import 'dart:io';
import 'dart:ui' show ImageFilter;
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/anchor_background.dart';
import '../../core/widgets/circle_back_button.dart';
import '../../core/widgets/haven_app_bar.dart';
import '../report/anon_level.dart';
import '../../core/services/storage_service.dart';
import '../../core/services/api_client.dart';

class _Msg {
  final String? text;
  final bool isBot;
  final DateTime time;
  final File? media;
  final bool isVideo;

  const _Msg({
    this.text,
    required this.isBot,
    required this.time,
    this.media,
    this.isVideo = false,
  });
}

class ChatPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final AnonLevel anonLevel;
  final VoidCallback onSend;
  final String userName;
  final String userInitials;

  const ChatPage({
    super.key,
    required this.onToggleTheme,
    required this.anonLevel,
    required this.onSend,
    this.userName = 'Utilisateur',
    this.userInitials = '?',
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _picker = ImagePicker();
  final _speech = stt.SpeechToText();

  bool _speechReady = false;
  bool _listening = false;
  bool _botTyping = false;

  String? _sessionId;
  List<String> _choiceItems = [];
  late final DateTime _openedAt;

  static const _typebotId = 'my-typebot-9nx8sja';
  static const _typebotBase = 'https://typebot.co/api/v1';

  final List<_Msg> _messages = [];

  @override
  void initState() {
    super.initState();
    _openedAt = DateTime.now();
    _speech
        .initialize(
          onStatus: (s) {
            if (s == 'done' || s == 'notListening') {
              if (mounted) setState(() => _listening = false);
            }
          },
          onError: (_) {
            if (mounted) setState(() => _listening = false);
          },
        )
        .then((ok) {
          if (mounted) setState(() => _speechReady = ok);
        });
    _startTypebot();
  }

  Future<void> _startTypebot() async {
    if (mounted) setState(() => _botTyping = true);
    try {
      final token = await StorageService.getToken();
      final bodyMap = <String, dynamic>{};
      if (token != null) {
        bodyMap['prefilledVariables'] = {'token': token};
      }
      final res = await http.post(
        Uri.parse('$_typebotBase/typebots/$_typebotId/startChat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(bodyMap),
      );
      if (!mounted) return;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      _sessionId = data['sessionId'] as String?;
      _handleTypebotResponse(data);
    } catch (_) {
      if (mounted) setState(() => _botTyping = false);
    }
  }

  Future<void> _continueTypebot(String message) async {
    if (_sessionId == null) return;
    setState(() {
      _botTyping = true;
      _choiceItems = [];
    });
    try {
      final res = await http.post(
        Uri.parse('$_typebotBase/sessions/$_sessionId/continueChat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      );
      if (!mounted) return;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      _handleTypebotResponse(data);
    } catch (_) {
      if (mounted) setState(() => _botTyping = false);
    }
  }

  void _handleTypebotResponse(Map<String, dynamic> data) {
    final msgs = data['messages'] as List? ?? [];
    final input = data['input'] as Map<String, dynamic>?;

    final texts = <String>[];
    for (final m in msgs) {
      final t = _parseMessage(m as Map<String, dynamic>);
      if (t != null && t.isNotEmpty) texts.add(t);
    }

    List<String> choices = [];
    if (input != null && input['type'] == 'choice input') {
      final items = input['items'] as List? ?? [];
      choices = items
          .map((i) => (i as Map<String, dynamic>)['content'] as String? ?? '')
          .where((s) => s.isNotEmpty)
          .toList();
    }

    setState(() {
      for (final t in texts) {
        _messages.add(_Msg(text: t, isBot: true, time: DateTime.now()));
      }
      _choiceItems = choices;
      _botTyping = false;
    });
    for (final t in texts) {
      _tryLinkReport(t);
    }
    _scrollToBottom();
  }

  String? _parseMessage(Map<String, dynamic> msg) {
    if (msg['type'] != 'text') return null;
    final content = msg['content'] as Map<String, dynamic>?;
    if (content == null) return null;
    final richText = content['richText'] as List?;
    if (richText != null) return _extractRichText(richText);
    return content['plainText'] as String? ?? content['html'] as String?;
  }

  String _extractRichText(List richText) {
    final buffer = StringBuffer();
    for (final block in richText) {
      final b = block as Map<String, dynamic>;
      for (final child in (b['children'] as List? ?? [])) {
        buffer.write((child as Map<String, dynamic>)['text'] as String? ?? '');
      }
    }
    return buffer.toString().trim();
  }

  static final _trackingCodeRe = RegExp(r'HVN-[A-Z0-9]{4}-[A-Z0-9]{4}');

  Future<void> _tryLinkReport(String text) async {
    final match = _trackingCodeRe.firstMatch(text);
    if (match == null) return;
    try {
      await ApiClient.post('/reports/${match.group(0)!}/link', {});
    } catch (_) {}
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    _speech.stop();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send({String? text, File? media, bool isVideo = false}) {
    final content = text ?? _textCtrl.text.trim();
    if (content.isEmpty && media == null) return;
    setState(() {
      _messages.add(_Msg(
        text: content.isNotEmpty ? content : null,
        isBot: false,
        time: DateTime.now(),
        media: media,
        isVideo: isVideo,
      ));
      if (text == null) _textCtrl.clear();
    });
    _scrollToBottom();
    if (content.isNotEmpty) _continueTypebot(content);
  }

  Future<void> _toggleListening() async {
    if (!_speechReady) return;
    if (_listening) {
      await _speech.stop();
      if (mounted) setState(() => _listening = false);
    } else {
      if (mounted) setState(() => _listening = true);
      await _speech.listen(
        onResult: (r) {
          if (!mounted) return;
          setState(() {
            _textCtrl.text = r.recognizedWords;
            _textCtrl.selection =
                TextSelection.collapsed(offset: _textCtrl.text.length);
          });
        },
        localeId: 'fr_FR',
      );
    }
  }

  Future<void> _pickMedia() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    await showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _MediaPickerSheet(
        isDark: isDark,
        onPickImage: (source) async {
          if (!mounted) return;
          Navigator.pop(context);
          final f = await _picker.pickImage(source: source);
          if (mounted && f != null) _send(media: File(f.path));
        },
        onPickVideo: (source) async {
          if (!mounted) return;
          Navigator.pop(context);
          final f = await _picker.pickVideo(source: source);
          if (mounted && f != null) _send(media: File(f.path), isVideo: true);
        },
      ),
    );
  }

  String get _anonLevelStr => switch (widget.anonLevel) {
    AnonLevel.full    => 'total',
    AnonLevel.partial => 'partiel',
    AnonLevel.none    => 'pas_anonyme',
  };

  String _detectType() {
    for (final m in _messages.where((m) => !m.isBot && m.text != null)) {
      final t = m.text!.toLowerCase();
      if (t.contains('subi')) return 'victime';
      if (t.contains('vu')) return 'temoin';
    }
    return 'victime';
  }

  String _detectCategorie() {
    for (final m in _messages.where((m) => !m.isBot && m.text != null)) {
      final t = m.text!.toLowerCase();
      if (t.contains('discrimination'))               return 'discrimination';
      if (t.contains('cyber'))                        return 'cyberharcelement';
      if (t.contains('physique'))                     return 'violence_physique';
      if (t.contains('verbale'))                      return 'violence_verbale';
      if (t.contains('mal'))                          return 'mal_etre';
      if (t.contains('harc') || t.contains('harcè')) return 'harcelement_scolaire';
    }
    return 'autre';
  }

  Future<void> _createReport() async {
    final userTexts = _messages
        .where((m) => !m.isBot && m.text != null)
        .map((m) => m.text!)
        .join('\n');

    try {
      await ApiClient.post('/reports', {
        'anonymat_level': _anonLevelStr,
        'type':           _detectType(),
        'categorie':      _detectCategorie(),
        if (userTexts.length >= 10) 'contenu': userTexts,
      });
    } catch (_) {}
  }

  void _confirmSend() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (_) => _ConfirmDialog(
        isDark: isDark,
        onConfirm: () async {
          Navigator.pop(context);
          await _createReport();
          widget.onSend();
        },
        onCancel: () => Navigator.pop(context),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Container(
        color: isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
        child: Material(
          color: Colors.transparent,
          child: Stack(
            children: [
              AnchorBackground(isDark: isDark),
              SafeArea(
                child: Column(
                  children: [
                    _ChatAppBar(
                      isDark: isDark,
                      onBack: () => Navigator.of(context).pop(),
                      onToggleTheme: widget.onToggleTheme,
                    ),
                    _UserBanner(
                      isDark: isDark,
                      userName: widget.userName,
                      userInitials: widget.userInitials,
                      anonLevel: widget.anonLevel,
                    ),
                    Expanded(
                      child: _ChatList(
                        isDark: isDark,
                        messages: _messages,
                        choiceItems: _choiceItems,
                        botTyping: _botTyping,
                        controller: _scrollCtrl,
                        onChoiceSelected: (r) => _send(text: r),
                        openedAt: _openedAt,
                      ),
                    ),
                    _ActionRow(
                      isDark: isDark,
                      onEmergency: () => HapticFeedback.heavyImpact(),
                      onSend: _confirmSend,
                    ),
                    _InputBar(
                      isDark: isDark,
                      controller: _textCtrl,
                      listening: _listening,
                      speechReady: _speechReady,
                      onAttachment: _pickMedia,
                      onMic: _toggleListening,
                      onSubmit: () => _send(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── App bar ──────────────────────────────────────────────────────────────────

class _ChatAppBar extends StatelessWidget {
  final bool isDark;
  final VoidCallback onBack;
  final VoidCallback onToggleTheme;

  const _ChatAppBar({
    required this.isDark,
    required this.onBack,
    required this.onToggleTheme,
  });

  @override
  Widget build(BuildContext context) {
    return HavenAppBar(
      isDark: isDark,
      onToggleTheme: onToggleTheme,
      leading: CircleBackButton(isDark: isDark, onTap: onBack),
      title: Row(
        children: [
          const SizedBox(width: 12),
          Stack(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: ClipOval(
                  child: Padding(
                    padding: const EdgeInsets.all(9),
                    child: Image.asset(
                      'assets/anchor.png',
                      color: Colors.white,
                      colorBlendMode: BlendMode.srcIn,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 1,
                right: 1,
                child: Container(
                  width: 11,
                  height: 11,
                  decoration: BoxDecoration(
                    color: const Color(0xFF4ADE80),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark
                          ? AppColors.darkGradientTop
                          : AppColors.warmWhite,
                      width: 2,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Haven Support',
                  style: AppTextStyles.nameBold(isDark, fontSize: 15),
                ),
                Text(
                  'Confidentiel',
                  style: GoogleFonts.manrope(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.50)
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── User banner ──────────────────────────────────────────────────────────────

class _UserBanner extends StatelessWidget {
  final bool isDark;
  final String userName;
  final String userInitials;
  final AnonLevel anonLevel;

  const _UserBanner({
    required this.isDark,
    required this.userName,
    required this.userInitials,
    required this.anonLevel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.07)
            : Colors.black.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(16),
        border: isDark
            ? Border.all(color: Colors.white.withValues(alpha: 0.08))
            : null,
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color:
                  AppColors.primary.withValues(alpha: isDark ? 0.55 : 1.0),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                userInitials,
                style: AppTextStyles.initials(fontSize: 10),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              userName,
              style: GoogleFonts.manrope(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.65)
                    : AppColors.lightTextSecondary,
              ),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              anonLevel.label,
              style: AppTextStyles.badge(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Chat list ────────────────────────────────────────────────────────────────

class _ChatList extends StatelessWidget {
  final bool isDark;
  final List<_Msg> messages;
  final List<String> choiceItems;
  final bool botTyping;
  final ScrollController controller;
  final ValueChanged<String> onChoiceSelected;
  final DateTime openedAt;

  const _ChatList({
    required this.isDark,
    required this.messages,
    required this.choiceItems,
    required this.botTyping,
    required this.controller,
    required this.onChoiceSelected,
    required this.openedAt,
  });

  @override
  Widget build(BuildContext context) {
    final showChoices = choiceItems.isNotEmpty;
    final itemCount = 1 + messages.length + (botTyping ? 1 : 0) + (showChoices ? 1 : 0);

    return ListView.builder(
      controller: controller,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: itemCount,
      itemBuilder: (_, i) {
        if (i == 0) return _DateSeparator(isDark: isDark, time: openedAt);
        final msgIndex = i - 1;
        if (msgIndex < messages.length) {
          return _BubbleRow(isDark: isDark, msg: messages[msgIndex]);
        }
        final extra = msgIndex - messages.length;
        if (botTyping && extra == 0) {
          return _TypingIndicator(isDark: isDark);
        }
        if (showChoices) {
          return _QuickRepliesRow(
            isDark: isDark,
            replies: choiceItems,
            onTap: onChoiceSelected,
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

// ─── Date separator ───────────────────────────────────────────────────────────

class _DateSeparator extends StatelessWidget {
  final bool isDark;
  final DateTime time;

  const _DateSeparator({required this.isDark, required this.time});

  @override
  Widget build(BuildContext context) {
    final hh = time.hour.toString().padLeft(2, '0');
    final mm = time.minute.toString().padLeft(2, '0');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Center(
        child: Text(
          "Aujourd'hui · $hh:$mm",
          style: GoogleFonts.manrope(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: isDark
                ? Colors.white.withValues(alpha: 0.40)
                : AppColors.lightTextSecondary.withValues(alpha: 0.70),
          ),
        ),
      ),
    );
  }
}

// ─── Chat bubble row ──────────────────────────────────────────────────────────

class _BubbleRow extends StatelessWidget {
  final bool isDark;
  final _Msg msg;

  const _BubbleRow({required this.isDark, required this.msg});

  @override
  Widget build(BuildContext context) {
    final isBot = msg.isBot;
    final hh = msg.time.hour.toString().padLeft(2, '0');
    final mm = msg.time.minute.toString().padLeft(2, '0');

    final bubbleColor = isBot
        ? (isDark ? const Color(0xFF1A3D37) : const Color(0xFFE8E6E1))
        : AppColors.primary;

    final textColor =
        isBot ? (isDark ? Colors.white : AppColors.lightTextPrimary) : Colors.white;

    final timeColor = isBot
        ? (isDark
            ? Colors.white.withValues(alpha: 0.40)
            : AppColors.lightTextSecondary.withValues(alpha: 0.70))
        : Colors.white.withValues(alpha: 0.65);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment:
            isBot ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Flexible(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.72,
              ),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: bubbleColor,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(20),
                    topRight: const Radius.circular(20),
                    bottomLeft: Radius.circular(isBot ? 4 : 20),
                    bottomRight: Radius.circular(isBot ? 20 : 4),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (msg.media != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: msg.isVideo
                            ? _VideoThumb(file: msg.media!)
                            : Image.file(
                                msg.media!,
                                width: 200,
                                fit: BoxFit.cover,
                              ),
                      ),
                    if (msg.text != null) ...[
                      if (msg.media != null) const SizedBox(height: 6),
                      Text(
                        msg.text!,
                        style: GoogleFonts.manrope(
                          fontSize: 14,
                          color: textColor,
                          height: 1.45,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      '$hh:$mm',
                      style: GoogleFonts.manrope(
                        fontSize: 10,
                        color: timeColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Video thumbnail placeholder ──────────────────────────────────────────────

class _VideoThumb extends StatelessWidget {
  final File file;
  const _VideoThumb({required this.file});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      height: 120,
      decoration: BoxDecoration(
        color: Colors.black54,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: Icon(
          Icons.play_circle_outline_rounded,
          color: Colors.white,
          size: 40,
        ),
      ),
    );
  }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

class _TypingIndicator extends StatefulWidget {
  final bool isDark;
  const _TypingIndicator({required this.isDark});

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bubbleColor = widget.isDark
        ? const Color(0xFF1A3D37)
        : const Color(0xFFE8E6E1);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: bubbleColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) {
                return AnimatedBuilder(
                  animation: _ctrl,
                  builder: (_, __) {
                    final t = ((_ctrl.value + i / 3) % 1.0);
                    final opacity = (0.3 + 0.7 * (t < 0.5 ? t * 2 : (1 - t) * 2)).clamp(0.3, 1.0);
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: (widget.isDark ? Colors.white : AppColors.lightTextSecondary)
                            .withValues(alpha: opacity),
                      ),
                    );
                  },
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Quick replies ────────────────────────────────────────────────────────────

class _QuickRepliesRow extends StatelessWidget {
  final bool isDark;
  final List<String> replies;
  final ValueChanged<String> onTap;

  const _QuickRepliesRow({
    required this.isDark,
    required this.replies,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: replies
                .map(
                  (r) => GestureDetector(
                    onTap: () => onTap(r),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 9),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.25)
                              : AppColors.primary.withValues(alpha: 0.45),
                        ),
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.07)
                            : AppColors.primary.withValues(alpha: 0.06),
                      ),
                      child: Text(
                        r,
                        style: GoogleFonts.manrope(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? Colors.white
                              : AppColors.lightTextPrimary,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

// ─── Action row (Urgences + Envoyer) ─────────────────────────────────────────

class _ActionRow extends StatelessWidget {
  final bool isDark;
  final VoidCallback onEmergency;
  final VoidCallback onSend;

  const _ActionRow({
    required this.isDark,
    required this.onEmergency,
    required this.onSend,
  });

  static const _red = Color(0xFFC0392B);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: onEmergency,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: _red.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: _red.withValues(alpha: 0.45),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.phone_outlined,
                          color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'Urgences',
                        style: AppTextStyles.button(fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          GestureDetector(
            onTap: onSend,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Envoyer',
                    style: AppTextStyles.button(fontSize: 14),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.send_rounded, color: Colors.white, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Input bar ────────────────────────────────────────────────────────────────

class _InputBar extends StatelessWidget {
  final bool isDark;
  final TextEditingController controller;
  final bool listening;
  final bool speechReady;
  final VoidCallback onAttachment;
  final VoidCallback onMic;
  final VoidCallback onSubmit;

  const _InputBar({
    required this.isDark,
    required this.controller,
    required this.listening,
    required this.speechReady,
    required this.onAttachment,
    required this.onMic,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkGradientTop.withValues(alpha: 0.97)
            : AppColors.warmWhite.withValues(alpha: 0.97),
        border: Border(
          top: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.07),
          ),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: onAttachment,
            icon: Icon(
              Icons.attach_file_rounded,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.55)
                  : AppColors.lightTextSecondary,
              size: 22,
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSubmit(),
              decoration: InputDecoration(
                hintText: 'Tapez un message...',
                hintStyle: GoogleFonts.manrope(
                  fontSize: 14,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.35)
                      : AppColors.lightTextSecondary.withValues(alpha: 0.70),
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
              ),
              style: GoogleFonts.manrope(
                fontSize: 14,
                color: isDark ? Colors.white : AppColors.lightTextPrimary,
              ),
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: speechReady ? onMic : null,
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: listening
                    ? AppColors.primary.withValues(alpha: 0.20)
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Icon(
                listening ? Icons.mic_rounded : Icons.mic_none_rounded,
                color: listening
                    ? AppColors.primary
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.55)
                        : AppColors.lightTextSecondary),
                size: 22,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Media picker bottom sheet ────────────────────────────────────────────────

class _MediaPickerSheet extends StatelessWidget {
  final bool isDark;
  final Future<void> Function(ImageSource) onPickImage;
  final Future<void> Function(ImageSource) onPickVideo;

  const _MediaPickerSheet({
    required this.isDark,
    required this.onPickImage,
    required this.onPickVideo,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickOption(
              isDark: isDark,
              icon: Icons.photo_camera_rounded,
              label: 'Prendre une photo',
              onTap: () => onPickImage(ImageSource.camera),
            ),
            const SizedBox(height: 10),
            _PickOption(
              isDark: isDark,
              icon: Icons.photo_library_rounded,
              label: 'Choisir une photo',
              onTap: () => onPickImage(ImageSource.gallery),
            ),
            const SizedBox(height: 10),
            _PickOption(
              isDark: isDark,
              icon: Icons.videocam_rounded,
              label: 'Filmer une vidéo',
              onTap: () => onPickVideo(ImageSource.camera),
            ),
            const SizedBox(height: 10),
            _PickOption(
              isDark: isDark,
              icon: Icons.video_library_rounded,
              label: 'Choisir une vidéo',
              onTap: () => onPickVideo(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
  }
}

class _PickOption extends StatelessWidget {
  final bool isDark;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _PickOption({
    required this.isDark,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : Colors.black.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(width: 14),
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppColors.lightTextPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

class _ConfirmDialog extends StatelessWidget {
  final bool isDark;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const _ConfirmDialog({
    required this.isDark,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor:
          isDark ? AppColors.darkGradientTop : AppColors.warmWhite,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: Text(
        'Terminer le signalement ?',
        style: GoogleFonts.fraunces(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isDark ? Colors.white : AppColors.lightTextPrimary,
        ),
      ),
      content: Text(
        "Es-tu sûr(e) d'avoir tout dit ? Ton signalement sera transmis à l'équipe Haven.",
        style: AppTextStyles.body(isDark, height: 1.5),
      ),
      actions: [
        TextButton(
          onPressed: onCancel,
          child: Text(
            'Non',
            style: GoogleFonts.manrope(
              fontWeight: FontWeight.w600,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.65)
                  : AppColors.lightTextSecondary,
            ),
          ),
        ),
        GestureDetector(
          onTap: onConfirm,
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              'Oui, envoyer',
              style: GoogleFonts.manrope(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
