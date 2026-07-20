import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand (web: index.css)
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryForeground = Color(0xFFFFFFFF);
  static const Color secondary = Color(0xFFE8F1FF);
  static const Color secondaryForeground = Color(0xFF1E3A8A);
  static const Color accent = Color(0xFF3B82F6);
  static const Color accentForeground = Color(0xFFFFFFFF);

  // Brand gradient (web: #1e3a8a → #2563eb → #3b82f6)
  static const Color brandFrom = Color(0xFF1E3A8A);
  static const Color brandVia = Color(0xFF2563EB);
  static const Color brandTo = Color(0xFF3B82F6);

  // Layout (web: Sidebar/Header)
  static const Color layoutDark = Color(0xFF0B4C8C);

  // Surface / Neutral
  static const Color background = Color(0xFFEEF2F7);
  static const Color foreground = Color(0xFF1E293B);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF1E293B);
  static const Color muted = Color(0xFFF1F5FB);
  static const Color mutedForeground = Color(0xFF94A3B8);
  static const Color popover = Color(0xFFFFFFFF);
  static const Color popoverForeground = Color(0xFF1E293B);

  // Semantic
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFF59E0B);
  static const Color destructive = Color(0xFFDC2626);
  static const Color info = Color(0xFF2563EB);

  // Borders
  static const Color border = Color(0xFFD4DDEC);
  static const Color input = Color(0xFFD4DDEC);
  static const Color ring = Color(0xFF2563EB);
}

class AppTextStyles {
  AppTextStyles._();

  static const String fontFamily = 'Roboto';

  static TextStyle h1 = const TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.foreground,
    fontFamily: fontFamily,
  );

  static TextStyle h2 = const TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.foreground,
    fontFamily: fontFamily,
  );

  static TextStyle h3 = const TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.foreground,
    fontFamily: fontFamily,
  );

  static TextStyle body = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.foreground,
    fontFamily: fontFamily,
  );

  static TextStyle bodySmall = const TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.mutedForeground,
    fontFamily: fontFamily,
  );

  static TextStyle button = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.primaryForeground,
    fontFamily: fontFamily,
  );

  static TextStyle caption = const TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.normal,
    color: AppColors.mutedForeground,
    fontFamily: fontFamily,
  );

  static TextStyle label = const TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.foreground,
    fontFamily: fontFamily,
  );
}

class AppSpacing {
  AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;

  static const double cardRadius = 12;
  static const double buttonRadius = 8;
  static const double inputRadius = 8;
  static const double badgeRadius = 6;
}
