import '../../domain/entities/menu_entities.dart';

class MenuItemModel {
  final String code;
  final String label;
  final String? route;
  final String requiredPermission;

  MenuItemModel({
    required this.code,
    required this.label,
    this.route,
    required this.requiredPermission,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    return MenuItemModel(
      code: json['code'] as String,
      label: json['label'] as String,
      route: json['route'] as String?,
      requiredPermission: json['requiredPermission'] as String,
    );
  }

  MenuItem toEntity() => MenuItem(
        code: code,
        label: label,
        route: route,
        requiredPermission: requiredPermission,
      );
}

class MenuModuleModel {
  final String code;
  final String label;
  final String? route;
  final String requiredPermission;
  final List<MenuItemModel> submodules;

  MenuModuleModel({
    required this.code,
    required this.label,
    this.route,
    required this.requiredPermission,
    this.submodules = const [],
  });

  factory MenuModuleModel.fromJson(Map<String, dynamic> json) {
    return MenuModuleModel(
      code: json['code'] as String,
      label: json['label'] as String,
      route: json['route'] as String?,
      requiredPermission: json['requiredPermission'] as String,
      submodules: (json['submodules'] as List?)
              ?.map((e) => MenuItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  MenuModule toEntity() => MenuModule(
        code: code,
        label: label,
        route: route,
        requiredPermission: requiredPermission,
        submodules: submodules.map((e) => e.toEntity()).toList(),
      );
}

class MenuSystemModel {
  final String systemCode;
  final String systemName;
  final List<MenuModuleModel> modules;

  MenuSystemModel({
    required this.systemCode,
    required this.systemName,
    this.modules = const [],
  });

  factory MenuSystemModel.fromJson(Map<String, dynamic> json) {
    return MenuSystemModel(
      systemCode: json['systemCode'] as String,
      systemName: json['systemName'] as String,
      modules: (json['modules'] as List?)
              ?.map((e) => MenuModuleModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  MenuSystem toEntity() => MenuSystem(
        systemCode: systemCode,
        systemName: systemName,
        modules: modules.map((e) => e.toEntity()).toList(),
      );
}
