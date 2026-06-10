import 'dart:math';
import 'package:flutter/material.dart';

/// Clips its child to a circle centered at [center] with radius
/// = maxCornerDistance * [fraction].  fraction=0 → nothing, fraction=1 → full screen.
class CircleClipper extends CustomClipper<Path> {
  final Offset center;
  final double fraction;

  const CircleClipper({required this.center, required this.fraction});

  @override
  Path getClip(Size size) {
    final maxRadius = [
      (Offset.zero - center).distance,
      (Offset(size.width, 0) - center).distance,
      (Offset(0, size.height) - center).distance,
      (Offset(size.width, size.height) - center).distance,
    ].reduce(max);

    return Path()
      ..addOval(Rect.fromCircle(center: center, radius: maxRadius * fraction));
  }

  @override
  bool shouldReclip(CircleClipper old) =>
      fraction != old.fraction || center != old.center;
}
