import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

enum AppButtonVariant { primary, secondary, destructive, ghost, outline, link }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final double? width;
  final double height;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.width,
    this.height = 48,
  });

  @override
  Widget build(BuildContext context) {
    final style = switch (variant) {
      AppButtonVariant.primary => ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.primaryForeground,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
          disabledForegroundColor: AppColors.primaryForeground.withValues(alpha: 0.5),
        ),
      AppButtonVariant.secondary => ElevatedButton.styleFrom(
          backgroundColor: AppColors.secondary,
          foregroundColor: AppColors.secondaryForeground,
        ),
      AppButtonVariant.destructive => ElevatedButton.styleFrom(
          backgroundColor: AppColors.destructive,
          foregroundColor: Colors.white,
        ),
      AppButtonVariant.ghost => TextButton.styleFrom(
          foregroundColor: AppColors.foreground,
          backgroundColor: Colors.transparent,
        ),
      AppButtonVariant.outline => OutlinedButton.styleFrom(
          foregroundColor: AppColors.foreground,
          side: BorderSide(color: AppColors.border),
        ),
      AppButtonVariant.link => TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: EdgeInsets.zero,
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
    };

    final child = switch (variant) {
      AppButtonVariant.link => Text(text, style: AppTextStyles.body.copyWith(
        color: AppColors.primary, decoration: TextDecoration.underline,
      )),
      _ => Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isLoading)
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: variant == AppButtonVariant.primary
                    ? AppColors.primaryForeground
                    : AppColors.foreground,
              ),
            ),
          if (isLoading && icon != null) const SizedBox(width: AppSpacing.sm),
          if (!isLoading && icon != null) Icon(icon, size: 20),
          if (icon != null) const SizedBox(width: AppSpacing.sm),
          Text(text, style: AppTextStyles.button),
        ],
      ),
    };

    if (variant == AppButtonVariant.link) {
      return GestureDetector(onTap: onPressed, child: child);
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: switch (variant) {
        AppButtonVariant.ghost => TextButton(onPressed: onPressed, style: style, child: child),
        AppButtonVariant.outline => OutlinedButton(onPressed: onPressed, style: style, child: child),
        _ => ElevatedButton(onPressed: onPressed, style: style, child: child),
      },
    );
  }
}

class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final double size;

  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.variant = AppButtonVariant.ghost,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    final color = switch (variant) {
      AppButtonVariant.primary => AppColors.primaryForeground,
      AppButtonVariant.destructive => AppColors.destructive,
      _ => AppColors.mutedForeground,
    };
    final bg = switch (variant) {
      AppButtonVariant.primary => AppColors.primary,
      _ => Colors.transparent,
    };

    return SizedBox(
      width: size,
      height: size,
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: color, size: size * 0.5),
        style: IconButton.styleFrom(
          backgroundColor: bg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          ),
        ),
      ),
    );
  }
}
