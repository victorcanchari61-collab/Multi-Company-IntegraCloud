import 'package:flutter/foundation.dart';
import '../../core/network/api_client.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/usuario_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/auth_usecases.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _apiClient;
  late final AuthRepository _repository;
  late final LoginUseCase _loginUseCase;
  late final LogoutUseCase _logoutUseCase;
  late final CheckSessionUseCase _checkSessionUseCase;

  UsuarioEntity? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._apiClient) {
    final dataSource = AuthRemoteDataSource(_apiClient);
    _repository = AuthRepositoryImpl(dataSource, _apiClient);
    _loginUseCase = LoginUseCase(_repository);
    _logoutUseCase = LogoutUseCase(_repository);
    _checkSessionUseCase = CheckSessionUseCase(_repository);
  }

  UsuarioEntity? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user?.isAuthenticated ?? false;

  Future<bool> login(String email, String password, {String? slug}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _loginUseCase.execute(email, password, slug: slug);

    return result.fold((failure) {
      _error = failure.message;
      _isLoading = false;
      notifyListeners();
      return false;
    }, (user) {
      _user = user;
      _apiClient.setToken(user.accessToken);
      _isLoading = false;
      notifyListeners();
      return true;
    });
  }

  Future<void> logout() async {
    if (_user?.refreshToken != null) {
      await _logoutUseCase.execute(_user!.refreshToken!);
    }
    _user = null;
    _apiClient.setToken(null);
    notifyListeners();
  }

  Future<bool> checkSession() async {
    _isLoading = true;
    notifyListeners();

    final result = await _checkSessionUseCase.execute();

    return result.fold((failure) {
      _user = null;
      _apiClient.setToken(null);
      _isLoading = false;
      notifyListeners();
      return false;
    }, (user) {
      _user = user;
      _isLoading = false;
      notifyListeners();
      return true;
    });
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
