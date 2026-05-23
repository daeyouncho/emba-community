process.env.JWT_SECRET = process.env.JWT_SECRET || 'emba-super-secret-jwt-key-2024';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'emba-refresh-secret-2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // 정적 파일 서빙 (/public → /)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`✅ EMBA 서버 + 웹앱 실행 중 → http://0.0.0.0:${port}`);
}
bootstrap();
