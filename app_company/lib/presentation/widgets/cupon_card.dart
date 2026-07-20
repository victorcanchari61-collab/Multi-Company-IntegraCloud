import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../components/app_card.dart';
import '../components/app_badge.dart';

class CuponCard extends StatelessWidget {
  final String codigo;
  final String clienteNombre;
  final double monto;
  final String estado;
  final String? fechaVencimiento;
  final VoidCallback? onTap;
  final VoidCallback? onPdf;

  const CuponCard({
    super.key,
    required this.codigo,
    required this.clienteNombre,
    required this.monto,
    required this.estado,
    this.fechaVencimiento,
    this.onTap,
    this.onPdf,
  });

  @override
  Widget build(BuildContext context) {
    final isPagado = estado.toLowerCase() == 'pagado';
    final isVencido = estado.toLowerCase() == 'vencido';

    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(codigo, style: AppTextStyles.h3),
              ),
              AppBadge(
                text: estado,
                variant: isPagado
                    ? AppBadgeVariant.success
                    : isVencido
                        ? AppBadgeVariant.destructive
                        : AppBadgeVariant.primary,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(clienteNombre, style: AppTextStyles.body),
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: [
              Text('S/ ${monto.toStringAsFixed(2)}',
                  style: AppTextStyles.h2.copyWith(color: AppColors.primary)),
              const Spacer(),
              if (fechaVencimiento != null)
                Text('Vence: $fechaVencimiento', style: AppTextStyles.bodySmall),
            ],
          ),
          if (onPdf != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                onPressed: onPdf,
                icon: const Icon(Icons.download, size: 20),
                color: AppColors.mutedForeground,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
