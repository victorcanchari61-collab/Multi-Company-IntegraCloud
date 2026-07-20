import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../models/auth_tokens_model.dart';
import '../models/user_profile_model.dart';

class AuthRemoteDataSource {
  final ApiClient _apiClient;
  AuthRemoteDataSource(this._apiClient);

  Future<AuthTokensModel> login(String email, String password, {String? slug}) async {
    final response = await _apiClient.post(ApiConstants.login, body: {
      'email': email,
      'password': password,
      if (slug != null) 'slug': slug, // ignore: use_null_aware_elements
    });
    return AuthTokensModel.fromJson(response);
  }

  Future<AuthTokensModel> refreshToken(String refreshToken) async {
    final response = await _apiClient.post(ApiConstants.refresh, body: {
      'refreshToken': refreshToken,
    });
    return AuthTokensModel.fromJson(response);
  }

  Future<void> logout(String refreshToken) async {
    await _apiClient.post(ApiConstants.logout, body: {
      'refreshToken': refreshToken,
    });
  }

  Future<UserProfileModel> getProfile() async {
    final response = await _apiClient.get(ApiConstants.me);
    return UserProfileModel.fromJson(response);
  }

  Future<List<String>> getPermissions() async {
    final response = await _apiClient.get(ApiConstants.myPermissions);
    return List<String>.from(response);
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _apiClient.post(ApiConstants.changePassword, body: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }
}
