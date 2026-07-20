import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/usuario_entity.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository _repository;
  LoginUseCase(this._repository);

  Future<Either<Failure, UsuarioEntity>> execute(
    String email, String password, {String? slug}
  ) {
    return _repository.login(email, password, slug: slug);
  }
}

class LogoutUseCase {
  final AuthRepository _repository;
  LogoutUseCase(this._repository);

  Future<Either<Failure, void>> execute(String refreshToken) {
    return _repository.logout(refreshToken);
  }
}

class CheckSessionUseCase {
  final AuthRepository _repository;
  CheckSessionUseCase(this._repository);

  Future<Either<Failure, UsuarioEntity>> execute() {
    return _repository.checkSession();
  }
}
