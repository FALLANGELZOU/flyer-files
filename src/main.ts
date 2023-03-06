import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './settings/HttpExceptionFilter';
import { HttpInterceptor } from './settings/HttpInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());  //  错误过滤器
  app.useGlobalInterceptors(new HttpInterceptor()); //  正常返回拦截器
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
