class AuthTokensModel {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final List<String>? allRestrictions;
  final String? rolSistema;
  final List<String>? authGrants;

  AuthTokensModel({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    this.allRestrictions,
    this.rolSistema,
    this.authGrants,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      allRestrictions: (json['allRestrictions'] as List?)?.cast<String>(),
      rolSistema: json['rolSistema'] as String?,
      authGrants: (json['authGrants'] as List?)?.cast<String>(),
    );
  }
}
