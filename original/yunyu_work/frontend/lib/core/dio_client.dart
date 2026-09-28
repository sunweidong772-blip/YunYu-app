import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;
  DioClient._internal();

  late Dio _dio;

  Future<void> init() async {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    // 拦截器：自动添加token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        // 统一错误处理
        String message = '网络错误，请稍后重试';
        if (error.response?.data != null) {
          final data = error.response!.data;
          if (data is Map && data['message'] != null) {
            message = data['message'].toString();
          }
        } else if (error.type == DioExceptionType.connectionTimeout) {
          message = '连接超时，请检查网络';
        } else if (error.type == DioExceptionType.receiveTimeout) {
          message = '响应超时，请稍后重试';
        }
        handler.next(DioException(
          requestOptions: error.requestOptions,
          response: error.response,
          error: message,
          type: error.type,
        ));
      },
    ));
  }

  Dio get dio => _dio;

  // 通用请求方法
  Future<Map<String, dynamic>> request(String method, String path, {Map<String, dynamic>? data, Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.request(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(method: method),
      );
      final result = response.data;
      if (result is Map && result['code'] != 0) {
        throw Exception(result['message'] ?? '请求失败');
      }
      return result is Map ? Map<String, dynamic>.from(result) : {'data': result};
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? queryParameters}) =>
      request('GET', path, queryParameters: queryParameters);

  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? data}) =>
      request('POST', path, data: data);

  Future<Map<String, dynamic>> patch(String path, {Map<String, dynamic>? data}) =>
      request('PATCH', path, data: data);

  Future<Map<String, dynamic>> delete(String path) =>
      request('DELETE', path);

  // 上传文件
  Future<String> uploadFile(String path, String filePath, String fieldName) async {
    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post(path, data: formData);
    final result = response.data;
    if (result is Map && result['code'] == 0) {
      return result['data']['url'].toString();
    }
    throw Exception(result['message'] ?? '上传失败');
  }
}
