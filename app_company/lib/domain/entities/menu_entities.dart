class MenuItem {
  final String code;
  final String label;
  final String? route;
  final String requiredPermission;

  MenuItem({
    required this.code,
    required this.label,
    this.route,
    required this.requiredPermission,
  });
}

class MenuModule {
  final String code;
  final String label;
  final String? route;
  final String requiredPermission;
  final List<MenuItem> submodules;

  MenuModule({
    required this.code,
    required this.label,
    this.route,
    required this.requiredPermission,
    this.submodules = const [],
  });

  bool get isGroup => submodules.isNotEmpty;
}

class MenuSystem {
  final String systemCode;
  final String systemName;
  final List<MenuModule> modules;

  MenuSystem({
    required this.systemCode,
    required this.systemName,
    this.modules = const [],
  });
}
