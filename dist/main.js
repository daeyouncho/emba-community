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
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useWebSocketAdapter(new socket_io_1.IoAdapter(app));

    const port = parseInt(process.env.PORT || '3000', 10);
    const server = await app.listen(port, '0.0.0.0');
    
    // 서버 시작 후 request 이벤트 핸들러를 맨 앞에 삽입
    const originalListeners = server.rawListeners('request');
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
        if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
            try {
                const html = fs.readFileSync(HTML_PATH, 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
                return;
            } catch(e) {}
        }
        // 나머지는 NestJS (express) 핸들러로
        for (const listener of originalListeners) {
            listener.call(server, req, res);
        }
    });
    
    console.log(`✅ EMBA 서버+웹앱 → http://0.0.0.0:${port}`);
}
bootstrap();
