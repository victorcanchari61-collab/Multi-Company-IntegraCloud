import 'package:http/http.dart' as http;
import 'core/network/api_client.dart';
import 'presentation/providers/auth_provider.dart';

ApiClient createApiClient() => ApiClient(http.Client());

AuthProvider createAuthProvider(ApiClient apiClient) => AuthProvider(apiClient);
