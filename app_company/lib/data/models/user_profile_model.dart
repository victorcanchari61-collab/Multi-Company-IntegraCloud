class UserProfileModel {
  final String id;
  final String email;
  final String fullName;
  final String? companyId;
  final bool isOwner;
  final List<String> roles;
  final List<String> allRestrictions;
  final String? rolSistema;
  final List<String>? authGrants;
  final String? roleName;

  UserProfileModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.companyId,
    required this.isOwner,
    this.roles = const [],
    this.allRestrictions = const [],
    this.rolSistema,
    this.authGrants,
    this.roleName,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    return UserProfileModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      companyId: json['companyId'] as String?,
      isOwner: json['isOwner'] as bool? ?? false,
      roles: (json['roles'] as List?)?.cast<String>() ?? [],
      allRestrictions: (json['allRestrictions'] as List?)?.cast<String>() ?? [],
      rolSistema: json['rolSistema'] as String?,
      authGrants: (json['authGrants'] as List?)?.cast<String>(),
      roleName: json['roleName'] as String?,
    );
  }
}
