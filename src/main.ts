import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ErrorLogService } from './error-log/error-log.service';  
import { ApiLoggingInterceptor } from './Global/interceptors/api-logging.interceptor';
import { HttpExceptionFilter } from './Global/filters/http-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LogExceptionFilter } from './Global/filters/log-exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const errorMessages = errors.map(
        (error) => error.constraints 
          ? Object.values(error.constraints).join(', ')
          : 'Unknown validation error'
      );
      throw new BadRequestException({
        resp_code: 400,
        resp_message: 'Validation Failed',
        errors: errorMessages,
      });
    }
  }));
  const errorLogService = app.get(ErrorLogService);
  app.useGlobalInterceptors(new ApiLoggingInterceptor(errorLogService));
  app.useGlobalFilters(new HttpExceptionFilter(errorLogService));
  // app.useGlobalFilters(new LogExceptionFilter(errorLogService));

  const config = new DocumentBuilder()
  .setTitle('MINOMP')
  .setDescription('API documentation for MINOMP endpoints')
  .setVersion('1.0')
  .addTag('MINOMP Users')
  .setBasePath('MINOMP-users') // For Swagger's base path
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger available at /api

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT}`);
}
bootstrap();
