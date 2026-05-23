"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'emba-super-secret-jwt-key-2024';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'emba-refresh-secret-2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port, '0.0.0.0');
    console.log(`✅ EMBA 서버 + 웹앱 실행 중 → http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map