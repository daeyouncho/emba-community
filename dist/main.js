"use strict";
process.env.JWT_SECRET = process.env.JWT_SECRET || 'emba-super-secret-jwt-key-2024';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'emba-refresh-secret-2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const socket_io_1 = require("@nestjs/platform-socket.io");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const fs = require("fs");
const path_1 = require("path");

const HTML_PATH = path_1.join(__dirname, '..', 'public', 'index.html');

async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    
    // NestJS 앱 설정
    app.setGlobalPrefix('api/v1', { exclude: [{ path: '/', method: common_1.RequestMethod.GET }] });
    app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useWebSocketAdapter(new socket_io_1.IoAdapter(app));
    
    // NestJS init 완료 후 express 앱에 미들웨어 등록
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    
    // 기존 라우터 스택 맨 앞에 / 처리기 삽입
    expressApp.use((req, res, next) => {
        if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
            try {
                const html = fs.readFileSync(HTML_PATH, 'utf8');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.end(html);
            } catch(e) {
                return next(e);
            }
        }
        next();
    });
    
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port, '0.0.0.0');
    console.log(`✅ EMBA 서버+웹앱 → http://0.0.0.0:${port}`);
}
bootstrap();
