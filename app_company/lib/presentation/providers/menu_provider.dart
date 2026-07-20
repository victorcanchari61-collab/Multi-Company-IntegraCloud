import 'package:flutter/foundation.dart';
import '../../core/network/api_client.dart';
import '../../data/datasources/menu_remote_datasource.dart';
import '../../domain/entities/menu_entities.dart';

class MenuProvider extends ChangeNotifier {
  final ApiClient _apiClient;
  late final MenuRemoteDataSource _dataSource;

  List<MenuSystem> _systems = [];
  MenuSystem? _selectedSystem;
  bool _isLoading = false;
  String? _error;

  MenuProvider(this._apiClient) {
    _dataSource = MenuRemoteDataSource(_apiClient);
  }

  List<MenuSystem> get systems => _systems;
  MenuSystem? get selectedSystem => _selectedSystem;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadMenu() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final models = await _dataSource.getMenu();
      _systems = models.map((m) => m.toEntity()).toList();
    } catch (e) {
      _error = 'Error al cargar el menú';
    }

    _isLoading = false;
    notifyListeners();
  }

  void selectSystem(MenuSystem system) {
    _selectedSystem = system;
    notifyListeners();
  }
}
