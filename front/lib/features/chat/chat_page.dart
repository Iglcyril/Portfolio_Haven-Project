import 'dart:io';
import 'dart:ui' show ImageFilter;
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
    this.userName = 'Alex Morgan',
    this.userInitials = 'AM',
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
  bool _showQuickReplies = true;

  static const _caseNumber = '#HVN-8829';

  static const _quickReplies = [
    'En classe',
    'En ligne / messages',
    'Sur le campus',
    "Je ne sais pas",
  ];

  late final List<_Msg> _messages;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _messages = [
      _Msg(
        text:
            "Bonjour — ici tu es libre de partager ce qui t'arrive. Rien ne sort d'ici sans ton accord.",
        isBot: true,
        time: now,
      ),
      _Msg(
        text:
            "Je suis là pour t'aider. Peux-tu me décrire ce qui s'est passé ?",
        isBot: true,
        time: now,
      ),
    ];
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
      _showQuickReplies = false;
    });
    _scrollToBottom();
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

  void _confirmSend() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (_) => _ConfirmDialog(
        isDark: isDark,
        onConfirm: () {
          Navigator.pop(context);
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
                      caseNumber: _caseNumber,
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
                        showQuickReplies: _showQuickReplies,
                        quickReplies: _quickReplies,
                        controller: _scrollCtrl,
                        onQuickReply: (r) => _send(text: r),
                        openedAt: _messages.first.time,
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
  final String caseNumber;
  final VoidCallback onBack;
  final VoidCallback onToggleTheme;

  const _ChatAppBar({
    required this.isDark,
    required this.caseNumber,
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
                  'Dossier $caseNumber · Confidentiel',
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
  final bool showQuickReplies;
  final List<String> quickReplies;
  final ScrollController controller;
  final ValueChanged<String> onQuickReply;
  final DateTime openedAt;

  const _ChatList({
    required this.isDark,
    required this.messages,
    required this.showQuickReplies,
    required this.quickReplies,
    required this.controller,
    required this.onQuickReply,
    required this.openedAt,
  });

  @override
  Widget build(BuildContext context) {
    final itemCount =
        1 + messages.length + (showQuickReplies ? 1 : 0);

    return ListView.builder(
      controller: controller,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: itemCount,
      itemBuilder: (_, i) {
        if (i == 0) return _DateSeparator(isDark: isDark, time: openedAt);
        final msgIndex = i - 1;
        if (showQuickReplies && msgIndex == messages.length) {
          return _QuickRepliesRow(
            isDark: isDark,
            replies: quickReplies,
            onTap: onQuickReply,
          );
        }
        return _BubbleRow(isDark: isDark, msg: messages[msgIndex]);
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
          Text(
            'Réponses rapides',
            style: GoogleFonts.manrope(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.45)
                  : AppColors.lightTextSecondary,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 8),
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
