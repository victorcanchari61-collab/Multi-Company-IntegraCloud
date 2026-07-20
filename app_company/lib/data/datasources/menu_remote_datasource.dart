import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../models/menu_models.dart';

class MenuRemoteDataSource {
  final ApiClient _apiClient;
  MenuRemoteDataSource(this._apiClient);

  Future<List<MenuSystemModel>> getMenu() async {
    final response = await _apiClient.get(ApiConstants.menu);
    return (response as List)
        .map((e) => MenuSystemModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
