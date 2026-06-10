import 'package:flutter/material.dart';

class AnchorBackground extends StatelessWidget {
  final bool isDark;
  const AnchorBackground({super.key, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: -310,
      bottom: -420,
      child: IgnorePointer(
        child: Transform.rotate(
          angle: 0.8,
          child: Opacity(
            opacity: isDark ? 0.04 : 0.5,
            child: Image.asset(
              isDark ? 'assets/anchor.png' : 'assets/anchorwhitemode.png',
              width: 950,
            ),
          ),
        ),
      ),
    );
  }
}
