class ServerException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;
  ServerException({required this.message, this.statusCode, this.code});
}

class NetworkException implements Exception {
  final String message;
  NetworkException({required this.message});
}

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException({required this.message});
}
