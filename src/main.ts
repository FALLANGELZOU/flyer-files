import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './settings/HttpExceptionFilter';
import { HttpInterceptor } from './settings/HttpInterceptor';
import { getImageFromOther } from './utils/imageUtils';
import * as http from 'http'
import { NextFunction, Request, Response } from 'express';
import { ObjectUtils } from './utils/commonUtils';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());  //  错误过滤器
  app.useGlobalInterceptors(new HttpInterceptor()); //  正常返回拦截器
  app.enableCors();
  await app.listen(3001);
  init(app)

}
bootstrap();


const init = (app: INestApplication) => {
  const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = app.getHttpServer()
  let item = []

  server.on("request", (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => {
    
    // item.push(req)
    
    // if (item.length == 2) {
    //   const a = item[0]
    //   const b = item[1]
    //   item = []
    //   setTimeout(() => {
    //     console.log(a,b);
        
    //     //console.log(new ObjectUtils().isObjectChanged(a, b))

    //   }, 1000)
      
    // }
    

  })

  server.on("error", (err) => {
    console.log(err);
    
  })

  server.on("clientError", (err, socket) => {
    console.log(err);
    
  })
  
}




