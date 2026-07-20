class UsuarioEntity {
  final String id;
  final String email;
  final String fullName;
  final String? companyId;
  final bool isOwner;
  final List<String> roles;
  final String? accessToken;
  final String? refreshToken;
  final DateTime? expiresAt;
  final String? rolSistema;

  UsuarioEntity({
    required this.id,
    required this.email,
    required this.fullName,
    this.companyId,
    this.isOwner = false,
    this.roles = const [],
    this.accessToken,
    this.refreshToken,
    this.expiresAt,
    this.rolSistema,
  });

  bool get isAuthenticated => accessToken != null;
}
