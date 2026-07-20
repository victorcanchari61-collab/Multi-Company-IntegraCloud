import 'dart:io';

class ApiConstants {
  ApiConstants._();

  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5033';
    }
    return 'http://localhost:5033';
  }

  static const String apiPrefix = '/api';

  // Auth
  static const String login = '$apiPrefix/auth/login';
  static const String refresh = '$apiPrefix/auth/refresh';
  static const String logout = '$apiPrefix/auth/logout';
  static const String me = '$apiPrefix/auth/me';
  static const String changePassword = '$apiPrefix/auth/me/change-password';
  static const String myPermissions = '$apiPrefix/auth/me/permissions';

  // Companies
  static const String companies = '$apiPrefix/companies';
  static String companyBranding(String slug) => '$apiPrefix/companies/branding/$slug';

  // Menu
  static const String menu = '$apiPrefix/menu';

  // Lookup
  static String ruc(String ruc) => '$apiPrefix/lookup/ruc/$ruc';
  static String dni(String dni) => '$apiPrefix/lookup/dni/$dni';

  // ERP base
  static const String erp = '$apiPrefix/erp';
  static const String products = '$erp/products';
  static const String categories = '$erp/categories';
  static const String brands = '$erp/brands';
  static const String warehouses = '$erp/warehouses';
  static const String stock = '$erp/stock';
  static const String customers = '$erp/customers';
  static const String salesOrders = '$erp/sales-orders';
  static const String suppliers = '$erp/suppliers';
  static const String purchaseOrders = '$erp/purchase-orders';

  static const Duration timeout = Duration(seconds: 30);
}
