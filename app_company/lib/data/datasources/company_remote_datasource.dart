import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../models/company_branding_model.dart';

class CompanyRemoteDataSource {
  final ApiClient _apiClient;
  CompanyRemoteDataSource(this._apiClient);

  Future<CompanyBrandingModel> getBranding(String slug) async {
    final response = await _apiClient.get(ApiConstants.companyBranding(slug));
    return CompanyBrandingModel.fromJson(response);
  }
}
