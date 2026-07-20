import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../components/app_button.dart';

class ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const ErrorState({
    super.key,
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.info_outline, size: 64, color: AppColors.destructive.withValues(alpha: 0.6)),
            const SizedBox(height: AppSpacing.md),
            Text(message, style: AppTextStyles.body, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                text: 'Reintentar',
                onPressed: onRetry,
                variant: AppButtonVariant.outline,
                width: 160,
                icon: Icons.refresh,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
