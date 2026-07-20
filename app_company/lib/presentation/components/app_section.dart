import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class AppSection extends StatelessWidget {
  final String title;
  final Widget? trailing;
  final List<Widget> children;

  const AppSection({
    super.key,
    required this.title,
    this.trailing,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.sm,
          ),
          child: Row(
            children: [
              Text(title, style: AppTextStyles.h2),
              const Spacer(),
              ?trailing,
            ],
          ),
        ),
        ...children,
      ],
    );
  }
}
