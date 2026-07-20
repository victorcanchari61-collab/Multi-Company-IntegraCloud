import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

enum AppBadgeVariant { primary, secondary, destructive, outline, success, warning }

class AppBadge extends StatelessWidget {
  final String text;
  final AppBadgeVariant variant;
  final double? fontSize;

  const AppBadge({
    super.key,
    required this.text,
    this.variant = AppBadgeVariant.primary,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg) = switch (variant) {
      AppBadgeVariant.primary => (AppColors.primary, AppColors.primaryForeground),
      AppBadgeVariant.secondary => (AppColors.secondary, AppColors.secondaryForeground),
      AppBadgeVariant.destructive => (AppColors.destructive.withValues(alpha: 0.1), AppColors.destructive),
      AppBadgeVariant.outline => (Colors.transparent, AppColors.foreground),
      AppBadgeVariant.success => (AppColors.success.withValues(alpha: 0.1), AppColors.success),
      AppBadgeVariant.warning => (AppColors.warning.withValues(alpha: 0.1), AppColors.warning),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppSpacing.badgeRadius),
        border: variant == AppBadgeVariant.outline
            ? Border.all(color: AppColors.border)
            : null,
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize ?? 11,
          fontWeight: FontWeight.w600,
          color: fg,
          fontFamily: AppTextStyles.fontFamily,
        ),
      ),
    );
  }
}

class AppStatusBadge extends StatelessWidget {
  final bool isActive;

  const AppStatusBadge({super.key, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return AppBadge(
      text: isActive ? 'Activo' : 'Inactivo',
      variant: isActive ? AppBadgeVariant.success : AppBadgeVariant.destructive,
    );
  }
}
