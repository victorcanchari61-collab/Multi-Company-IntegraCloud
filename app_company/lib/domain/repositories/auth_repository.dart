import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/usuario_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UsuarioEntity>> login(
    String email, String password, {String? slug}
  );
  Future<Either<Failure, void>> logout(String refreshToken);
  Future<Either<Failure, UsuarioEntity>> checkSession();
}
