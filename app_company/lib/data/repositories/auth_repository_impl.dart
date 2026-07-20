import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../core/network/api_client.dart';
import '../../domain/entities/usuario_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final ApiClient _apiClient;

  AuthRepositoryImpl(this._remoteDataSource, this._apiClient);

  @override
  Future<Either<Failure, UsuarioEntity>> login(String email, String password, {String? slug}) async {
    try {
      final authTokens = await _remoteDataSource.login(email, password, slug: slug);
      _apiClient.setToken(authTokens.accessToken);
      final profile = await _remoteDataSource.getProfile();
      return Right(UsuarioEntity(
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        companyId: profile.companyId,
        isOwner: profile.isOwner,
        roles: profile.roles,
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        expiresAt: authTokens.expiresAt,
        rolSistema: authTokens.rolSistema,
      ));
    } on UnauthorizedException {
      return Left(UnauthorizedFailure('Credenciales inválidas'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> logout(String refreshToken) async {
    try {
      await _remoteDataSource.logout(refreshToken);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, UsuarioEntity>> checkSession() async {
    try {
      final profile = await _remoteDataSource.getProfile();
      return Right(UsuarioEntity(
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        companyId: profile.companyId,
        isOwner: profile.isOwner,
        roles: profile.roles,
      ));
    } on UnauthorizedException {
      return Left(UnauthorizedFailure('Sesión expirada'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    }
  }
}
