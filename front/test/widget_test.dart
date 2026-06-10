import 'package:flutter_test/flutter_test.dart';
import 'package:haven_front/app.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: HavenApp()));
  });
}
