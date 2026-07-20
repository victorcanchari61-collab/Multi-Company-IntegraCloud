import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../domain/entities/menu_entities.dart';
import '../../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/menu_provider.dart';
import 'login_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MenuProvider>().loadMenu();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          auth.user?.fullName ?? 'Multi-Company',
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        backgroundColor: AppColors.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      drawer: _buildDrawer(context),
      body: _buildBody(context),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final menu = context.watch<MenuProvider>();
    final auth = context.watch<AuthProvider>();

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.brandFrom, AppColors.brandVia, AppColors.brandTo],
              ),
            ),
            accountName: Text(auth.user?.fullName ?? ''),
            accountEmail: Text(auth.user?.email ?? ''),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (auth.user?.fullName ?? '?')[0].toUpperCase(),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          if (menu.isLoading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (menu.error != null)
            Expanded(
              child: Center(
                child: Text(menu.error!, style: const TextStyle(color: AppColors.destructive)),
              ),
            )
          else
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 12, 16, 4),
                    child: Text(
                      'SISTEMAS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.mutedForeground,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  ...menu.systems.map((s) => _buildSystemTile(context, s)),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSystemTile(BuildContext context, MenuSystem system) {
    final selected = context.watch<MenuProvider>().selectedSystem?.systemCode == system.systemCode;

    return ExpansionTile(
      leading: _systemIcon(system.systemCode),
      title: Text(
        system.systemName,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          color: selected ? AppColors.primary : AppColors.foreground,
        ),
      ),
      initiallyExpanded: selected,
      children: system.modules.map((module) {
        if (module.isGroup) {
          return ExpansionTile(
            title: Text(module.label, style: const TextStyle(fontSize: 14)),
            initiallyExpanded: true,
            children: module.submodules.map((sub) {
              return ListTile(
                dense: true,
                contentPadding: const EdgeInsets.only(left: 72, right: 16),
                title: Text(sub.label, style: const TextStyle(fontSize: 13)),
                onTap: () {
                  Navigator.of(context).pop();
                  _openModule(context, system, module, sub);
                },
              );
            }).toList(),
          );
        }
        return ListTile(
          contentPadding: const EdgeInsets.only(left: 56, right: 16),
          leading: const Icon(Icons.circle, size: 6, color: AppColors.mutedForeground),
          title: Text(module.label, style: const TextStyle(fontSize: 14)),
          onTap: () {
            Navigator.of(context).pop();
            _openModule(context, system, module);
          },
        );
      }).toList(),
    );
  }

  Widget _systemIcon(String code) {
    switch (code) {
      case 'IAM':
        return const Icon(Icons.admin_panel_settings, color: AppColors.primary);
      case 'ERP':
        return const Icon(Icons.assessment, color: AppColors.primary);
      case 'WMS':
        return const Icon(Icons.inventory_2, color: AppColors.primary);
      case 'POS':
        return const Icon(Icons.point_of_sale, color: AppColors.primary);
      case 'RRHH':
        return const Icon(Icons.people, color: AppColors.primary);
      default:
        return const Icon(Icons.apps, color: AppColors.primary);
    }
  }

  void _openModule(BuildContext context, MenuSystem system, MenuModule module, [MenuItem? sub]) {
    context.read<MenuProvider>().selectSystem(system);

    final route = sub?.route ?? module.route;
    if (route == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${sub?.label ?? module.label} - Próximamente')),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ModulePlaceholder(title: sub?.label ?? module.label, route: route),
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    final menu = context.watch<MenuProvider>();

    if (menu.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (menu.error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(menu.error!, style: const TextStyle(color: AppColors.mutedForeground)),
          ],
        ),
      );
    }

    if (menu.systems.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.info_outline, size: 48),
            SizedBox(height: 16),
            Text('No tienes sistemas disponibles'),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Text('Selecciona un sistema', style: AppTextStyles.h2),
          ),
          Row(
            children: menu.systems
                .map((s) => Expanded(child: _buildSystemCard(context, s)))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSystemCard(BuildContext context, MenuSystem system) {
    IconData icon;
    switch (system.systemCode) {
      case 'IAM':
        icon = Icons.admin_panel_settings;
      case 'ERP':
        icon = Icons.assessment;
      case 'WMS':
        icon = Icons.inventory_2;
      case 'POS':
        icon = Icons.point_of_sale;
      case 'RRHH':
        icon = Icons.people;
      default:
        icon = Icons.apps;
    }

    final count = system.modules.fold<int>(0, (sum, m) => sum + 1 + m.submodules.length);

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.cardRadius)),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        onTap: () {
          context.read<MenuProvider>().selectSystem(system);
          Scaffold.of(context).openDrawer();
        },
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: AppColors.primary),
              const SizedBox(height: AppSpacing.sm),
              Text(system.systemName, style: AppTextStyles.h3, textAlign: TextAlign.center),
              const SizedBox(height: 4),
              Text('$count módulos', style: AppTextStyles.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

class ModulePlaceholder extends StatelessWidget {
  final String title;
  final String route;

  const ModulePlaceholder({super.key, required this.title, required this.route});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: const TextStyle(color: Colors.white)),
        backgroundColor: AppColors.primary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.construction, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(title, style: AppTextStyles.h2),
            const SizedBox(height: 8),
            Text(route, style: AppTextStyles.bodySmall),
            const SizedBox(height: 24),
            Text('Próximamente',
                style: AppTextStyles.body.copyWith(color: AppColors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}
