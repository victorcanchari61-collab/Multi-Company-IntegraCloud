import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../errors/exceptions.dart';

class ApiClient {
  final http.Client _client;
  String? _token;

  ApiClient(this._client);

  void setToken(String? token) {
    _token = token;
  }

  String? get token => _token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<dynamic> get(String endpoint, {Map<String, String>? queryParams}) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint')
          .replace(queryParameters: queryParams);
      final response = await _client
          .get(uri, headers: _headers)
          .timeout(ApiConstants.timeout);
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Sin conexión a internet');
    }
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
      final response = await _client
          .post(uri, headers: _headers, body: body != null ? jsonEncode(body) : null)
          .timeout(ApiConstants.timeout);
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Sin conexión a internet');
    }
  }

  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
      final response = await _client
          .put(uri, headers: _headers, body: body != null ? jsonEncode(body) : null)
          .timeout(ApiConstants.timeout);
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Sin conexión a internet');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
      final response = await _client
          .delete(uri, headers: _headers)
          .timeout(ApiConstants.timeout);
      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(message: 'Sin conexión a internet');
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode == 204) return null;

    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    if (response.statusCode == 401) {
      throw UnauthorizedException(
        message: body?['message'] ?? 'Sesión expirada',
      );
    }

    throw ServerException(
      message: body?['message'] ?? 'Error del servidor',
      statusCode: response.statusCode,
      code: body?['code'],
    );
  }

  void dispose() {
    _client.close();
  }
}
