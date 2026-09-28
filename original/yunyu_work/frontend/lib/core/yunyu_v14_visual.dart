import 'package:flutter/material.dart';

class YunyuV14 {
  static const double pagePadding = 20;
  static const double sectionGap = 24;
  static const double contentGap = 12;
  static const double cardRadius = 20;
  static const double avatar = 44;

  static Widget sectionTitle(String title, {String? subtitle}) => Padding(
    padding: const EdgeInsets.only(top: sectionGap, bottom: 10),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      if (subtitle != null) ...[
        const SizedBox(height: 4),
        Text(subtitle, style: const TextStyle(fontSize: 13, color: Colors.grey)),
      ],
    ]),
  );
}

class YunyuEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  const YunyuEmptyState({super.key, required this.icon, required this.title, required this.description});
  @override
  Widget build(BuildContext context) => Center(child: Padding(
    padding: const EdgeInsets.all(36),
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 72, height: 72, decoration: BoxDecoration(borderRadius: BorderRadius.circular(24), color: Theme.of(context).colorScheme.primary.withOpacity(.08)), child: Icon(icon, size: 30)),
      const SizedBox(height: 16), Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
      const SizedBox(height: 6), Text(description, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, height: 1.5)),
    ]),
  ));
}
